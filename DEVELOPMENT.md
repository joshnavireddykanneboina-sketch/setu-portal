# Developer & Contributor Guide — SETU

Welcome to the development guide for **SETU (Jharkhand Societal Innovation Collaboration Portal)**.  
This guide documents the architecture, development workflows, and extension patterns so developers can seamlessly contribute and add new features.

---

## Table of Contents
1. [Development Environment Setup](#1-development-environment-setup)
2. [Project Architecture & Directory Layout](#2-project-architecture--directory-layout)
3. [How to Add New Frontend Pages & Components](#3-how-to-add-new-frontend-pages--components)
4. [How to Add New Backend API Routes & Services](#4-how-to-add-new-backend-api-routes--services)
5. [How to Update and Train Machine Learning Models](#5-how-to-update-and-train-machine-learning-models)
6. [How to Modify Database Schemas & Seed Data](#6-how-to-modify-database-schemas--seed-data)
7. [Multilingual Localization (i18n) Workflow](#7-multilingual-localization-i18n-workflow)
8. [Testing & Build Verification](#8-testing--build-verification)
9. [Git Branching & Pull Request Guidelines](#9-git-branching--pull-request-guidelines)

---

## 1. Development Environment Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10+ (for Machine Learning model training and evaluation)
- **Git**: v2.30+

### Initial Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/your-username/setu-jharkhand-portal.git
cd SETU

# 2. Install Node.js frontend & backend dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your specific settings (LLM keys, JWT secrets, etc.)

# 4. Optional: Set up Python virtual environment for ML
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate
pip install -r ml/requirements.txt
```

### Running in Development Mode
Run the backend and frontend in two separate terminal windows:

**Terminal 1 — Backend API Server:**
```bash
npm run server
# Runs on http://localhost:5000 with real-time request logging
```

**Terminal 2 — Frontend Dev Server:**
```bash
npm run dev
# Starts Vite dev server at http://localhost:5173 (or http://localhost:3000)
```

---

## 2. Project Architecture & Directory Layout

```
SETU/
├── backend/                   # Express.js REST API
│   ├── config.js              # Environment & port configuration
│   ├── server.js              # Express app entrypoint & route mounting
│   ├── middleware/            # Auth, RBAC & validation middlewares
│   ├── routes/                # Endpoint routers (/challenges, /chat, /auth, etc.)
│   └── services/              # Business logic (appointments, ml, routing, safety)
├── database/                  # File-backed JSON persistence
│   ├── db.js                  # Database query helper (findOne, find, insert, update)
│   ├── data/                  # Active local JSON database (setu_db.json)
│   ├── schema/                # JSON schema definitions
│   └── seed/                  # Initial seed dataset (districts, universities, CSRs)
├── docs/                      # Architectural, API & ML specifications
├── ml/                        # Python Machine Learning Subsystem
│   ├── config.yaml            # Hyperparameters & dataset configuration
│   ├── requirements.txt       # scikit-learn, joblib, numpy, pyyaml
│   ├── data/sample/           # Training CSV datasets
│   ├── models/                # Serialized .joblib model files
│   └── src/                   # Preprocessing, training, inference & eval scripts
├── public/                    # Static assets, video, and animation frame sequences
├── src/                       # React 18 Frontend
│   ├── components/            # Reusable UI widgets (Navbar, Hero, SupportGrid, etc.)
│   ├── pages/                 # Full-page views (AdminPortal, Counselling, etc.)
│   ├── services/              # Client-side stores, API client, NLP, i18n, privacy
│   ├── styles/                # Global CSS styling & design tokens
│   ├── App.jsx                # Main application component & client-side router
│   └── main.jsx               # React DOM root entry
├── .env.example               # Sanitized environment template
├── .gitignore                 # Comprehensive Git exclusion rules
├── package.json               # Project manifest & npm scripts
├── vite.config.js             # Vite configuration with chunk splitting
└── test_api.js                # Automated end-to-end API integration tests
```

---

## 3. How to Add New Frontend Pages & Components

### A. Creating a New Component
1. Place the component in `src/components/YourComponent.jsx`.
2. Follow the design system tokens:
   - **Background**: Soft dark slate (`#080C14` / `#0E1420`)
   - **Accent**: Cyan intelligence accents (`#00F2FE`)
   - **Typography**: Editorial headings use `var(--font-editorial)` (Fraunces), UI text uses `var(--font-sans)` (Inter).
   - **Glass Panels**: `background: 'rgba(15, 23, 42, 0.75)'`, `backdropFilter: 'blur(16px)'`, `border: '1px solid rgba(255, 255, 255, 0.08)'`.

### B. Creating a New Page & Routing
1. Place page in `src/pages/YourNewPage.jsx`.
2. Open `src/App.jsx`.
3. Import your page component:
   ```javascript
   import YourNewPage from './pages/YourNewPage';
   ```
4. Add route matching inside the render switch:
   ```javascript
   case '/your-route':
     return <YourNewPage onNavigate={setCurrentRoute} />;
   ```
5. If navigation requires a top navbar link, add it to `navLinks` in `src/components/Navbar.jsx`.

---

## 4. How to Add New Backend API Routes & Services

### A. Creating a New Route File
1. Create a new router in `backend/routes/yourFeature.js`:
   ```javascript
   import express from 'express';
   import { find, insert } from '../../database/db.js';
   import { requireAuth } from '../middleware/authMiddleware.js';

   const router = express.Router();

   // GET /api/your-feature
   router.get('/', (req, res) => {
     const data = find('yourCollection');
     res.json(data);
   });

   // POST /api/your-feature
   router.post('/', requireAuth, (req, res) => {
     const item = insert('yourCollection', req.body);
     res.status(201).json(item);
   });

   export default router;
   ```
2. Mount the router in `backend/server.js`:
   ```javascript
   import yourFeatureRoutes from './routes/yourFeature.js';
   // ...
   app.use('/api/your-feature', yourFeatureRoutes);
   ```

---

## 5. How to Update and Train Machine Learning Models

The ML layer is designed as an independent Python package in `ml/`.

### Training Workflow
1. Add or expand labeled training data in `ml/data/sample/`.
2. Update dataset paths or hyperparameters in `ml/config.yaml`.
3. Train models:
   ```bash
   python ml/src/train_intent.py
   python ml/src/train_urgency.py
   ```
4. Verify evaluation metrics:
   ```bash
   python ml/src/evaluate.py
   ```
5. Test single prediction:
   ```bash
   python ml/src/predict.py "Drinking water well polluted with arsenic in Hazaribagh"
   ```
6. The Node.js server automatically calls the updated model via `backend/services/ml/mlClient.js`.

---

## 6. How to Modify Database Schemas & Seed Data

SETU uses a lightweight, zero-dependency JSON database engine (`database/db.js`) ideal for rapid prototyping and reproducible seed data:
- `database/seed/initialSeedData.json`: Defines the initial state data for users, 24 Jharkhand districts, universities (BIT Mesra, NIT Jamshedpur, IIT-ISM), industries, and sample challenges.
- `database/data/setu_db.json`: Live persistent state file (automatically created on first run from seed).

### Adding a New Collection
1. Add an empty array or initial seed entries to `database/seed/initialSeedData.json`:
   ```json
   "myNewCollection": [
     { "id": "ITEM-001", "name": "Sample Entry" }
   ]
   ```
2. Query it in backend routes using `find('myNewCollection')`, `findOne('myNewCollection', id)`, or `insert('myNewCollection', newItem)`.

---

## 7. Multilingual Localization (i18n) Workflow

SETU supports English (`EN`), Hindi (`HI` - हिंदी), and Santhali (`SAT` - ᱥᱟᱱᱛᱟᱲᱤ).

1. Open `src/services/i18n.js`.
2. Add new translation keys to all three dictionaries (`EN`, `HI`, `SAT`):
   ```javascript
   EN: { myNewKey: "Explore Innovations" },
   HI: { myNewKey: "नवाचार खोजें" },
   SAT: { myNewKey: "ᱱᱟᱶᱟ ᱥᱮᱸᱫᱽᱨᱟ" }
   ```
3. In components, import `t`:
   ```javascript
   import { t } from '../services/i18n';
   // Inside JSX:
   <h3>{t('myNewKey')}</h3>
   ```
4. To make components reactively re-render when the user toggles languages in the Navbar:
   ```javascript
   const [, setLangTick] = useState(0);
   useEffect(() => {
     const onLangChange = () => setLangTick(n => n + 1);
     window.addEventListener('setu-lang-changed', onLangChange);
     return () => window.removeEventListener('setu-lang-changed', onLangChange);
   }, []);
   ```

---

## 8. Testing & Build Verification

Before committing code, run the following verification steps:

```bash
# 1. Verify frontend production build
npm run build

# 2. Run end-to-end API integration tests (while backend server is running)
node test_api.js
```

---

## 9. Git Branching & Pull Request Guidelines

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit with conventional commit messages:
   - `feat: add district-level geo-fencing for challenge cards`
   - `fix: resolve mobile navbar drawer z-index overlap`
   - `docs: update API documentation for challenge submission`
3. Push to your fork/remote and create a Pull Request against `main`.
