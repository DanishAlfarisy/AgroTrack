import { useContext } from 'react'
import ToastContext from '../contexts/toastContext'

export default function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast harus digunakan di dalam ToastProvider.')
  return context
}