export const PLANT_CATEGORIES = ['Pangan', 'Hortikultura', 'Perkebunan', 'Lainnya']

export const GROWTH_STATUSES = ['Baru Ditanam', 'Vegetatif', 'Generatif', 'Panen']

export const STATUS_META = {
  'Baru Ditanam': { className: 'status-new', label: 'Baru Ditanam' },
  Vegetatif: { className: 'status-vegetative', label: 'Vegetatif' },
  Generatif: { className: 'status-generative', label: 'Generatif' },
  Panen: { className: 'status-harvest', label: 'Panen' },
}

export const EMPTY_PLANT_FORM = {
  name: '',
  scientific_name: '',
  category: 'Pangan',
  variety: '',
  planting_date: '',
  location: '',
  growth_status: 'Baru Ditanam',
  notes: '',
}