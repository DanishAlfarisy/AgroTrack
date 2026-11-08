import { GROWTH_STATUSES, PLANT_CATEGORIES } from '../constants/plants'

const TEXT_FIELDS = ['name', 'scientific_name', 'variety', 'location', 'notes']

export function createPlantId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16)
    const value = character === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function normalizePlantInput(values) {
  const normalized = {}
  TEXT_FIELDS.forEach((field) => {
    normalized[field] = String(values[field] ?? '').trim()
  })

  normalized.category = PLANT_CATEGORIES.includes(values.category) ? values.category : 'Lainnya'
  normalized.growth_status = GROWTH_STATUSES.includes(values.growth_status)
    ? values.growth_status
    : 'Baru Ditanam'
  normalized.planting_date = values.planting_date || null

  return normalized
}

export function toDatabasePlant(plant) {
  return {
    id: plant.id,
    name: plant.name,
    scientific_name: plant.scientific_name || null,
    category: plant.category,
    variety: plant.variety || null,
    planting_date: plant.planting_date || null,
    location: plant.location || null,
    growth_status: plant.growth_status,
    notes: plant.notes || null,
    created_at: plant.created_at,
    updated_at: plant.updated_at,
  }
}

export function formatDate(value, options = {}) {
  if (!value) return 'Belum ditentukan'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak valid'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatShortDate(value) {
  return formatDate(value, { month: 'short' })
}

export function getInitials(name) {
  return String(name || 'AT')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function validatePlant(values) {
  const errors = {}
  if (!String(values.name || '').trim()) errors.name = 'Nama tanaman wajib diisi.'
  if (String(values.name || '').trim().length > 100) errors.name = 'Nama maksimal 100 karakter.'
  if (!PLANT_CATEGORIES.includes(values.category)) errors.category = 'Pilih kategori yang valid.'
  if (!GROWTH_STATUSES.includes(values.growth_status)) errors.growth_status = 'Pilih status yang valid.'

  if (values.planting_date) {
    const date = new Date(`${values.planting_date}T00:00:00`)
    if (Number.isNaN(date.getTime())) errors.planting_date = 'Tanggal tanam tidak valid.'
  }

  if (String(values.notes || '').length > 1000) errors.notes = 'Catatan maksimal 1000 karakter.'
  return errors
}