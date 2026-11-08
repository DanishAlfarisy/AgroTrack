import { LayoutDashboard, Leaf, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/plants', label: 'Tanaman', icon: Leaf },
  { to: '/profile', label: 'Profil', icon: UserRound },
]

export default function BottomNavigation() {
  return (
    <nav className="bottom-navigation" aria-label="Navigasi mobile">
      {navigation.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <Icon size={21} /><span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}