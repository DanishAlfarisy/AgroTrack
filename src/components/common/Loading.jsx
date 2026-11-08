import { Sprout } from 'lucide-react'

export default function Loading({ label = 'Memuat data tanaman…', compact = false }) {
  return (
    <div className={`loading-state ${compact ? 'loading-compact' : ''}`} role="status">
      <span className="loading-icon"><Sprout size={compact ? 20 : 30} /></span>
      <span>{label}</span>
    </div>
  )
}