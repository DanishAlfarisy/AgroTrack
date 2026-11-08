import { requireSupabase } from '../lib/supabase'
import { toDatabasePlant } from '../utils/plants'

const TABLE = 'plants'

export async function fetchRemotePlants() {
  const client = requireSupabase()
  const { data, error } = await client.from(TABLE).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function upsertRemotePlant(plant) {
  const client = requireSupabase()
  const { data, error } = await client
    .from(TABLE)
    .upsert(toDatabasePlant(plant), { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRemotePlant(id) {
  const client = requireSupabase()
  const { error } = await client.from(TABLE).delete().eq('id', id)
  if (error) throw error
  return id
}