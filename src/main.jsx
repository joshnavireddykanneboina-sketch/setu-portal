import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { initNativeShell } from './services/nativeShell.js';

// ─── PWA Service Worker ────────────────────────────────────────────────────
// Unregister any existing service worker to prevent it intercepting API calls
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister();
      console.log('[SETU PWA] Service Worker unregistered to allow direct API access.');
    }
  });
  caches.keys().then((names) => {
    for (const name of names) caches.delete(name);
  });
}

// ─── Capacitor Native Shell ────────────────────────────────────────────────
// Initializes: Android back-button handler, app-state resume events,
// Network plugin connectivity monitoring, StatusBar, and SplashScreen hide.
// This is a no-op in the browser so the PWA deployment is not affected.
initNativeShell().catch((err) => {
  console.warn('[SETU Native] Shell init warning:', err);
});

// ─── React Mount ───────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
