# SETU Mobile & Progressive Web Application (PWA) Implementation
**Jharkhand Societal Innovation Collaboration Portal**  
**Department of Higher & Technical Education • Government of Jharkhand**  
**Smart India Hackathon 2026 • Problem Statement ID: 26043**

---

## 1. Executive Summary & Architectural Overview

The SETU mobile application experience is engineered as an installable, offline-first **Progressive Web Application (PWA)** built directly on top of the existing React 18 + Vite frontend, with native Android APK packaging readiness via **Capacitor**.

This architectural choice eliminates codebase duplication: citizens, university faculty, CSR executives, and government administrators access the exact same codebase on both desktop workstations and mobile handhelds. On mobile devices (`viewport <= 768px`), the portal reflows into a native-app-like user interface with a bottom navigation bar, fixed top status header with live connectivity and sync indicators, native device camera integration, explicit GPS geolocation, and an IndexedDB-backed offline submission queue.

```
+-----------------------------------------------------------------------------------+
|                            SETU UNIFIED FRONTEND                                  |
|                         (React 18 + Vite + Tailwind/CSS)                          |
+-----------------------------------------------------------------------------------+
       |                                                         |
       v (Mobile / Desktop Web)                                  v (Android APK)
+---------------------------------------+             +-----------------------------+
|        Progressive Web App            |             |   Capacitor Native Container|
|  - Service Worker (sw.js)             |             |  - capacitor.config.json    |
|  - Web App Manifest (manifest.json)   |             |  - AndroidManifest.xml      |
|  - CacheStorage (App Shell)           |             |  - Native Camera & GPS      |
|  - IndexedDB (SETU_OFFLINE_DB v1)     |             |  - Single compiled APK/AAB  |
|  - Offline Sync Manager               |             |                             |
+---------------------------------------+             +-----------------------------+
                            \                                 /
                             v                               v
                     +-----------------------------------------------+
                     |         SETU REST API & ML Subsystem          |
                     |      Node.js + Express + Scikit-Learn         |
                     |  Idempotency Key Verification (X-Idempotency) |
                     +-----------------------------------------------+
```

---

## 2. PWA Manifest & App Shell Configuration

### 2.1 Manifest Specification (`SETU/public/manifest.webmanifest`)
The Web App Manifest adheres to W3C PWA standards and Google Chrome installability criteria:
- **`id`**: `/`
- **`name`**: `SETU Jharkhand - Societal Innovation Portal`
- **`short_name`**: `SETU Jharkhand`
- **`start_url`**: `/`
- **`scope`**: `/`
- **`display`**: `standalone` (removes browser URL bar, giving a native-app appearance)
- **`orientation`**: `portrait-primary`
- **`background_color`**: `#080C14` (SETU deep dark canvas)
- **`theme_color`**: `#080C14`
- **`icons`**:
  - `public/icons/icon-192.png`: 192x192 PNG for home screen launch
  - `public/icons/icon-512.png`: 512x512 PNG for high-DPI splash screen
  - `public/icons/icon-maskable.png`: 512x512 maskable PNG for Android adaptive icon shapes
  - `public/icons/icon-setu.svg`: Scalable vector source
- **`shortcuts`**: Quick action launcher for:
  1. *Submit Societal Challenge* (`/citizen`)
  2. *Explore Portal* (`/support`)
  3. *My Projects Tracker* (`/journey`)
  4. *Government Dashboard* (`/admin`)

