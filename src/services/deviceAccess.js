// Runtime camera and location permission requests inside the Android app.
// The browser keeps using the existing file input and Geolocation API.

import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

export async function ensureCameraPermission() {
  if (!Capacitor.isNativePlatform()) return true;
  const result = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
  return result.camera !== 'denied';
}

export async function readDevicePosition() {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.requestPermissions();
    if (perm.location === 'denied' || perm.coarseLocation === 'denied') {
      throw new Error('Location permission denied');
    }
    return Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 12000
    });
  }

  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation is not available');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000
    });
  });
}
