# SETU Bug Fix Report
**Smart India Hackathon 2026 • Problem Statement ID: 26043**  
**Fix Date:** November 8, 2026

---

## Summary

| Priority | Bug | Status |
|---|---|---|
| P0 Critical | Plaintext passwords in seed database | **FIXED** |
| P0 Critical | All mutation routes unprotected (no auth middleware) | **FIXED** |
| P0 Critical | Admin analytics routes publicly accessible | **FIXED** |
| P0 Critical | Backend crashes on startup (imports frontend Vite module) | **FIXED** |
| P0 High | `postChatMessage` called with wrong argument type | **FIXED** |
| P1 High | `x-user-email` header completely bypasses JWT auth | **FIXED** |
| P1 High | CORS wildcard `*` in all environments | **FIXED** |
| P1 High | Profile save — no backend persistence | **FIXED** |
| P1 Medium | Settings purge — IndexedDB not cleared | **FIXED** |
| P1 Medium | `convState.domain` always undefined in challenge submit | **FIXED** |
| P2 Low | `bundledWebRuntime` deprecation warning in Capacitor | **FIXED** |
| P2 Low | Dead `semanticSearchService.js` file | **Already absent** |

---

## Bug #1 — Plaintext Passwords in Seed Database
**Severity:** P0 Critical — Security  
**File:** `database/seed/initialSeedData.json`

**Root Cause:** All 6 seed users had `"passwordHash": "setu123"` stored as plaintext.

**Fix:** Generated PBKDF2-SHA512 hashes (10,000 iterations, 64-byte key, random 16-byte salt) for all 6 seed users. The `verifyPassword()` function in `authUtils.js` already supported the `salt:hash` format. Deleted `database/data/setu_db.json` so it re-seeds from the fixed seed file on next startup.

**Verification:** `PASS 8.1` — confirmed no `"setu123"` values in seed; all logins work with hashed passwords.

---

## Bug #2 — All Mutation Routes Unprotected
**Severity:** P0 Critical — Security  
**File:** `backend/routes/challenges.js`

**Root Cause:** 8 POST/PUT routes had zero authentication or authorization middleware:
- `POST /:id/hei-decision`
- `POST /:id/form-team`
- `POST /:id/research-plan`
- `POST /:id/field-report`
- `POST /:id/patent`
- `POST /:id/fund`
- `POST /:id/reassign-hei`
- `PUT /:id/milestones`
- `PUT /:id`

Any unauthenticated request could accept university assignments, pledge CSR funding, or reassign government projects.

**Fix:** Mounted `requireAuth` + `requireRole(...)` on every mutation route with appropriate role restrictions:
- HEI decision, form-team, research-plan, field-report, patent, milestones → `UNIVERSITY | ADMIN | GOVERNMENT`
- Fund → `INDUSTRY | ADMIN | GOVERNMENT`
- Reassign HEI → `ADMIN | GOVERNMENT` only
- General update → `requireAuth` (any authenticated user)

**Verification:** `PASS 3.3`, `3.7`, `4.3`, `5.6`, `8.3`, `8.4` — all RBAC tests passed.

---

## Bug #3 — Admin Routes Publicly Accessible
**Severity:** P0 Critical — Security  
**File:** `backend/routes/admin.js`

**Root Cause:** `GET /analytics`, `GET /districts`, `GET /export-csv` had no middleware. Any unauthenticated request could download full statewide analytics and the complete challenge CSV.

**Fix:** Added `requireAuth + requireRole('ADMIN', 'GOVERNMENT')` to all three admin routes.

**Verification:** `PASS 1.9`, `1.10`, `1.11`, `5.1`, `5.3`, `5.7`.

---

## Bug #4 — Backend Crashes at Startup
**Severity:** P0 Critical — Runtime  
**File:** `backend/routes/chat.js`

**Root Cause:** `chat.js` imported `conversationEngine.js` from `../../src/services/conversationEngine.js`. That file uses `import.meta.env.VITE_API_BASE_URL` (a Vite-only API). Node.js has no `import.meta.env`, so the backend crashed immediately on startup with:
```
TypeError: Cannot read properties of undefined (reading 'VITE_API_BASE_URL')
```

**Fix:** Removed the frontend import. The backend chat route now drives its own stateless logic using ML classification (`classifySupportCase`) and the Gemini LLM directly, without depending on the browser-side conversation engine.

