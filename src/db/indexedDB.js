import { openDB } from 'idb'

const DATABASE_NAME = 'agrotrack-db'
const DATABASE_VERSION = 1
const PLANTS_STORE = 'plants'
const QUEUE_STORE = 'syncQueue'

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(PLANTS_STORE)) {
      const plantsStore = database.createObjectStore(PLANTS_STORE, { keyPath: 'id' })
      plantsStore.createIndex('created_at', 'created_at')
    }

    if (!database.objectStoreNames.contains(QUEUE_STORE)) {
      const queueStore = database.createObjectStore(QUEUE_STORE, { keyPath: 'queueId' })
      queueStore.createIndex('plantId', 'plantId', { unique: true })
      queueStore.createIndex('queuedAt', 'queuedAt')
    }
  },
})

export async function getCachedPlants() {
  const database = await dbPromise
  const plants = await database.getAll(PLANTS_STORE)
  return plants.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function getCachedPlant(id) {
  const database = await dbPromise
  return database.get(PLANTS_STORE, id)
}

export async function saveCachedPlant(plant) {
  const database = await dbPromise
  await database.put(PLANTS_STORE, plant)
  return plant
}

export async function removeCachedPlant(id) {
  const database = await dbPromise
  await database.delete(PLANTS_STORE, id)
}

export async function replaceCacheWithRemote(remotePlants) {
  const database = await dbPromise
  const transaction = database.transaction([PLANTS_STORE, QUEUE_STORE], 'readwrite')
  const queueItems = await transaction.objectStore(QUEUE_STORE).getAll()
  const merged = new Map(remotePlants.map((plant) => [plant.id, { ...plant, _syncStatus: 'synced' }]))

  queueItems
    .sort((a, b) => a.queuedAt - b.queuedAt)
    .forEach((item) => {
      if (item.operation === 'delete') {
        merged.delete(item.plantId)
      } else {
        merged.set(item.plantId, { ...item.payload, _syncStatus: `pending_${item.operation}` })
      }
    })

  const plantsStore = transaction.objectStore(PLANTS_STORE)
  await Promise.all([
    plantsStore.clear(),
    ...[...merged.values()].map((plant) => plantsStore.put(plant)),
  ])
  await transaction.done
  return [...merged.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function enqueueMutation(operation, plantId, payload = null) {
  const database = await dbPromise
  const transaction = database.transaction([PLANTS_STORE, QUEUE_STORE], 'readwrite')
  const queueStore = transaction.objectStore(QUEUE_STORE)
  const plantStore = transaction.objectStore(PLANTS_STORE)
  const existing = await queueStore.index('plantId').get(plantId)
  const now = Date.now()

  if (operation === 'delete' && existing?.operation === 'create' && !existing.inFlight) {
    await queueStore.delete(existing.queueId)
    await plantStore.delete(plantId)
    await transaction.done
    return null
  }

  let nextOperation = operation
  let nextPayload = payload

  if (existing?.operation === 'create' && operation === 'update') {
    nextOperation = 'create'
    nextPayload = { ...existing.payload, ...payload }
  } else if (existing?.operation === 'update' && operation === 'update') {
    nextPayload = { ...existing.payload, ...payload }
  }

  const queueItem = {
    queueId: existing?.queueId ?? `${plantId}:${now}`,
    plantId,
    operation: nextOperation,
    payload: nextOperation === 'delete' ? null : nextPayload,
    queuedAt: existing?.queuedAt ?? now,
    updatedAt: now,
    attempts: existing?.attempts ?? 0,
    lastError: null,
    inFlight: false,
    revision: `${now}:${Math.random()}`,
  }

  if (existing && nextOperation === 'delete') queueItem.queuedAt = existing.queuedAt
  await queueStore.put(queueItem)

  if (nextOperation === 'delete') {
    await plantStore.delete(plantId)
  } else {
    await plantStore.put({ ...nextPayload, _syncStatus: `pending_${nextOperation}` })
  }

  await transaction.done
  return queueItem
}

export async function getSyncQueue() {
  const database = await dbPromise
  const items = await database.getAll(QUEUE_STORE)
  return items.sort((a, b) => a.queuedAt - b.queuedAt)
}

export async function markQueueItemInFlight(queueId, expectedRevision) {
  const database = await dbPromise
  const transaction = database.transaction(QUEUE_STORE, 'readwrite')
  const queueStore = transaction.objectStore(QUEUE_STORE)
  const item = await queueStore.get(queueId)
  if (
    !item ||
    item.revision !== expectedRevision ||
    (item.inFlight && item.inFlightUntil > Date.now())
  ) {
    await transaction.done
    return null
  }

  const marked = { ...item, inFlight: true, inFlightUntil: Date.now() + 60_000 }
  await queueStore.put(marked)
  await transaction.done
  return marked
}

export async function getQueueCount() {
  const database = await dbPromise
  return database.count(QUEUE_STORE)
}

export async function removeQueueItem(queueId, expectedRevision) {
  const database = await dbPromise
  const transaction = database.transaction([PLANTS_STORE, QUEUE_STORE], 'readwrite')
  const queueStore = transaction.objectStore(QUEUE_STORE)
  const item = await queueStore.get(queueId)
  if (!item || item.revision !== expectedRevision) {
    await transaction.done
    return false
  }
  if (item?.operation === 'delete') {
    await transaction.objectStore(PLANTS_STORE).delete(item.plantId)
  } else if (item?.payload) {
    await transaction.objectStore(PLANTS_STORE).put({ ...item.payload, _syncStatus: 'synced' })
  }
  await queueStore.delete(queueId)
  await transaction.done
  return true
}

export async function markQueueItemFailed(queueId, errorMessage) {
  const database = await dbPromise
  const item = await database.get(QUEUE_STORE, queueId)
  if (!item) return
  await database.put(QUEUE_STORE, {
    ...item,
    inFlight: false,
    inFlightUntil: 0,
    attempts: item.attempts + 1,
    lastError: errorMessage,
    updatedAt: Date.now(),
  })
}