import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import { initNativeShell } from './services/nativeShell.js';

// ─── PWA Service Worker ────────────────────────────────────────────────────
// Registered only on secure origins (https:// or localhost).
// Inside the Capacitor WebView, androidScheme:"https" makes the origin
// https://localhost, so the SW registers and caches work correctly.
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        window.__SETU_SW_REGISTRATION__ = reg;
        console.log('[SETU PWA] Service Worker registered with scope:', reg.scope);

        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SETU PWA] New version available; refresh to activate.');
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('[SETU PWA] Service Worker registration failed:', err);
      });
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
