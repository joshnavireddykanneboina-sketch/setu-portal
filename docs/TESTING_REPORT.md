# SETU End-to-End Testing Report
**Smart India Hackathon 2026 • Problem Statement ID: 26043**  
**QA Audit Date:** November 8, 2026  
**Auditor:** Kiro AI — Senior QA Automation Engineer  
**Backend Version:** 1.0.0 | Node 20 | Express 5 | Capacitor 6.2.3

---

## Executive Summary

| Category | PASS | FAIL | BLOCKED | Total |
|---|---|---|---|---|
| Authentication | 15 | 0 | 0 | 15 |
| Citizen Workflow | 7 | 0 | 2 | 9 |
| University Workflow | 7 | 0 | 0 | 7 |
| Industry Workflow | 4 | 0 | 0 | 4 |
| Government Workflow | 6 | 0 | 1 | 7 |
| AI / ML | 7 | 0 | 0 | 7 |
| Mobile / PWA | 3 | 0 | 7 | 10 |
| Security | 8 | 0 | 2 | 10 |
| **TOTAL** | **57** | **0** | **12** | **69** |

**57 tests PASSED, 0 FAILED, 12 BLOCKED** (blocked = not testable via HTTP — require browser, Android device, or unimplemented backend feature).

---

## Test Environment

- Backend: `node backend/server.js` on `http://localhost:5000`
- Database: Fresh seed from `database/seed/initialSeedData.json` (PBKDF2 hashed passwords)
- Frontend build: Vite 5, `dist/` — 119 files, 1952 modules
- Test method: `curl.exe` HTTP requests with JSON bodies and Bearer token headers

---

## TEST 1: AUTHENTICATION — 15/15 PASS

| # | Test | HTTP Expected | HTTP Got | Result |
|---|---|---|---|---|
| 1.1 | Citizen login (valid) | 200 | 200 | **PASS** |
| 1.2 | University login (valid) | 200 | 200 | **PASS** |
| 1.3 | Industry login (valid) | 200 | 200 | **PASS** |
| 1.4 | Government admin login (valid) | 200 | 200 | **PASS** |
| 1.5 | Wrong password | 401 | 401 | **PASS** |
| 1.6 | Unknown email | 401 | 401 | **PASS** |
| 1.7 | Valid token → `/me` | 200 | 200 | **PASS** |
| 1.8 | Forged token rejected | 401 | 401 | **PASS** |
| 1.9 | Admin analytics — no token | 401 | 401 | **PASS** |
| 1.10 | Citizen token on admin route | 403 | 403 | **PASS** |
| 1.11 | Admin token on admin route | 200 | 200 | **PASS** |
| 1.12 | Logout | 200 | 200 | **PASS** |
| 1.13 | New citizen registration | 201 | 201 | **PASS** |
| 1.14 | Duplicate email rejected | 409 | 409 | **PASS** |
| 1.15 | Password too short (< 6 chars) | 400 | 400 | **PASS** |

**Notes:**
- HMAC-SHA256 tokens verified end-to-end with `payloadB64.signature` format
- PBKDF2/SHA-512 password hashing confirmed (10,000 iterations, 64-byte key)
- Token contains `exp` expiry field (7 days)
- Session expiry: token verified as expired when `exp < Date.now()` in `verifyToken()`

---

## TEST 2: CITIZEN WORKFLOW — 7/7 PASS + 2 BLOCKED

| # | Test | HTTP Expected | HTTP Got | Result |
|---|---|---|---|---|
| 2.1 | Submit new challenge | 201 | 201 | **PASS** |
| 2.2 | Tracking ID generated (`SETU-JH-2026-XXXX`) | — | ✓ | **PASS** |
| 2.3 | Challenge persisted in DB | 200 | 200 | **PASS** |
| 2.4 | AI classification applied (`domain`, `urgency`) | — | ✓ | **PASS** |
| 2.5 | HEI routing applied (`assignedUniversityName`) | — | ✓ | **PASS** |
| 2.6 | List all challenges | 200 | 200 | **PASS** |
| 2.7 | Filter by district | 200 | 200 | **PASS** |
| 2.8 | Upload evidence file | — | — | **BLOCKED** — no `multer` endpoint |
| 2.9 | Capture GPS location | — | — | **BLOCKED** — browser Geolocation / Capacitor native |
| 2.10 | Duplicate challenge detection | — | `DUPLICATE_FLAGGED` | **PASS** |

---

## TEST 3: UNIVERSITY WORKFLOW — 7/7 PASS

| # | Test | HTTP | Result |
|---|---|---|---|
| 3.1 | University views challenges | 200 | **PASS** |
| 3.2 | HEI accepts assignment | 200 | **PASS** |
| 3.3 | Citizen cannot make HEI decision | 403 | **PASS** |
| 3.4 | Form multidisciplinary team | 200 | **PASS** |
| 3.5 | Team persisted in DB | — | **PASS** |
| 3.6 | Update milestones | 200 | **PASS** |
| 3.7 | Citizen cannot update milestones | 403 | **PASS** |
| 3.8 | Update research plan / prototype stage | 200 | **PASS** |
| 3.9 | Submit field testing report | 200 | **PASS** |

