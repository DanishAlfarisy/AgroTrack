import { before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import 'fake-indexeddb/auto'

let enqueueMutation
let getCachedPlant
let getCachedPlants
let getQueueCount
let getSyncQueue
let markQueueItemInFlight
let markQueueItemFailed
let removeQueueItem

before(async () => {
  const database = await import('../src/db/indexedDB.js')
  enqueueMutation = database.enqueueMutation
  getCachedPlant = database.getCachedPlant
  getCachedPlants = database.getCachedPlants
  getQueueCount = database.getQueueCount
  getSyncQueue = database.getSyncQueue
  markQueueItemInFlight = database.markQueueItemInFlight
  markQueueItemFailed = database.markQueueItemFailed
  removeQueueItem = database.removeQueueItem
})

function createPlant(id, overrides = {}) {
  const timestamp = new Date().toISOString()
  return {
    id,
    name: `Tanaman ${id}`,
    scientific_name: null,
    category: 'Pangan',
    variety: null,
    planting_date: null,
    location: null,
    growth_status: 'Baru Ditanam',
    notes: null,
    created_at: timestamp,
    updated_at: timestamp,
    ...overrides,
  }
}

describe('IndexedDB offline mutation queue', () => {
  it('compacts create followed by update into one create with the latest payload', async () => {
    const plant = createPlant('test-create-update')
    await enqueueMutation('create', plant.id, plant)
    await enqueueMutation('update', plant.id, { ...plant, name: 'Nama terbaru' })

    const queued = (await getSyncQueue()).filter((item) => item.plantId === plant.id)
    assert.equal(queued.length, 1)
    assert.equal(queued[0].operation, 'create')
    assert.equal(queued[0].payload.name, 'Nama terbaru')
    assert.equal((await getCachedPlant(plant.id))._syncStatus, 'pending_create')
  })

  it('cancels create followed by delete before sync starts', async () => {
    const plant = createPlant('test-create-delete')
    await enqueueMutation('create', plant.id, plant)
    await enqueueMutation('delete', plant.id)

    assert.equal((await getSyncQueue()).some((item) => item.plantId === plant.id), false)
    assert.equal(await getCachedPlant(plant.id), undefined)
  })

  it('keeps a delete after an in-flight create so remote order remains correct', async () => {
    const plant = createPlant('test-inflight-create-delete')
    await enqueueMutation('create', plant.id, plant)
    const [created] = (await getSyncQueue()).filter((item) => item.plantId === plant.id)
    assert.ok(await markQueueItemInFlight(created.queueId, created.revision))
    await enqueueMutation('delete', plant.id)

    const [queued] = (await getSyncQueue()).filter((item) => item.plantId === plant.id)
    assert.equal(queued.operation, 'delete')
    assert.equal(await getCachedPlant(plant.id), undefined)
  })

  it('compacts update followed by delete into one delete', async () => {
    const plant = createPlant('test-update-delete')
    await enqueueMutation('update', plant.id, plant)
    await enqueueMutation('delete', plant.id)

    const queued = (await getSyncQueue()).filter((item) => item.plantId === plant.id)
    assert.equal(queued.length, 1)
    assert.equal(queued[0].operation, 'delete')
    assert.equal(await getCachedPlant(plant.id), undefined)
  })

  it('preserves an edit made while an older payload is in flight', async () => {
    const plant = createPlant('test-revision-race')
    await enqueueMutation('update', plant.id, plant)
    const [original] = (await getSyncQueue()).filter((item) => item.plantId === plant.id)
    await markQueueItemInFlight(original.queueId, original.revision)
    await enqueueMutation('update', plant.id, { ...plant, name: 'Edit saat request berjalan' })

    assert.equal(await removeQueueItem(original.queueId, original.revision), false)
    const [latest] = (await getSyncQueue()).filter((item) => item.plantId === plant.id)
    assert.notEqual(latest.revision, original.revision)
    assert.equal(latest.payload.name, 'Edit saat request berjalan')
    assert.equal((await getCachedPlant(plant.id)).name, 'Edit saat request berjalan')
  })

  it('clears an in-flight lease after a failed sync and keeps the queue', async () => {
    const plant = createPlant('test-failed-sync')
    await enqueueMutation('create', plant.id, plant)
    const [item] = (await getSyncQueue()).filter((entry) => entry.plantId === plant.id)
    await markQueueItemInFlight(item.queueId, item.revision)
    await markQueueItemFailed(item.queueId, 'network unavailable')

    const [retry] = (await getSyncQueue()).filter((entry) => entry.plantId === plant.id)
    assert.equal(retry.inFlight, false)
    assert.equal(retry.attempts, 1)
    assert.equal(retry.lastError, 'network unavailable')
    assert.ok((await getCachedPlants()).some((entry) => entry.id === plant.id))
    assert.ok((await getQueueCount()) >= 1)
  })
})