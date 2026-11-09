// Capacitor Android shell: back button, resume, and network reconnect.
// No-ops in the browser so the PWA stays unchanged.

import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { isNativeApp } from './apiConfig';
import { triggerBackgroundSync } from './syncManager';

export async function initNativeShell() {
  if (!isNativeApp()) return () => {};

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#080C14' });
  } catch {
    // Status bar plugin is Android-only at runtime.
  }

  const backHandle = await App.addListener('backButton', () => {
    if (typeof window.__SETU_ON_BACK__ === 'function') {
      window.__SETU_ON_BACK__();
      return;
    }
    App.exitApp();
  });

  const stateHandle = await App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      window.dispatchEvent(new Event('setu-app-resume'));
      triggerBackgroundSync();
    }
  });

  const applyStatus = (connected) => {
    window.dispatchEvent(new Event(connected ? 'online' : 'offline'));
    if (connected) triggerBackgroundSync();
  };

  const netHandle = await Network.addListener('networkStatusChange', (status) => {
    applyStatus(!!status.connected);
  });

  try {
    const status = await Network.getStatus();
    applyStatus(!!status.connected);
  } catch {
    // Browser online events still cover this case.
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Splash plugin may already be hidden.
  }

  return () => {
    backHandle.remove();
    stateHandle.remove();
    netHandle.remove();
  };
}
