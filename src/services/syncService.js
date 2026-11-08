import { getSyncQueue, markQueueItemFailed, markQueueItemInFlight, removeQueueItem, replaceCacheWithRemote } from '../db/indexedDB'
import { isSupabaseConfigured } from '../lib/supabase'
import { deleteRemotePlant, fetchRemotePlants, upsertRemotePlant } from './plantService'

let activeSync = null

export function synchronizePlants({ onProgress } = {}) {
  if (activeSync) return activeSync

  activeSync = runSynchronization(onProgress).finally(() => {
    activeSync = null
  })
  return activeSync
}

async function runSynchronization(onProgress) {
  if (!isSupabaseConfigured) {
    return { synced: 0, skipped: true, reason: 'not-configured' }
  }
  if (!navigator.onLine) {
    return { synced: 0, skipped: true, reason: 'offline' }
  }

  let synced = 0

  while (true) {
    const queue = await getSyncQueue()
    if (!queue.length) break

    let completedInPass = 0
    for (const item of queue) {
      const inFlight = await markQueueItemInFlight(item.queueId, item.revision)
      if (!inFlight) continue
      try {
        if (inFlight.operation === 'delete') {
          await deleteRemotePlant(inFlight.plantId)
        } else {
          await upsertRemotePlant(inFlight.payload)
        }
        const acknowledged = await removeQueueItem(inFlight.queueId, inFlight.revision)
        if (acknowledged) {
          synced += 1
          completedInPass += 1
          onProgress?.({ synced, total: queue.length })
        }
      } catch (error) {
        await markQueueItemFailed(inFlight.queueId, error.message || 'Sinkronisasi gagal')
        throw error
      }
    }

    if (!completedInPass) {
      const pending = await getSyncQueue()
      const hasAvailableWork = pending.some((item) => !item.inFlight || item.inFlightUntil <= Date.now())
      if (!hasAvailableWork) break
    }
  }

  try {
    const remotePlants = await fetchRemotePlants()
    const plants = await replaceCacheWithRemote(remotePlants)
    return { synced, skipped: false, plants }
  } catch (refreshError) {
    return { synced, skipped: false, refreshError }
  }
}