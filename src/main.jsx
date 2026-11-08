import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { PlantProvider } from './contexts/PlantContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import './index.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <PlantProvider>
          <App />
        </PlantProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)