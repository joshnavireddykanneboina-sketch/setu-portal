# SETU — Complete Setup & Run Guide
**Jharkhand Societal Innovation Collaboration Portal**  
**Smart India Hackathon 2026 • Problem Statement ID: 26043**

---

## What This Application Is

SETU is a full-stack platform with three independently runnable layers:

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite 5 | Citizen, University, Industry, Government portals |
| Backend | Node.js + Express 5 | REST API, auth, ML routing, challenge lifecycle |
| ML Engine | Python 3 + Scikit-Learn | Domain classification, urgency triage, deduplication |

---

## System Requirements

| Requirement | Minimum | Notes |
|---|---|---|
| Node.js | **18 or 20** | Node 22+ breaks Capacitor 6 |
| npm | 9+ | Bundled with Node |
| Python | 3.9 – 3.12 | For the ML classification engine |
| pip | Any recent | For Python packages |
| Git | Any | To clone the repo |
| Android Studio | Ladybug+ | **Only needed for Android APK** |

Check what you have:
```bash
node --version    # needs 18.x or 20.x
npm --version     # needs 9+
python --version  # needs 3.9–3.12
```

---

## Part 1 — First-Time Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-org/setu.git
cd SETU
```

Or if you already have the folder:
```bash
cd path/to/SETU
```

---

### Step 2 — Install Node.js dependencies

```bash
npm install
```

This installs all frontend and backend packages including Capacitor 6.

---

### Step 3 — Configure environment variables

The `.env` file at the project root controls the backend. One is already present with development defaults:

```
PORT=5000
NODE_ENV=development
LLM_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash
LLM_API_KEY=                    ← leave blank if you don't have a key (app still works)
ML_MODE=python
JWT_SECRET=setu_dev_secret_key_2026
SESSION_SECRET=setu_dev_session_secret_2026
SETU_DB_FILE=database/data/setu_db.json
```

**To enable Gemini AI responses** (optional — the app works without it):
1. Get a free API key from https://aistudio.google.com/app/apikey
2. Set `LLM_API_KEY=your_key_here` in `.env`

If `LLM_API_KEY` is blank, the chat AI uses the ML engine directly — still functional, just not generative.

---

### Step 4 — Install Python ML dependencies

```bash
pip install -r ml/requirements.txt
```

This installs: `scikit-learn`, `joblib`, `numpy`, `pyyaml`.

The pre-trained model files are already present in `ml/models/`. You do **not** need to retrain unless you want to.

---

### Step 5 — (Optional) Retrain the ML models

Only needed if you want to update the training data:

```bash
npm run ml:train
```

This runs both training scripts. Takes about 30 seconds. Pre-trained models in `ml/models/` work fine out of the box.

---

## Part 2 — Running the Application

### Option A — Run everything at once (recommended)

```bash
npm start
```

This starts both the Vite dev server (port 5173) and the Express backend (port 5000) simultaneously.

Open your browser at: **http://localhost:5173**

---

### Option B — Run frontend and backend separately

**Terminal 1 — Backend API server:**
```bash
npm run server
```
Backend runs at: http://localhost:5000  
Verify it's alive: http://localhost:5000/api/health

**Terminal 2 — Frontend dev server:**
```bash
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Part 3 — Demo Accounts

The database is pre-seeded with these accounts (all password: `setu123`):

| Role | Email | What you can do |
|---|---|---|
| Citizen | `citizen@setu.jharkhand.gov.in` | Submit challenges, chat with AI, view journey |
| University | `university@setu.jharkhand.gov.in` | Accept assignments, form teams, add milestones |
| Industry | `industry@setu.jharkhand.gov.in` | View challenges, pledge CSR funding, assign mentors |
| Government | `admin@setu.jharkhand.gov.in` | Full analytics dashboard, export CSV, reassign HEIs |

You can also register a new account from the signup page.

---

## Part 4 — Key URLs (dev mode)

| URL | What it opens |
|---|---|
| http://localhost:5173 | Home page |
| http://localhost:5173/citizen | Citizen challenge portal |
| http://localhost:5173/chat | AI chat intake |
| http://localhost:5173/journey | University R&D journey |
| http://localhost:5173/industry | Industry CSR portal |
| http://localhost:5173/admin | Government analytics dashboard |
| http://localhost:5173/login | Login page |
| http://localhost:5173/signup | Registration page |
| http://localhost:5000/api/health | Backend health check |

---

## Part 5 — Production Build (Web / PWA)

To generate the optimised static bundle:

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file server:

```bash
npm run preview        # Local preview at http://localhost:4173
```

Or deploy `dist/` to Netlify, Vercel, or any static host.

---

## Part 6 — Android APK (Capacitor)

