import { LayoutDashboard, Leaf, Sprout, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/plants', label: 'Data Tanaman', icon: Leaf },
  { to: '/profile', label: 'Profil', icon: UserRound },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Sprout size={25} /></span>
        <span><strong>AgroTrack</strong><small>Plant Management</small></span>
      </div>
      <nav className="sidebar-nav" aria-label="Navigasi utama">
        <p className="nav-label">MENU UTAMA</p>
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-tip">
        <span className="tip-icon"><Leaf size={18} /></span>
        <div><strong>Kelola lebih mudah</strong><p>Data tetap tersedia meski tanpa koneksi.</p></div>
      </div>
      <p className="sidebar-version">AgroTrack v1.0.0</p>
    </aside>
  )
}