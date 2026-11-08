import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  enqueueMutation,
  getCachedPlants,
  getQueueCount,
} from '../db/indexedDB'
import useOnlineStatus from '../hooks/useOnlineStatus'
import { isSupabaseConfigured } from '../lib/supabase'
import { synchronizePlants } from '../services/syncService'
import { createPlantId, normalizePlantInput } from '../utils/plants'
import PlantContext from './plantContext'

export function PlantProvider({ children }) {
  const isOnline = useOnlineStatus()
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [queueCount, setQueueCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  const reloadLocalState = useCallback(async () => {
    const [cachedPlants, pendingCount] = await Promise.all([getCachedPlants(), getQueueCount()])
    setPlants(cachedPlants)
    setQueueCount(pendingCount)
    return cachedPlants
  }, [])

  const syncNow = useCallback(async () => {
    if (!isOnline || !isSupabaseConfigured) {
      await reloadLocalState()
      return { skipped: true, reason: !isOnline ? 'offline' : 'not-configured' }
    }

    setIsSyncing(true)
    setError('')
    try {
      const result = await synchronizePlants()
      await reloadLocalState()
      if (!result.skipped) setLastSyncedAt(new Date())
      return result
    } catch (syncError) {
      setError(syncError.message || 'Gagal menyinkronkan data dengan Supabase.')
      await reloadLocalState()
      throw syncError
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, reloadLocalState])

  useEffect(() => {
    let active = true
    async function initialize() {
      try {
        await reloadLocalState()
        if (active && navigator.onLine && isSupabaseConfigured) {
          await syncNow()
        }
      } catch (initialError) {
        if (active) setError(initialError.message || 'Data tanaman tidak dapat dimuat.')
      } finally {
        if (active) setLoading(false)
      }
    }
    initialize()
    return () => {
      active = false
    }
  }, [reloadLocalState, syncNow])

  useEffect(() => {
    if (!isOnline || loading || !isSupabaseConfigured) return
    const timer = window.setTimeout(() => syncNow().catch(() => {}), 0)
    return () => window.clearTimeout(timer)
  }, [isOnline, loading, syncNow])

  const createPlant = useCallback(
    async (values) => {
      const now = new Date().toISOString()
      const plant = {
        id: createPlantId(),
        ...normalizePlantInput(values),
        created_at: now,
        updated_at: now,
      }
      await enqueueMutation('create', plant.id, plant)
      await reloadLocalState()

      let synced = false
      if (isOnline && isSupabaseConfigured) {
        try {
          await syncNow()
          synced = true
        } catch {
          synced = false
        }
      }
      return { plant, synced }
    },
    [isOnline, reloadLocalState, syncNow],
  )

  const updatePlant = useCallback(
    async (id, values) => {
      const existing = plants.find((plant) => plant.id === id)
      if (!existing) throw new Error('Tanaman yang akan diubah tidak ditemukan.')

      const plant = {
        ...existing,
        ...normalizePlantInput(values),
        id,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
      }
      delete plant._syncStatus
      await enqueueMutation('update', id, plant)
      await reloadLocalState()

      let synced = false
      if (isOnline && isSupabaseConfigured) {
        try {
          await syncNow()
          synced = true
        } catch {
          synced = false
        }
      }
      return { plant, synced }
    },
    [isOnline, plants, reloadLocalState, syncNow],
  )

  const deletePlant = useCallback(
    async (id) => {
      if (!plants.some((plant) => plant.id === id)) throw new Error('Tanaman tidak ditemukan.')
      await enqueueMutation('delete', id)
      await reloadLocalState()

      let synced = false
      if (isOnline && isSupabaseConfigured) {
        try {
          await syncNow()
          synced = true
        } catch {
          synced = false
        }
      }
      return { id, synced }
    },
    [isOnline, plants, reloadLocalState, syncNow],
  )

  const value = useMemo(
    () => ({
      plants,
      loading,
      error,
      isOnline,
      isSyncing,
      queueCount,
      lastSyncedAt,
      isSupabaseConfigured,
      createPlant,
      updatePlant,
      deletePlant,
      syncNow,
      clearError: () => setError(''),
    }),
    [
      plants,
      loading,
      error,
      isOnline,
      isSyncing,
      queueCount,
      lastSyncedAt,
      createPlant,
      updatePlant,
      deletePlant,
      syncNow,
    ],
  )

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>
}