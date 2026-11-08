import { CalendarDays, MapPin, MoreHorizontal, Pencil, Sprout, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STATUS_META } from '../../constants/plants'
import { formatShortDate, getInitials } from '../../utils/plants'

export default function PlantCard({ plant, onEdit, onDelete }) {
  const status = STATUS_META[plant.growth_status] || STATUS_META['Baru Ditanam']
  return (
    <article className="plant-card">
      <div className="plant-card-top">
        <span className={`plant-avatar plant-avatar-${status.className}`}><Sprout size={24} /></span>
        <div className="plant-card-menu">
          <details className="plant-menu-details">
            <summary className="icon-button menu-trigger" aria-label={`Aksi untuk ${plant.name}`} title="Aksi tanaman"><MoreHorizontal size={20} /></summary>
          <div className="plant-action-menu">
            <Link to={`/plants/${plant.id}`}>Lihat detail</Link>
            <button type="button" onClick={() => { onEdit(plant); }}><Pencil size={15} /> Edit</button>
            <button type="button" className="menu-delete" onClick={() => { onDelete(plant); }}><Trash2 size={15} /> Hapus</button>
          </div>
          </details>
        </div>
      </div>
      <Link to={`/plants/${plant.id}`} className="plant-card-title">
        <h3>{plant.name}</h3>
        <span className="plant-initials">{getInitials(plant.name)}</span>
      </Link>
      <p className="plant-scientific">{plant.scientific_name || 'Nama ilmiah belum diisi'}</p>
      <div className="plant-tags"><span className="category-tag">{plant.category}</span><span className={`status-badge ${status.className}`}>{status.label}</span></div>
      <div className="plant-card-meta">
        <span><CalendarDays size={15} /> {formatShortDate(plant.planting_date)}</span>
        <span><MapPin size={15} /> {plant.location || 'Lokasi belum diisi'}</span>
      </div>
      {plant._syncStatus && plant._syncStatus !== 'synced' && <div className="local-record-note"><span className="pending-dot" /> Menunggu sinkronisasi</div>}
    </article>
  )
}