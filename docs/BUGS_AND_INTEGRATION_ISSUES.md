# SETU – Bugs & Integration Issues Report
**Smart India Hackathon 2026 • Problem Statement ID: 26043**
*Department of Higher & Technical Education, Government of Jharkhand*

---

## 1. Summary of Identified Defects

During the rigorous codebase inspection, 12 specific integration issues, architectural bugs, and security vulnerabilities were identified. These issues explain discrepancies between user expectations and runtime behavior.

---

## 2. High-Severity Integration Gaps

### Bug #1: Chat Problem Submission Does Not Save to Backend Database
- **Location**: `src/components/ChatInterface.jsx`, `src/services/conversationEngine.js`
- **Root Cause**: When a citizen completes the 12-stage conversational problem intake, `conversationEngine.js` saves the submission into browser `localStorage` as a legacy `case` object via `store.js`.
- **Impact**: The backend database (`database/data/setu_db.json`) never receives the new societal challenge. If another user or an administrator opens the portal on a different device, the submitted challenge is invisible.
- **Fix Required**: Call `apiCreateChallenge()` inside `conversationEngine.js` or `ChatInterface.jsx` to persist the new challenge to `POST /api/challenges`.

---

### Bug #2: State Analytics Dashboard Renders Static Hardcoded Numbers
- **Location**: `src/pages/AdminPortalPage.jsx`
- **Root Cause**: Lines 28–52 define static constants:
  ```javascript
  const districtData = [ { district: 'Ranchi', count: 340, activeProjects: 18, color: '#00F2FE' }, ... ];
  const domainData = [ { domain: 'Water Resources & Sanitation', pct: 32, count: 473, color: '#00F2FE' }, ... ];
  const heiLeaderboard = [ { name: 'Birla Institute of Technology (BIT), Mesra', projects: 18, ... } ];
  ```
- **Impact**: The dashboard displays static numbers and completely ignores the live `GET /api/admin/analytics` endpoint and real changes in `setu_db.json`.
- **Fix Required**: Add a `useEffect` hook in `AdminPortalPage.jsx` calling `apiGetAdminAnalytics()`, populating state with real database metrics, and falling back gracefully.

---

### Bug #3: HEI Milestone Progress Mutates Local React State Only
- **Location**: `src/components/MyJourneyView.jsx`
- **Root Cause**: `handleToggleMilestone` and `handleAddMilestone` only execute:
  ```javascript
  setActiveChallenge(updated);
  setChallenges(challenges.map(c => c.id === updated.id ? updated : c));
  ```
- **Impact**: Milestone completions and additions are lost upon browser page refresh because no PUT/POST API call updates `database/data/setu_db.json`.
- **Fix Required**: Add a backend endpoint `PUT /api/challenges/:id/milestones` and call it from `MyJourneyView.jsx`.

---

### Bug #4: Profile Page Uses Disconnected Hardcoded Alex Rivers Identity
- **Location**: `src/pages/ProfilePage.jsx`
- **Root Cause**: Lines 6–7 initialize state with hardcoded legacy constants:
  ```javascript
  const [preferredName, setPreferredName] = useState('Alex Rivers');
  const [studentId, setStudentId] = useState('STU-882910');
  ```
- **Impact**: Regardless of whether a user logs in as `citizen@setu.jharkhand.gov.in` (Rameshwar Mahato) or `admin@setu.jharkhand.gov.in`, the profile always displays "Alex Rivers".
- **Fix Required**: Wire `ProfilePage.jsx` to `getCurrentUser()` from `src/services/authService.js` and allow saving updates back to user state.

---

### Bug #5: Settings Page History Deletion is a Mock Alert
- **Location**: `src/pages/SettingsPage.jsx`
- **Root Cause**: Lines 10–15:
  ```javascript
  const handleDeleteHistory = () => {
    if (confirm("Are you sure you want to permanently purge all conversation history...?")) {
      setDeletedSuccess(true);
      setTimeout(() => setDeletedSuccess(false), 3000);
    }
  };
  ```
