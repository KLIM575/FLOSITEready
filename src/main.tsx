import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SiteSettingsProvider } from './context/SiteSettingsContext'
import { AppearanceProvider } from './context/AppearanceContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppearanceProvider>
      <SiteSettingsProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </SiteSettingsProvider>
    </AppearanceProvider>
  </StrictMode>,
)
