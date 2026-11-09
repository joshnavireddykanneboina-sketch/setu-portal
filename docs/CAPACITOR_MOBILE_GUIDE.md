# SETU Android APK Build Guide (Capacitor)
**Department of Higher & Technical Education • Government of Jharkhand**  
**Smart India Hackathon 2026 • Problem Statement ID: 26043**

---

## Architecture Overview

SETU uses a unified codebase:

- **Progressive Web App (PWA)** — primary zero-install web delivery, served from the deployed domain.
- **Capacitor Android Container** — packages the same Vite production bundle into a native APK. Capacitor bridges native hardware (Camera, GPS, Network, StatusBar, SplashScreen) while the React app runs unchanged inside a WebView.

Capacitor version: **6.x** (requires Node ≥ 18; tested on Node 20).

---

## Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js | 18 or 20 | Node 22+ is **not** supported by Capacitor 6 |
| npm | 9+ | Bundled with Node |
| Android Studio | Ladybug / Hedgehog or newer | Download from developer.android.com/studio |
| Android SDK | API Level 34 (Android 14) | Install via SDK Manager in Android Studio |
| Android SDK Build-Tools | 34.0.0 | Install via SDK Manager |
| JDK | 17 | Install in Android Studio → Settings → SDKs |

---

## First-Time Setup (already done — skip if `android/` exists)

```bash
# Install Capacitor packages
npm install

# Build production web bundle
npm run build

# Initialize the Android native project
npx cap add android
```

---

## Step 1 — Set the Deployed API URL

The Android APK must connect to the **public SETU server**, not localhost.

Copy the Android environment file template:

```bash
cp .env.android.example .env.android
```

Edit `.env.android` and set the deployed server URL:

```
VITE_API_BASE_URL=https://setu.yourdomain.gov.in
```

> **IMPORTANT**: The URL must be `https://` and must not be `localhost`, `127.0.0.1`, or a LAN IP address. The build script will refuse to package if a local address is detected.

---

## Step 2 — Build the APK-Ready Bundle

```bash
npm run android:build
```

This script (`scripts/android_sync.js`):
1. Validates `VITE_API_BASE_URL` is set and points to a public HTTPS server.
2. Runs `vite build` with `VITE_API_BASE_URL` injected into the bundle.
3. Verifies the bundle contains the `SETU_API_TARGET:` deployment marker.
4. Runs `npx cap sync android` to copy assets and update native Android plugins.
5. Updates `AndroidManifest.xml` and `network_security_config.xml` for the target server.
6. Copies app icon assets to all Android density buckets.

On success you will see:
```
[android:sync] Android project is ready. API origin: https://setu.yourdomain.gov.in
```

---

## Step 3 — Open in Android Studio

```bash
npm run android:open
```

Or directly:
```bash
npx cap open android
```

Android Studio opens the `android/` Gradle project. Wait for the Gradle sync to complete before building.

---

## Step 4 — Build a Debug APK

In Android Studio:

1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for the build to finish.
3. Click **Locate** in the notification, or find the APK at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Step 5 — Install on an Android Phone

**Via Android Studio:** Connect the phone by USB with USB Debugging enabled:
```
Run → Run 'app'   (or press ⇧F10 / Shift+F10)
```

**Via ADB (command line):**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**Via file transfer:** Copy `app-debug.apk` to the phone and tap to install (enable "Install unknown apps" in Settings).

---

## Step 6 — Testing the App

1. **API connectivity** — Open the app and log in. A connection error means `VITE_API_BASE_URL` is unreachable or misconfigured.
2. **Chrome DevTools (debug builds)** — On desktop Chrome, open `chrome://inspect` → Remote Targets to inspect the WebView.
3. **Camera permission** — Go to Citizen Portal → tap the photo capture button. Accept the permission prompt.
4. **Location permission** — Submit a challenge and tap the GPS capture button. Accept the location prompt.
5. **Offline mode** — Enable airplane mode, create a draft, and re-enable connectivity. The sync manager automatically submits pending items.
6. **Back button** — Pressing the Android back button navigates the app history; at the home screen it exits the app.