The `android/` project is already initialised. Follow these steps to build an APK.

### Prerequisites for Android

- Android Studio **Ladybug** or newer → https://developer.android.com/studio
- Inside Android Studio: **SDK Manager** → install **Android SDK API 34**
- Inside Android Studio: **Settings → SDK → JDK** → install JDK 17

### Step 1 — Set the deployed server URL

The APK must point to a real deployed SETU server, not localhost.

```bash
copy .env.android.example .env.android
```

Edit `.env.android`:
```
VITE_API_BASE_URL=https://setu.yourdomain.gov.in
```

> If you do not yet have a deployed backend, you can temporarily use a tunnelling tool like ngrok (`ngrok http 5000`) to expose your local backend: `VITE_API_BASE_URL=https://xxxx.ngrok-free.app`

### Step 2 — Build and sync

```bash
npm run android:build
```

This builds the React app with the server URL baked in and copies everything into the Android project.

### Step 3 — Open Android Studio

```bash
npm run android:open
```

Wait for **Gradle sync** to finish (first run downloads ~500MB of Android dependencies).

### Step 4 — Build debug APK

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 5 — Install on a phone

Connect phone by USB with USB Debugging enabled:

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

Or copy the APK to the phone and tap to install (enable "Install unknown apps" in Settings).

### Step 6 — Signed release APK (for distribution)

```bash
# Create signing keystore once
keytool -genkey -v -keystore android/setu-release.keystore -alias setu-gov-jharkhand -keyalg RSA -keysize 2048 -validity 10000
```

In Android Studio: **Build → Generate Signed Bundle / APK…** → select keystore → choose Release.

---

## Part 7 — Testing the API directly

A quick smoke-test from the command line:

```bash
# Health check
curl http://localhost:5000/api/health

# Login and get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"citizen@setu.jharkhand.gov.in\",\"password\":\"setu123\"}"

# Submit a challenge (replace TOKEN with value from above)
curl -X POST http://localhost:5000/api/challenges \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\":\"Fluoride in Dumka wells\",\"description\":\"High fluoride causing dental problems\",\"district\":\"Dumka\",\"block\":\"Jama\"}"

# Government analytics (use admin token)
curl http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Part 8 — Resetting the Database

If you want to start fresh (wipe all submitted challenges, keep seed accounts):

```bash
# Windows
del database\data\setu_db.json

# Mac/Linux
rm database/data/setu_db.json
```

The database re-creates itself from `database/seed/initialSeedData.json` the next time the backend starts.

---

## Part 9 — Project Structure (reference)

```
SETU/
├── backend/                  Express API server
│   ├── routes/               auth, challenges, admin, chat, ml, safety
│   ├── middleware/           authMiddleware.js (JWT + RBAC)
│   ├── services/             LLM, ML, routing, safety, notifications
│   └── server.js             Entry point (port 5000)
├── database/
│   ├── data/setu_db.json     Live JSON database (auto-created)
│   └── seed/                 Initial seed data
├── docs/                     Architecture, testing, security reports
├── ml/
│   ├── models/               Pre-trained Scikit-Learn models
│   ├── src/                  Training, prediction, evaluation scripts
│   └── requirements.txt      Python deps
├── src/                      React frontend
│   ├── components/           Navbar, ChatInterface, etc.
│   ├── pages/                Citizen, University, Industry, Admin portals
│   └── services/             API client, auth, offline storage, sync
├── public/                   PWA manifest, service worker, icons
├── android/                  Capacitor Android native project
├── .env                      Backend environment config
├── .env.android.example      Template for Android build config
├── capacitor.config.json     Capacitor Android settings
├── vite.config.js            Vite build config
└── package.json              Scripts and dependencies
```

---

## Part 10 — Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Ensure Node 18 or 20. Run `node --version` to check. |
| Backend on port 5000 won't start | Check if another process is using port 5000: `netstat -ano \| findstr 5000` |
| "Cannot connect to backend" in browser | Run `npm run server` in a separate terminal or use `npm start` which runs both. |
| Python ML falls back to heuristics | Run `pip install -r ml/requirements.txt` then `npm run ml:train`. |
| DB seems wrong / stale | Delete `database/data/setu_db.json` and restart the backend. |
| Capacitor `EPERM` errors | Pause OneDrive sync (right-click tray icon → Pause syncing) before running `npm run android:build`. |
| Gradle sync fails in Android Studio | Open **File → Project Structure → SDK Location** and set the correct Android SDK path. |
| App shows "API not configured" on Android | `VITE_API_BASE_URL` in `.env.android` must be a public HTTPS address, not localhost. |
| Login fails with `setu123` | Backend may be using an old DB. Delete `database/data/setu_db.json` and restart. |
