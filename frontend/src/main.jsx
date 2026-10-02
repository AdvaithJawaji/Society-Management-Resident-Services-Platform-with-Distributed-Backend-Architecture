import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations
      .filter(registration => new URL(registration.scope).origin === window.location.origin)
      .forEach(registration => registration.unregister());
  });

  if ('caches' in window) {
    caches.keys().then(cacheNames => Promise.all(cacheNames.map(cacheName => caches.delete(cacheName))));
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
