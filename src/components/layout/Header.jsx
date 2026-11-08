import { Download, RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import usePlants from '../../hooks/usePlants'
import useToast from '../../hooks/useToast'
import useInstallPrompt from '../../hooks/useInstallPrompt'
import OfflineIndicator from '../common/OfflineIndicator'

function getPageTitle(pathname) {
  if (pathname === '/') return ['Dashboard', 'Pantau aktivitas budidaya Anda']
  if (pathname === '/plants') return ['Data Tanaman', 'Kelola seluruh koleksi tanaman']
  if (pathname.startsWith('/plants/')) return ['Detail Tanaman', 'Informasi lengkap tanaman']
  if (pathname === '/profile') return ['Profil', 'Informasi mahasiswa dan aplikasi']
  return ['AgroTrack', 'Plant management']
}

export default function Header() {
  const location = useLocation()
  const [title, subtitle] = getPageTitle(location.pathname)
  const { isOnline, queueCount, isSyncing, syncNow } = usePlants()
  const { canInstall, promptInstall } = useInstallPrompt()
  const { showToast } = useToast()

  const handleSync = async () => {
    try {
      const result = await syncNow()
      showToast(result.synced ? `${result.synced} perubahan berhasil disinkronkan.` : 'Data sudah sinkron.', 'success')
    } catch (error) {
      showToast(error.message || 'Sinkronisasi gagal.', 'error')
    }
  }

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) showToast('AgroTrack berhasil ditambahkan ke perangkat.', 'success')
  }

  return (
    <header className="app-header">
      <div className="mobile-brand"><span className="brand-mark"><RefreshCw size={20} /></span><strong>AgroTrack</strong></div>
      <div className="header-title"><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="header-actions">
        <OfflineIndicator
          isOnline={isOnline}
          queueCount={queueCount}
          isSyncing={isSyncing}
          onSync={handleSync}
        />
        {canInstall && (
          <button type="button" className="button button-secondary install-button" onClick={handleInstall}>
            <Download size={17} /> <span>Install</span>
          </button>
        )}
      </div>
    </header>
  )
}