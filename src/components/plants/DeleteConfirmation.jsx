import { AlertTriangle, X } from 'lucide-react'

export default function DeleteConfirmation({ plant, onConfirm, onClose, deleting = false }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
        <button type="button" className="icon-button confirm-close" onClick={onClose} aria-label="Tutup dialog"><X size={19} /></button>
        <span className="confirm-icon"><AlertTriangle size={25} /></span>
        <h2 id="delete-title">Hapus tanaman?</h2>
        <p id="delete-description">Data <strong>{plant.name}</strong> akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.</p>
        <div className="confirm-actions">
          <button type="button" className="button button-ghost" onClick={onClose} disabled={deleting}>Batal</button>
          <button type="button" className="button button-danger" onClick={onConfirm} disabled={deleting}>{deleting ? 'Menghapus…' : 'Ya, hapus'}</button>
        </div>
      </section>
    </div>
  )
}