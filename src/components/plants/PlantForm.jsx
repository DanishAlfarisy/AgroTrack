import { useState } from 'react'
import { CalendarDays, Leaf, MapPin, Sprout, X } from 'lucide-react'
import { EMPTY_PLANT_FORM, GROWTH_STATUSES, PLANT_CATEGORIES } from '../../constants/plants'
import { validatePlant } from '../../utils/plants'

export default function PlantForm({ plant, onSubmit, onClose }) {
  const [values, setValues] = useState(() => plant ? { ...EMPTY_PLANT_FORM, ...plant } : EMPTY_PLANT_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validatePlant(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    setSaving(true)
    try {
      await onSubmit(values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="plant-form-title">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon"><Sprout size={22} /></span>
            <div><h2 id="plant-form-title">{plant ? 'Edit tanaman' : 'Tambah tanaman'}</h2><p>Lengkapi informasi budidaya di bawah ini.</p></div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Tutup form"><X size={20} /></button>
        </div>
        <form className="plant-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <label className="form-field field-full">
              <span>Nama tanaman <em>*</em></span>
              <input autoFocus name="name" value={values.name} onChange={updateField} placeholder="Contoh: Tomat ceri" maxLength={100} aria-invalid={Boolean(errors.name)} />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>
            <label className="form-field">
              <span>Nama ilmiah</span>
              <input name="scientific_name" value={values.scientific_name || ''} onChange={updateField} placeholder="Contoh: Solanum lycopersicum" maxLength={150} />
            </label>
            <label className="form-field">
              <span>Varietas</span>
              <input name="variety" value={values.variety || ''} onChange={updateField} placeholder="Contoh: Servo F1" maxLength={100} />
            </label>
            <label className="form-field">
              <span>Kategori <em>*</em></span>
              <select name="category" value={values.category} onChange={updateField} aria-invalid={Boolean(errors.category)}>
                {PLANT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
              {errors.category && <small className="field-error">{errors.category}</small>}
            </label>
            <label className="form-field">
              <span>Status pertumbuhan <em>*</em></span>
              <select name="growth_status" value={values.growth_status} onChange={updateField} aria-invalid={Boolean(errors.growth_status)}>
                {GROWTH_STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
              {errors.growth_status && <small className="field-error">{errors.growth_status}</small>}
            </label>
            <label className="form-field">
              <span>Tanggal tanam</span>
              <span className="input-with-icon"><CalendarDays size={17} /><input type="date" name="planting_date" value={values.planting_date || ''} onChange={updateField} aria-invalid={Boolean(errors.planting_date)} /></span>
              {errors.planting_date && <small className="field-error">{errors.planting_date}</small>}
            </label>
            <label className="form-field">
              <span>Lokasi penanaman</span>
              <span className="input-with-icon"><MapPin size={17} /><input name="location" value={values.location || ''} onChange={updateField} placeholder="Contoh: Kebun belakang" maxLength={150} /></span>
            </label>
            <label className="form-field field-full">
              <span>Catatan</span>
              <textarea name="notes" value={values.notes || ''} onChange={updateField} placeholder="Tambahkan catatan perawatan atau pengamatan…" rows={3} maxLength={1000} />
              <small className="field-hint">{(values.notes || '').length}/1000</small>
              {errors.notes && <small className="field-error">{errors.notes}</small>}
            </label>
          </div>
          <div className="form-footer">
            <span className="required-note"><em>*</em> Wajib diisi</span>
            <div className="form-actions">
              <button type="button" className="button button-ghost" onClick={onClose} disabled={saving}>Batal</button>
              <button type="submit" className="button button-primary" disabled={saving}>
                <Leaf size={17} /> {saving ? 'Menyimpan…' : plant ? 'Simpan perubahan' : 'Simpan tanaman'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}