**Verification:** Backend starts cleanly. `PASS 6.6`, `6.7`.

---

## Bug #5 — postChatMessage Called with Wrong Argument Type
**Severity:** P0 High — Data Plumbing  
**File:** `src/components/ChatInterface.jsx`

**Root Cause:** `postChatMessage` signature is `postChatMessage({ conversationId, message })` (destructures an object), but `handleSendMessage` called it as `postChatMessage(sanitizedText)` (a plain string). Destructuring a string yields `conversationId = undefined`, `message = undefined`. The conversation engine never received the user's input.

**Fix:** Changed call to `postChatMessage({ conversationId: convState.conversationId, message: sanitizedText })`.

**Verification:** Chat engine now receives the correct `conversationId` and `message` on every turn.

---

## Bug #6 — x-user-email Header Bypasses JWT Auth
**Severity:** P1 High — Security  
**File:** `backend/middleware/authMiddleware.js`

**Root Cause:** `requireAuth` accepted `x-user-email` as a fallback for any environment. Any attacker knowing a valid email could send `x-user-email: admin@setu.jharkhand.gov.in` to authenticate as admin without a token.

**Fix:** Restricted the `x-user-email` fallback to `NODE_ENV !== 'production'` only. In development it still works for convenience (Vite dev server sends the header); in production it is a dead path.

**Verification:** `PASS 8.2` — explicitly noted as dev-mode allowed, production-blocked.

---

## Bug #7 — CORS Wildcard in All Environments
**Severity:** P1 High — Security  
**File:** `backend/config.js`

**Root Cause:** `corsOrigin: '*'` permitted cross-origin requests from any domain in any environment.

**Fix:**
```js
corsOrigin: process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGIN || 'https://setu.jharkhand.gov.in')
  : ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173']
```

**Verification:** `PASS 8.7`.

---

## Bug #8 — Profile Save Has No Backend Persistence
**Severity:** P1 High — Data Plumbing  
**File:** `src/pages/ProfilePage.jsx`

**Root Cause:** `handleSave` only called `updateUserProfile()` which writes to localStorage. Profile changes were lost when switching devices or clearing storage.

**Fix:**
1. Added `apiUpdateProfile()` to `src/services/apiClient.js` (calls `PUT /api/auth/profile`).
2. Updated `ProfilePage.jsx` to call `apiUpdateProfile()` after the local update. Backend route `PUT /api/auth/profile` already existed with `requireAuth` and whitelisted fields.

**Verification:** Profile saves both locally and to the server JSON database.

---

## Bug #9 — Settings Purge Did Not Clear IndexedDB
**Severity:** P1 Medium — Data Integrity  
**File:** `src/pages/SettingsPage.jsx`

**Root Cause:** "Purge Local History" button only cleared 4 `localStorage` keys but left the `SETU_OFFLINE_DB` IndexedDB database (containing offline drafts and sync queue) intact.

**Fix:** Added `indexedDB.deleteDatabase('SETU_OFFLINE_DB')` and `resetConversation()` to `handleDeleteHistory`.

**Verification:** All local storage cleared in a single user action.

---

## Bug #10 — convState.domain Always Undefined
**Severity:** P1 Medium — Data Plumbing  
**File:** `src/components/ChatInterface.jsx`

**Root Cause:** `handleRegisterChallenge` used `convState.domain` which is not a field on the conversation state object. It always resolved to `undefined`, falling back to the hardcoded `'Water Resources'` for every submission regardless of what the user described.

**Fix:** Changed to use `convState.detectedIntent || convState.domain || convState.intent || 'Water Resources'`. Also passed `urgencyPreference: convState.urgency` and the authenticated user's name/role/email instead of hardcoded strings.

**Verification:** Challenge submissions now carry the ML-detected domain and user identity.

---

## Remaining Known Issues (Not Fixed — Out of Scope)

| Issue | Why Not Fixed |
|---|---|
| No rate limiting on auth routes | Requires `express-rate-limit` — separate feature install |
| File upload (evidence photos) | Requires `multer` and storage backend — Phase 3 feature |
| Real EXIF stripping | Requires Canvas-based client processing — Phase 3 feature |
| GPS auto-fill from browser | HTML5 Geolocation + district bounding box matching — Phase 3 |
| `sendPasswordReset` is a stub | Requires email service (SMTP/SES) — Phase 3 |
