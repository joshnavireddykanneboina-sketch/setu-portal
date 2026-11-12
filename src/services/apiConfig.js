// API origin for web and the Capacitor Android app.
// Web dev keeps the Vite proxy (`/api` -> localhost:5000).
// The Android build must set VITE_API_BASE_URL to the deployed server.
// A native build never falls back to localhost.

import { Capacitor } from '@capacitor/core';

export const API_TARGET_MARKER = `SETU_API_TARGET:${import.meta.env.VITE_API_BASE_URL || 'RELATIVE_WEB'}`;

function normalizeConfiguredBase(raw) {
  const value = String(raw || '').trim().replace(/\/$/, '');
  if (!value) return '';
  return value.endsWith('/api') ? value : `${value}/api`;
}

export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isDisallowedApiHost(raw) {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local')
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function getApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_BASE_URL || '').trim();
  if (isNativeApp()) {
    if (!configured || isDisallowedApiHost(configured)) {
      return null;
    }
    return normalizeConfiguredBase(configured);
  }
  if (configured && !isDisallowedApiHost(configured)) {
    return normalizeConfiguredBase(configured);
  }
  return '/api';
}

export function nativeApiConfigError() {
  return 'This Android build is not connected to the deployed SETU server. Set VITE_API_BASE_URL to the public API address and run npm run android:sync. The app does not call localhost.';
}
