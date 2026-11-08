import { Navigate, Route, Routes } from 'react-router-dom'
import BottomNavigation from './components/layout/BottomNavigation'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import PlantDetail from './pages/PlantDetail'
import Plants from './pages/Plants'
import Profile from './pages/Profile'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-column">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/plants/:id" element={<PlantDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <BottomNavigation />
    </div>
  )
}