---

## Step 7 — Generate a Signed Release APK or AAB

A signed APK / AAB is required for Google Play Store distribution or official state distribution.

### 7a — Create a Keystore (one-time)

```bash
keytool -genkey -v -keystore android/setu-release.keystore \
  -alias setu-gov-jharkhand \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -dname "CN=SETU Jharkhand, OU=DHE&TE, O=Government of Jharkhand, L=Ranchi, ST=Jharkhand, C=IN"
```

Store the keystore and passwords securely. **Never commit the keystore or passwords to git** (both are `.gitignore`d).

### 7b — Configure Signing in Android Studio

1. **Build** → **Generate Signed Bundle / APK…**
2. Choose **APK** (sideload) or **Android App Bundle** (Play Store).
3. Select the keystore file, enter passwords and key alias.
4. Choose **release** build variant.
5. Click **Create**.

Output locations:
- APK: `android/app/release/app-release.apk`
- AAB: `android/app/release/app-release.aab`

### 7c — Build Release via Gradle (CI/CD)

Set signing credentials as environment variables (never hardcode in build files):

```bash
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file=./setu-release.keystore \
  -Pandroid.injected.signing.store.password=$KEYSTORE_PASS \
  -Pandroid.injected.signing.key.alias=setu-gov-jharkhand \
  -Pandroid.injected.signing.key.password=$KEY_PASS
```

---

## Updating the App

Whenever you update the frontend code:

```bash
# Ensure VITE_API_BASE_URL is set in .env.android, then:
npm run android:build

# Re-open Android Studio and rebuild the APK
npm run android:open
```

---

## Permissions Summary

| Permission | Purpose | When requested |
|---|---|---|
| `INTERNET` | All API calls to deployed SETU server | Always |
| `ACCESS_NETWORK_STATE` | Detect online/offline for sync queue | Always |
| `ACCESS_WIFI_STATE` | Network quality awareness | Always |
| `CAMERA` | Capture evidence photos for challenge reports | On first photo capture |
| `ACCESS_FINE_LOCATION` | GPS tagging for Panchayat/district mapping | On first GPS capture |
| `ACCESS_COARSE_LOCATION` | Fallback location for indoor/weak signal | On first GPS capture |
| `READ_MEDIA_IMAGES` | Attach gallery photos (Android 13+) | On first gallery pick |
| `READ_EXTERNAL_STORAGE` | Attach gallery photos (Android ≤ 12) | On first gallery pick |
| `VIBRATE` | Tactile feedback on notifications | Never prompted |

---

## Privacy Disclosures

- **Camera** — Accessed only when user explicitly taps the evidence-capture button. Images are processed on-device and transmitted to the SETU state server only on challenge submission.
- **Location** — Accessed only when user taps the GPS-tag button on the challenge form. Coordinates are stored in the challenge record on the state server for district mapping; they are not shared with third parties.
- **Network access** — The app communicates exclusively with the deployed SETU government server (`VITE_API_BASE_URL`). No telemetry, analytics, or advertising SDKs are included.
- **Offline storage** — Drafts and unsynced submissions are stored in the device's IndexedDB. No data leaves the device until connectivity is restored and the user has explicitly submitted.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `VITE_API_BASE_URL` not set error | Create `.env.android` from `.env.android.example` and set the URL |
| Gradle sync fails ("SDK not found") | Set `ANDROID_HOME` or configure SDK path in `android/local.properties` |
| `EPERM` errors during `cap sync` | OneDrive sync can lock files. Run `npm run android:build` from a non-OneDrive path, or pause OneDrive sync first |
| Camera permission denied | User must grant permission in Android Settings → Apps → SETU Jharkhand → Permissions |
| API calls fail on device | Verify the deployed server is accessible over HTTPS; check `VITE_API_BASE_URL` has no trailing slash |
| WebView debugging | Use `chrome://inspect` in Chrome on a PC connected to the device via USB (debug builds only) |
| App crashes on back button | Back navigation is handled by `nativeShell.js`; `window.__SETU_ON_BACK__` is registered in `App.jsx` |
