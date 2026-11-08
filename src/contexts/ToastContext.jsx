import { useCallback, useMemo, useState } from 'react'
import Toast from '../components/common/Toast'
import ToastContext from './toastContext'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'success', duration = 4200) => {
      const id = `${Date.now()}-${Math.random()}`
      setToasts((current) => [...current, { id, message, type }])
      window.setTimeout(() => removeToast(id), duration)
      return id
    },
    [removeToast],
  )

  const value = useMemo(() => ({ showToast, removeToast }), [showToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}