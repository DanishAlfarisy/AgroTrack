import { useMemo, useState } from 'react'
import { CirclePlus, FilterX, Leaf, Search, SlidersHorizontal } from 'lucide-react'
import PlantCard from '../components/plants/PlantCard'
import PlantForm from '../components/plants/PlantForm'
import DeleteConfirmation from '../components/plants/DeleteConfirmation'
import Loading from '../components/common/Loading'
import { GROWTH_STATUSES, PLANT_CATEGORIES } from '../constants/plants'
import usePlants from '../hooks/usePlants'
import useToast from '../hooks/useToast'

export default function Plants() {
  const { plants, loading, error, clearError, createPlant, updatePlant, deletePlant } = usePlants()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua kategori')
  const [status, setStatus] = useState('Semua status')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredPlants = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('id-ID')
    return plants.filter((plant) => {
      const matchesSearch = !normalizedSearch || [plant.name, plant.scientific_name, plant.variety, plant.location]
        .some((value) => String(value || '').toLocaleLowerCase('id-ID').includes(normalizedSearch))
      const matchesCategory = category === 'Semua kategori' || plant.category === category
      const matchesStatus = status === 'Semua status' || plant.growth_status === status
      return matchesSearch && matchesCategory && matchesStatus
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [plants, search, category, status])

  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (values) => {
    try {
      const result = editing ? await updatePlant(editing.id, values) : await createPlant(values)
      showToast(result.synced ? 'Data tanaman berhasil disimpan.' : 'Perubahan tersimpan di perangkat dan menunggu sinkronisasi.', 'success')
      closeForm()
    } catch (submitError) {
      showToast(submitError.message || 'Data tanaman gagal disimpan.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setIsDeleting(true)
    try {
      const result = await deletePlant(deleting.id)
      showToast(result.synced ? `${deleting.name} berhasil dihapus.` : `${deleting.name} dihapus dari perangkat dan menunggu sinkronisasi.`, 'success')
      setDeleting(null)
    } catch (deleteError) {
      showToast(deleteError.message || 'Tanaman gagal dihapus.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const clearFilters = () => { setSearch(''); setCategory('Semua kategori'); setStatus('Semua status') }
  const hasFilters = search || category !== 'Semua kategori' || status !== 'Semua status'

  return (
    <div className="page-stack plants-page">
      <section className="page-intro plants-intro"><div><span className="eyebrow">KEBUN SAYA</span><h2>Semua tanaman</h2><p>Kelola dan pantau setiap tanaman dalam satu tempat.</p></div><button type="button" className="button button-primary" onClick={() => setShowForm(true)}><CirclePlus size={18} /> Tambah tanaman</button></section>
      {error && <div className="inline-alert" role="alert"><span>{error}</span><button type="button" onClick={clearError}>Tutup</button></div>}
      <section className="plant-toolbar" aria-label="Pencarian dan filter tanaman">
        <label className="search-box"><Search size={19} /><input type="search" placeholder="Cari nama, varietas, lokasi…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Cari tanaman" />{search && <button type="button" className="search-clear" onClick={() => setSearch('')} aria-label="Hapus pencarian"><FilterX size={16} /></button>}</label>
        <span className="filter-divider" />
        <span className="filter-label"><SlidersHorizontal size={16} /> Filter</span>
        <select aria-label="Filter kategori" value={category} onChange={(event) => setCategory(event.target.value)}><option>Semua kategori</option>{PLANT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter status pertumbuhan" value={status} onChange={(event) => setStatus(event.target.value)}><option>Semua status</option>{GROWTH_STATUSES.map((item) => <option key={item}>{item}</option>)}</select>
        {hasFilters && <button type="button" className="reset-filter" onClick={clearFilters}>Reset</button>}
      </section>
      <div className="results-caption"><span>{loading ? 'Memuat tanaman…' : <><strong>{filteredPlants.length}</strong> tanaman ditemukan</>}</span><span>Data tersimpan otomatis di perangkat</span></div>

      {loading ? <Loading /> : error && plants.length === 0 ? <div className="error-state"><Leaf size={28} /><strong>Data belum dapat dimuat</strong><p>Data lokal tetap aman. Periksa koneksi atau konfigurasi Supabase lalu coba kembali.</p></div> : filteredPlants.length ? <div className="plant-grid">{filteredPlants.map((plant) => <PlantCard key={plant.id} plant={plant} onEdit={setEditing} onDelete={setDeleting} />)}</div> : plants.length === 0 ? <div className="empty-state plants-empty"><span className="empty-icon"><Leaf size={27} /></span><strong>Mulai koleksi tanaman Anda</strong><p>Tambahkan tanaman pertama agar catatan budidaya tersimpan rapi.</p><button type="button" className="button button-primary" onClick={() => setShowForm(true)}><CirclePlus size={17} /> Tambah tanaman</button></div> : <div className="empty-state plants-empty"><span className="empty-icon"><Search size={25} /></span><strong>Tidak ada hasil yang cocok</strong><p>Coba ubah kata kunci atau pilihan filter Anda.</p><button type="button" className="button button-secondary" onClick={clearFilters}>Hapus filter</button></div>}

      {(showForm || editing) && <PlantForm key={editing?.id || 'new-plant'} plant={editing} onSubmit={handleSubmit} onClose={closeForm} />}
      {deleting && <DeleteConfirmation plant={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} deleting={isDeleting} />}
    </div>
  )
}