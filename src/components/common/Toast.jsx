import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export default function Toast({ message, type = 'success', onClose }) {
  const Icon = icons[type] || Info
  return (
    <div className={`toast toast-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={20} aria-hidden="true" />
      <span>{message}</span>
      <button type="button" className="icon-button toast-close" onClick={onClose} aria-label="Tutup notifikasi">
        <X size={17} />
      </button>
    </div>
  )
}