### 2.2 Viewport Configuration (`SETU/index.html`)
The HTML viewport includes `viewport-fit=cover` to support edge-to-edge displays with camera cutouts and navigation bars:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
<meta name="theme-color" content="#080C14" />
<link rel="manifest" href="/manifest.webmanifest" />
```

---

## 3. Service Worker & Caching Strategy (`SETU/public/sw.js`)

The Service Worker uses a tiered caching strategy engineered specifically for rural governance applications where connectivity is intermittent or non-existent.

### 3.1 App Shell Pre-Caching (Cache-First)
During the `install` lifecycle event, the service worker pre-caches critical assets required to render the application shell offline:
- `/` (HTML index)
- `/index.html`
- `/offline.html` (Dedicated standalone offline landing view)
- `/manifest.webmanifest`
- Application branding and icon assets

### 3.2 Navigation Requests (Network-First with App Shell Fallback)
For all top-level document navigations (`request.mode === 'navigate'`), the service worker tries the network first. If the device is offline or the request times out, it serves `/index.html` from cache to allow React client-side routing to mount the proper view, falling back to `/offline.html` if uninitialized.

### 3.3 Static Assets (Stale-While-Revalidate)
Static JS chunks, CSS bundles, Google fonts, and UI images are served via **Stale-While-Revalidate**:
1. Serves the cached asset immediately for instantaneous page loads.
2. Simultaneously fetches the latest version in the background and updates the cache.

### 3.4 Strict Security Isolation for API Requests
**Critical Security Mandate**: To prevent sensitive citizen submissions, authentication tokens, and administrative data from leaking into public shared browser storage:
- All requests targeting `/api/*` bypass the service worker CacheStorage completely.
- Offline data storage is exclusively managed by the scoped, transactional **IndexedDB** layer.

---

## 4. Offline-First Architecture & IndexedDB Storage (`src/services/offlineStorage.js`)

To guarantee that citizens in remote panchayats never lose data when connectivity drops, SETU implements a complete offline-first database using **IndexedDB** (`SETU_OFFLINE_DB` version 1).

### 4.1 Object Stores
1. **`drafts`**:
   - `keyPath`: `draftKey` (e.g. `'citizen_challenge_draft'`)
   - Stores in-progress challenge forms with field contents, selected district/block/panchayat, and preview image base64 data.
   - Automatically saved on form input changes (`debounce 500ms`) and restored upon returning to the portal.
2. **`sync_queue`**:
   - `keyPath`: `id` (auto-incrementing integer)
   - Indexes: `idempotencyKey` (unique), `status`, `timestamp`
   - Stores queued challenge submissions awaiting synchronization to the government server.
   - Each queue item contains:
     ```json
     {
       "id": 1,
       "idempotencyKey": "SETU-IDEMP-1762588123456-abc1234",
       "trackingId": "SETU-JH-2026-PENDING-1234",
       "payload": { ...challengeFields, evidencePhotos: [...] },
       "status": "WAITING_FOR_SYNC",
       "retryCount": 0,
       "timestamp": 1762588123456,
       "lastAttemptError": null
     }
     ```
3. **`synced_submissions`**:
   - `keyPath`: `trackingId`
   - Stores locally cached receipts of confirmed submissions for instant viewing without network access.

---

## 5. Background Synchronization & Idempotency Guarantee

### 5.1 Synchronization Manager (`src/services/syncManager.js`)
The `syncManager` acts as the coordinator between network connectivity events and the IndexedDB queue:
1. Listens to `window.addEventListener('online')` and `window.addEventListener('offline')`.
2. When the device regains network access, it triggers `triggerBackgroundSync()`.
3. Processes items sequentially from `getPendingQueue()`.
4. Transmits each payload using `apiCreateChallenge(item.payload, item.idempotencyKey)`.
5. On HTTP 200/201 success:
   - Removes item from `sync_queue`.
   - Stores the permanent server record in `synced_submissions`.
   - Fires a reactive subscriber callback to update the UI.
6. On network failure:
   - Increments `retryCount`.
   - Records `lastAttemptError`.
   - Leaves item in queue for next reconnect.

### 5.2 Server-Side Idempotency Protection (`backend/routes/challenges.js`)
To protect against duplicate challenges created by background retry loops over flaky rural networks:
- The frontend generates an `idempotencyKey` (`SETU-IDEMP-${Date.now()}-${randomString()}`).
- This key is passed via the `X-Idempotency-Key` HTTP header and the request payload.
- The Express backend checks `challenges.json` for an existing challenge matching the key.
- If found, the server immediately returns HTTP 200 with the existing record and `{ isIdempotentReplay: true }` without inserting a duplicate record.

### 5.3 User Transparency (Honest State Messaging)
SETU strictly adheres to truthful UI state reporting:
- **Never falsely claims success**: An offline submission is clearly labelled **"QUEUED LOCALLY - WAITING FOR SYNC"** with a cyan/amber badge, showing its local ID and the exact number of pending items.
- Only when the server confirms persistence does the status change to **"SUBMITTED TO GOVERNMENT PORTAL"** with its permanent tracking ID.

---

## 6. Citizen Mobile Experience & Hardware Integrations

### 6.1 Native Phone Camera & Viewfinder Capture (`CitizenPortalPage.jsx`)
- **Direct Native Camera**: Uses `<input type="file" accept="image/*" capture="environment">` to trigger the phone's native Android/iOS camera app directly.
- **In-App Live WebCam Viewfinder**:
  - Employs `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`.
  - Includes front/back camera flipping (`user` vs `environment`).
  - Captures instant high-resolution frames rendered to HTML5 canvas.
- **Client-Side Image Compression**:
  - Automatically downsizes captured images to a maximum dimension of 1200px at 80% JPEG quality before queuing or uploading.
  - Reduces average image payload from 5-8MB to under 250KB, critical for low-bandwidth 2G/3G connectivity in rural Jharkhand.

### 6.2 Explicit GPS Geolocation with Consent
- Geolocation is **strictly opt-in**; users must toggle "Consent to share GPS location".
- Displays an explicit privacy note explaining that coordinates are used exclusively to tag the affected Panchayat.
- Requests `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })`.
- Provides manual district, block, and panchayat dropdown selectors for full accessibility if GPS is declined or unavailable.

### 6.3 Dedicated Offline Queue & Sync Workbench (Tab 4)
A dedicated tab inside the Citizen Portal allows users to:
- View all pending offline drafts and sync queue items.
- Inspect the unique idempotency keys and retry attempts.
- Trigger manual "Sync Now" attempts on demand.
- View successfully synchronized submissions.

---

## 7. Responsive Navigation & Layout Architecture

### 7.1 Mobile Bottom Navigation (`src/components/MobileBottomNav.jsx`)
Visible only on viewports `<= 768px`:
- **Home** (`/`): Portal overview and live statistics.
- **Explore** (`/support`): Browse verified societal challenges and research.
- **Submit Problem** (`/citizen`): Elevated center call-to-action button with amber glow.
- **My Projects** (`/journey`): Project milestones, university teams, and CSR status.
- **Profile** (`/profile`): User account, role switch, and offline queue shortcut.

### 7.2 Mobile Top Header (`src/components/MobileTopHeader.jsx`)
Fixed top bar (`<= 768px`) displaying:
- Government of Jharkhand crest & SETU badge.
- **Live Connectivity Status Pill**:
  - `🟢 Online` (Green glow when connected).
  - `📡 Offline (N queued)` (Amber pulsing badge indicating queued submissions).
  - `🔄 Syncing...` (Cyan spinner when active transmission is in progress).
- **PWA Install Button**: Captures `beforeinstallprompt` event and presents an in-app "Install App" button to add SETU to the Android home screen.

### 7.3 Master-Detail Reflow
All desktop multi-column workbenches reflow gracefully on handheld screens:
- Multi-column `1fr 1fr` and `minmax(320px, 1fr) 380px` grids utilize `repeat(auto-fit, minmax(min(100%, 340px), 1fr))`.
- Master-detail views stack vertically on narrow devices (360px - 412px) without horizontal scrolling.
- Panchayat dropdowns wrap dynamically using `repeat(auto-fit, minmax(min(100%, 140px), 1fr))`.

---

## 8. Testing & Local Verification Procedure

### 8.1 Automated Test Suites
Run the automated verification suite from the project root:

```bash
# 1. Verify Mobile, PWA, Service Worker & Offline Storage Subsystem (37 tests)
node SETU/tests/test_mobile_pwa_offline.mjs

# 2. Verify ML Classification, Urgency & Routing Pipeline (62 tests)
node SETU/tests/test_ml_subsystem.mjs

# 3. Verify Stakeholder Ecosystem Portals & API Contracts (16 tests)
node SETU/tests/test_stakeholder_ecosystem.mjs
```

### 8.2 Production Build Verification
Verify that all PWA assets, manifest, and service worker compile cleanly:
```bash
cd SETU
npm run build
```
Expected output:
- `dist/index.html`
- `dist/manifest.webmanifest`
- `dist/sw.js`
- `dist/offline.html`
- `dist/icons/*` (192, 512, maskable PNGs, SVG)

### 8.3 Mobile Device Simulation in Chrome / Edge DevTools
1. Start the application:
   ```bash
   npm run start
   ```
2. Open `http://localhost:5173` in Google Chrome or Microsoft Edge.
3. Open DevTools (`F12` or `Ctrl+Shift+I`).
4. Toggle Device Toolbar (`Ctrl+Shift+M`).
5. Test against standard Indian mobile viewport dimensions:
   - **Samsung Galaxy S20 / A-Series**: `360 x 800`
   - **iPhone 12 / 13 / 14**: `390 x 844`
   - **Google Pixel 7**: `412 x 915`
   - **iPad / Tablet Viewport**: `768 x 1024`
6. Test Offline Mode:
   - In DevTools, go to **Network** tab -> change throttling to **Offline**.
   - Navigate to `/citizen` -> Submit a challenge -> verify it stores into IndexedDB with `WAITING_FOR_SYNC`.
   - Switch back to **Online** -> verify sync manager triggers background upload and updates tracking ID.