- **Impact**: No data is actually deleted from `localStorage` or `sessionStorage`.
- **Fix Required**: Execute `localStorage.removeItem('SETU_CONVERSATION_STATE_V1')` and invoke `resetConversation()`.

---

## 3. Security & Authentication Vulnerabilities

### Security Issue #1: Unprotected Backend Routes
- **Location**: `backend/routes/challenges.js`, `backend/routes/admin.js`, `backend/routes/chat.js`
- **Root Cause**: While `backend/middleware/authMiddleware.js` contains `requireAuth` and `requireRole`, **neither function is attached to any route**.
- **Impact**: Any unauthenticated client can trigger `POST /api/challenges`, assign universities, or fund projects without credentials.
- **Fix Required**: Mount `requireAuth` and `requireRole('UNIVERSITY', 'ADMIN')` on sensitive mutation routes.

---

### Security Issue #2: Plaintext Password Storage & Fake JWT Tokens
- **Location**: `database/seed/initialSeedData.json`, `database/data/setu_db.json`, `backend/routes/auth.js`
- **Root Cause**: Passwords are stored in plaintext (`setu123`). The login route generates pseudo-tokens using string concatenation:
  ```javascript
  token: `setu_token_${user.id}_${Date.now()}`
  ```
- **Impact**: Does not meet security audit standards for government portals. Tokens cannot be cryptographically verified for authenticity or expiration.
- **Fix Required**: Use `bcrypt` or standard PBKDF2 for password hashing, and sign tokens using `jsonwebtoken` with the `JWT_SECRET` from `.env`.

---

### Security Issue #3: Wide Open CORS Origin
- **Location**: `backend/server.js`, `backend/config.js`
- **Root Cause**: `corsOrigin: '*'` is configured without environment restriction.
- **Impact**: Allows cross-origin requests from arbitrary untrusted domains.
- **Fix Required**: Restrict CORS to `http://localhost:5173` in development and configured production domain in production.

---

## 4. Machine Learning & Python IPC Issues

### ML Issue #1: Scikit-Learn Model Deserialization Crash
- **Location**: `ml/models/intent_model/`, `ml/models/urgency_model/`, `ml/src/predict.py`
- **Root Cause**: Pickled `.joblib` model files serialized under a different scikit-learn version failed to load in modern scikit-learn (1.5.1+) with:
  ```text
  AttributeError: 'LogisticRegression' object has no attribute 'multi_class'
  ```
- **Impact**: `backend/services/ml/mlClient.js` failed Python execution and fell back silently to heuristic pattern rules.
- **Status**: **RESOLVED** by executing `python ml/src/train_intent.py` and `python ml/src/train_urgency.py` locally, generating compatible model binaries.
- **Action Required**: Add an automatic model verification check on server startup.

---

### ML Issue #2: Small Dataset Size Affects Multiclass Generalization
- **Location**: `ml/data/sample/jharkhand_societal_challenges_dataset.csv`
- **Root Cause**: Dataset contains 58 samples across 6 classes (~9–10 samples per domain).
- **Impact**: While test accuracy is acceptable for high-frequency terms, uncommon regional terminology can cause classification uncertainty.
- **Fix Required**: Expand dataset to 300+ balanced samples representing real field problems from all 24 Jharkhand districts.

---

## 5. Dead Code & Legacy Remnants

### Dead Code #1: `src/services/semanticSearchService.js`
- **Location**: `src/services/semanticSearchService.js`
- **Root Cause**: 115 lines of legacy student exam anxiety and dorm life search catalogs.
- **Status**: Audit confirmed this file is **not imported or referenced anywhere in `src/`**.
- **Action Required**: Remove this file or replace it with a real societal challenge semantic search service.

---

### Privacy Stub #1: `stripExifMetadata` Does Not Strip Binary EXIF Bytes
- **Location**: `src/services/privacyService.js`
- **Root Cause**: Returns a mock object with `gpsStripped: true` without actually processing image binary buffers.
- **Impact**: Uploaded images still contain original camera metadata.
- **Fix Required**: Implement client-side Canvas redraw (`drawImage` to stripped blob) or use `piexifjs` to cleanly scrub EXIF tags.
