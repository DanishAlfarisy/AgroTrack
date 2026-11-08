import { Cloud, CloudOff, RefreshCw } from 'lucide-react'

export default function OfflineIndicator({ isOnline, queueCount = 0, isSyncing = false, onSync }) {
  return (
    <div className="connection-group">
      <span className={`connection-pill ${isOnline ? 'is-online' : 'is-offline'}`}>
        {isOnline ? <Cloud size={15} /> : <CloudOff size={15} />}
        {isOnline ? 'Online' : 'Offline'}
      </span>
      {queueCount > 0 && (
        <button
          type="button"
          className="sync-pill"
          onClick={onSync}
          disabled={!isOnline || isSyncing}
          title={isOnline ? 'Sinkronkan perubahan' : 'Menunggu koneksi internet'}
        >
          <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
          {queueCount} tertunda
        </button>
      )}
    </div>
  )
}