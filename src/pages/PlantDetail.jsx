import { useState } from 'react'
import { ArrowLeft, CalendarDays, Clock3, Leaf, MapPin, Pencil, Sprout } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Loading from '../components/common/Loading'
import PlantForm from '../components/plants/PlantForm'
import { STATUS_META } from '../constants/plants'
import usePlants from '../hooks/usePlants'
import useToast from '../hooks/useToast'
import { formatDate, getInitials } from '../utils/plants'

export default function PlantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { plants, loading, updatePlant } = usePlants()
  const { showToast } = useToast()
  const [showEdit, setShowEdit] = useState(false)
  const plant = plants.find((item) => item.id === id)

  const handleUpdate = async (values) => {
    try {
      const result = await updatePlant(id, values)
      showToast(result.synced ? 'Data tanaman berhasil diperbarui.' : 'Perubahan tersimpan dan menunggu sinkronisasi.', 'success')
      setShowEdit(false)
    } catch (error) {
      showToast(error.message || 'Data tanaman gagal diperbarui.', 'error')
    }
  }

  if (loading) return <Loading />
  if (!plant) return <div className="detail-not-found"><span className="empty-icon"><Leaf size={26} /></span><h2>Tanaman tidak ditemukan</h2><p>Data ini mungkin sudah dihapus atau belum tersedia di perangkat.</p><Link className="button button-primary" to="/plants"><ArrowLeft size={17} /> Kembali ke tanaman</Link></div>

  const status = STATUS_META[plant.growth_status] || STATUS_META['Baru Ditanam']
  return (
    <div className="page-stack detail-page">
      <Link className="back-link" to="/plants"><ArrowLeft size={17} /> Kembali ke data tanaman</Link>
      <section className="detail-hero">
        <div className="detail-plant-avatar">{getInitials(plant.name)}</div>
        <div className="detail-hero-copy"><span className="eyebrow">{plant.category || 'Tanaman'}</span><h2>{plant.name}</h2><p className="detail-scientific">{plant.scientific_name || 'Nama ilmiah belum diisi'}{plant.variety ? ` · ${plant.variety}` : ''}</p><span className={`status-badge ${status.className}`}>{status.label}</span></div>
        <button type="button" className="button button-primary detail-edit-button" onClick={() => setShowEdit(true)}><Pencil size={17} /> Edit tanaman</button>
      </section>
      {plant._syncStatus && plant._syncStatus !== 'synced' && <div className="setup-banner"><span className="setup-dot" /> Perubahan tanaman ini tersimpan di perangkat dan menunggu sinkronisasi.</div>}
      <section className="detail-section"><div className="section-heading"><div><span className="eyebrow">RINGKASAN TANAMAN</span><h2>Informasi budidaya</h2></div></div>
        <div className="detail-info-grid">
          <article className="detail-info-item"><span className="detail-info-icon"><Leaf size={19} /></span><div><small>Kategori</small><strong>{plant.category || 'Belum diisi'}</strong></div></article>
          <article className="detail-info-item"><span className="detail-info-icon"><Sprout size={19} /></span><div><small>Varietas</small><strong>{plant.variety || 'Belum diisi'}</strong></div></article>
          <article className="detail-info-item"><span className="detail-info-icon"><CalendarDays size={19} /></span><div><small>Tanggal tanam</small><strong>{formatDate(plant.planting_date)}</strong></div></article>
          <article className="detail-info-item"><span className="detail-info-icon"><MapPin size={19} /></span><div><small>Lokasi penanaman</small><strong>{plant.location || 'Belum diisi'}</strong></div></article>
          <article className="detail-info-item"><span className="detail-info-icon"><Clock3 size={19} /></span><div><small>Dicatat pada</small><strong>{formatDate(plant.created_at)}</strong></div></article>
          <article className="detail-info-item"><span className="detail-info-icon"><Clock3 size={19} /></span><div><small>Pembaruan terakhir</small><strong>{formatDate(plant.updated_at)}</strong></div></article>
        </div>
      </section>
      <section className="detail-section notes-section"><div className="section-heading"><div><span className="eyebrow">CATATAN</span><h2>Pengamatan & perawatan</h2></div></div><p className={plant.notes ? 'plant-notes' : 'muted-copy'}>{plant.notes || 'Belum ada catatan untuk tanaman ini.'}</p></section>
      {showEdit && <PlantForm key={plant.id} plant={plant} onSubmit={handleUpdate} onClose={() => setShowEdit(false)} />}
      <button type="button" className="sr-only" onClick={() => navigate('/plants')}>Kembali</button>
    </div>
  )
}