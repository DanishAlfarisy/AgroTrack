import { Leaf, MapPin, Sprout, UserRound } from 'lucide-react'

export default function Profile() {
  return (
    <div className="page-stack profile-page">
      <section className="page-intro"><div><span className="eyebrow">TENTANG PENGGUNA</span><h2>Profil mahasiswa</h2><p>Informasi pemilik ruang tumbuh AgroTrack.</p></div></section>
      <section className="profile-header">
        <div className="profile-avatar">DA<span className="avatar-leaf"><Leaf size={16} /></span></div>
        <div className="profile-heading"><span className="eyebrow">MAHASISWA</span><h2>Danish Alfarisy</h2><p><MapPin size={15} /> Pengelola kebun · Kelompok 10</p></div>
        <span className="profile-status"><span /> Mahasiswa</span>
      </section>
      <section className="profile-info-section"><div className="section-heading"><div><span className="eyebrow">INFORMASI AKADEMIK</span><h2>Data mahasiswa</h2></div></div><div className="profile-info-grid">
        <article><span className="profile-info-icon"><UserRound size={19} /></span><div><small>Nama lengkap</small><strong>Danish Alfarisy</strong></div></article>
        <article><span className="profile-info-icon"><span className="nim-icon">ID</span></span><div><small>Nomor induk mahasiswa</small><strong>21120124120006</strong></div></article>
        <article><span className="profile-info-icon"><Sprout size={19} /></span><div><small>Kelompok</small><strong>10</strong></div></article>
        <article><span className="profile-info-icon"><Leaf size={19} /></span><div><small>Shift praktikum</small><strong>2</strong></div></article>
      </div></section>
      <section className="about-app-section"><span className="about-app-mark"><Sprout size={25} /></span><div><span className="eyebrow">TENTANG APLIKASI</span><h2>AgroTrack</h2><p>AgroTrack membantu mencatat perjalanan budidaya tanaman: dari tanggal tanam, lokasi, hingga tahap pertumbuhan. Data tetap bisa dibuka dan diperbarui saat offline, lalu disinkronkan ketika koneksi kembali tersedia.</p><span className="about-version">Progressive Web App · Versi 1.0.0</span></div></section>
    </div>
  )
}