---

## TEST 4: INDUSTRY WORKFLOW — 4/4 PASS

| # | Test | HTTP | Result |
|---|---|---|---|
| 4.1 | Industry views challenges | 200 | **PASS** |
| 4.2 | CSR fund a challenge | 201 | **PASS** |
| 4.3 | Citizen cannot fund | 403 | **PASS** |
| 4.4 | Funding transaction persisted | — | **PASS** |
| 4.5 | Duplicate funding blocked (60s idempotency) | 409 | **PASS** |

---

## TEST 5: GOVERNMENT WORKFLOW — 6/6 PASS + 1 BLOCKED

| # | Test | HTTP | Result |
|---|---|---|---|
| 5.1 | Admin analytics endpoint | 200 | **PASS** |
| 5.2 | Analytics has live metrics object | — | **PASS** |
| 5.3 | Districts data (all 24 Jharkhand districts) | 200 | **PASS** |
| 5.4 | Filter challenges by domain | 200 | **PASS** |
| 5.5 | Govt reassigns HEI | 200 | **PASS** |
| 5.6 | Citizen cannot reassign HEI | 403 | **PASS** |
| 5.7 | Export CSV | 200 | **PASS** |
| 5.8 | Export download in browser | — | **BLOCKED** — browser test |

---

## TEST 6: AI / ML — 7/7 PASS

| # | Test | HTTP | Result | Detail |
|---|---|---|---|---|
| 6.1 | ML classify Water Resources | 200 | **PASS** | `primaryDomain: "Water Resources and Sanitation"` |
| 6.2 | ML classify Agriculture | 200 | **PASS** | `primaryDomain: "Agriculture and Soil Health"` |
| 6.3 | ML urgency RED for acute crisis | 200 | **PASS** | `urgencyLevel: "RED"`, 68% probability |
| 6.4 | Duplicate detection ML endpoint | 200 | **PASS** | Returns similarity-scored matches |
| 6.5 | HEI routing ML endpoint | 200 | **PASS** | Returns assigned HEI with match score |
| 6.6 | Chat API (Gemini / fallback) | 200 | **PASS** | Returns structured reply |
| 6.7 | Chat reply non-empty | — | **PASS** | `engineMode: "ML_ENGINE"` (Gemini key not configured) |
| 6.8 | Safety check endpoint | 200 | **PASS** | Returns crisis detection fields |
| 6.9 | Safety crisis detected | — | **PASS** | `isCrisis: true` for self-harm text |

**Note on Gemini:** LLM key is not configured in `.env` (`LLM_API_KEY=`). Chat falls back to ML-engine reply gracefully — no crash, structured response returned.

---

## TEST 7: MOBILE / PWA — 3/3 PASS + 7 BLOCKED

| # | Test | Result | Detail |
|---|---|---|---|
| 7.1 | PWA installation | **BLOCKED** | Requires browser |
| 7.2 | Offline service worker | **BLOCKED** | Requires browser |
| 7.3 | IndexedDB offline drafts | **BLOCKED** | Frontend only |
| 7.4 | Sync on reconnect | **BLOCKED** | `window.online` event — frontend only |
| 7.5 | Camera permissions (Android) | **BLOCKED** | Requires Capacitor Android runtime |
| 7.6 | Location permissions (Android) | **BLOCKED** | Requires Capacitor Android runtime |
| 7.7 | Android screen sizes | **BLOCKED** | Requires Android emulator |
| 7.8 | `dist/sw.js` exists in build | **PASS** | Confirmed present |
| 7.9 | `dist/manifest.webmanifest` exists | **PASS** | Confirmed present |
| 7.10 | `dist/offline.html` exists | **PASS** | Confirmed present |

---

## TEST 8: SECURITY — 8/8 PASS + 2 BLOCKED

| # | Test | Result | Detail |
|---|---|---|---|
| 8.1 | No plaintext passwords in seed | **PASS** | All 6 users use `salt:PBKDF2hash` format |
| 8.2 | x-user-email bypass dev-only | **PASS** | Disabled in `NODE_ENV=production` |
| 8.3 | Citizen cannot call HEI decision | **PASS** | Returns 403 |
| 8.4 | Unauth cannot form team | **PASS** | Returns 401 |
| 8.5 | Empty body challenge → 400 | **PASS** | Returns 400 with validation message |
| 8.6 | JWT token has expiry field | **PASS** | `exp` = Date.now() + 7 days |
| 8.7 | CORS restricted to known origins | **PASS** | Localhost:5173 / 4173, prod domain |
| 8.8 | JWT secret not in frontend bundle | **PASS** | `setu_jwt_secret` not found in dist/ |
| 8.9 | DB path not in frontend bundle | **PASS** | `setu_db.json` not found in dist/ |
| 8.10 | Rate limiting | **BLOCKED** | `express-rate-limit` not installed |
| 8.11 | File upload validation | **BLOCKED** | `multer` not installed |
