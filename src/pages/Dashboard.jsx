import { useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, CirclePlus, CloudOff, Leaf, Sprout, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import PlantForm from '../components/plants/PlantForm'
import Loading from '../components/common/Loading'
import { STATUS_META, GROWTH_STATUSES } from '../constants/plants'
import usePlants from '../hooks/usePlants'
import useToast from '../hooks/useToast'
import { formatDate, getInitials } from '../utils/plants'

function Greeting() {
  const hour = new Date().getHours()
  return hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam'
}

export default function Dashboard() {
  const { plants, loading, error, clearError, isOnline, queueCount, createPlant, isSupabaseConfigured } = usePlants()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [now] = useState(() => Date.now())
  const statusCounts = useMemo(() => GROWTH_STATUSES.map((status) => ({
    status,
    count: plants.filter((plant) => plant.growth_status === status).length,
  })), [plants])
  const recentPlants = plants.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4)
  const recentCount = plants.filter((plant) => now - new Date(plant.created_at).getTime() <= 7 * 86400000).length
  const newPlantCount = statusCounts.find((item) => item.status === 'Baru Ditanam')?.count || 0

  const handleCreate = async (values) => {
    try {
      const { synced } = await createPlant(values)
      showToast(synced ? 'Tanaman tersimpan dan tersinkronisasi.' : 'Tanaman tersimpan di perangkat dan menunggu sinkronisasi.', 'success')
      setShowForm(false)
    } catch (createError) {
      showToast(createError.message || 'Tanaman gagal disimpan.', 'error')
    }
  }

  return (
    <div className="page-stack dashboard-page">
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="eyebrow"><Sprout size={15} /> RUANG TUMBUH ANDA</span>
          <h2><Greeting />, Danish <span className="wave-mark">!</span></h2>
          <p>Setiap tanaman punya cerita. Pantau pertumbuhannya dan rawat dengan penuh perhatian.</p>
          <button type="button" className="button button-light" onClick={() => setShowForm(true)}><CirclePlus size={18} /> Tambah tanaman</button>
        </div>
        <div className="welcome-illustration" aria-hidden="true"><img src="/images/garden-illustration.svg" alt="" /></div>
      </section>

      {error && (
        <div className="inline-alert" role="alert"><CloudOff size={18} /><span>{error}</span><button type="button" onClick={clearError}>Tutup</button></div>
      )}
      {!isSupabaseConfigured && (
        <div className="setup-banner"><span className="setup-dot" /><span>Mode lokal aktif. Hubungkan Supabase melalui <code>.env</code> untuk sinkronisasi cloud.</span></div>
      )}

      {loading ? <Loading /> : (
        <>
          <section className="stats-grid" aria-label="Ringkasan tanaman">
            <article className="stat-card stat-total"><span className="stat-icon"><Leaf size={20} /></span><span className="stat-label">Total tanaman</span><strong>{plants.length}</strong><small><TrendingUp size={14} /> Koleksi saat ini</small></article>
            <article className="stat-card stat-new"><span className="stat-icon"><Sprout size={20} /></span><span className="stat-label">Baru ditanam</span><strong>{newPlantCount}</strong><small>Status pertumbuhan awal</small></article>
            <article className="stat-card stat-recent"><span className="stat-icon"><CalendarDays size={20} /></span><span className="stat-label">Ditambahkan 7 hari ini</span><strong>{recentCount}</strong><small>Tanaman baru tercatat</small></article>
          </section>

          <section className="growth-section">
            <div className="section-heading"><div><span className="eyebrow">RINGKASAN</span><h2>Perkembangan tanaman</h2></div><Link className="text-link" to="/plants">Lihat semua <ArrowRight size={16} /></Link></div>
            <div className="growth-grid">
              {statusCounts.map(({ status, count }, index) => {
                const meta = STATUS_META[status]
                const percent = plants.length ? Math.round((count / plants.length) * 100) : 0
                return <article className={`growth-item ${meta.className}`} key={status}>
                  <div className="growth-item-top"><span className="growth-step">0{index + 1}</span><span className="growth-value">{count}</span></div>
                  <strong>{status}</strong><div className="growth-meter"><span style={{ width: `${percent}%` }} /></div><small>{percent}% dari koleksi</small>
                </article>
              })}
            </div>
          </section>

          <section className="recent-section">
            <div className="section-heading"><div><span className="eyebrow">KOLEKSI TERBARU</span><h2>Tanaman terbaru</h2></div><Link className="text-link" to="/plants">Semua tanaman <ArrowRight size={16} /></Link></div>
            {recentPlants.length ? <div className="recent-list">{recentPlants.map((plant) => {
              const meta = STATUS_META[plant.growth_status] || STATUS_META['Baru Ditanam']
              return <Link className="recent-row" to={`/plants/${plant.id}`} key={plant.id}>
                <span className={`recent-avatar ${meta.className}`}>{getInitials(plant.name)}</span>
                <span className="recent-name"><strong>{plant.name}</strong><small>{plant.scientific_name || plant.category}</small></span>
                <span className={`status-badge ${meta.className}`}>{meta.label}</span>
                <span className="recent-date">{formatDate(plant.created_at, { day: 'numeric', month: 'short' })}</span>
                <ArrowRight size={16} className="recent-arrow" />
              </Link>
            })}</div> : <div className="empty-state compact-empty"><span className="empty-icon"><Leaf size={24} /></span><strong>Belum ada tanaman</strong><p>Catat tanaman pertama untuk mulai memantau koleksi Anda.</p><button className="button button-primary" onClick={() => setShowForm(true)}><CirclePlus size={17} /> Tambah tanaman</button></div>}
          </section>
          {!isOnline && <p className="offline-note"><CloudOff size={15} /> Menampilkan data terakhir yang tersimpan di perangkat.</p>}
        </>
      )}
      {showForm && <PlantForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {queueCount > 0 && <span className="sr-only">{queueCount} perubahan menunggu sinkronisasi.</span>}
    </div>
  )
}