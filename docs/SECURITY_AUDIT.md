# SETU Security Audit Report
**Smart India Hackathon 2026 • Problem Statement ID: 26043**  
**Audit Date:** November 8, 2026  
**Classification:** Internal — Government of Jharkhand DHE&TE

---

## Audit Scope

This audit covers the SETU backend API (Node.js / Express 5), authentication system, database layer, frontend bundle, and Capacitor Android packaging.

---

## Findings Summary

| ID | Severity | Finding | Status |
|---|---|---|---|
| SEC-01 | Critical | Plaintext passwords in database | **FIXED** |
| SEC-02 | Critical | All mutation routes unauthenticated | **FIXED** |
| SEC-03 | Critical | Admin analytics publicly accessible | **FIXED** |
| SEC-04 | Critical | Backend crash via frontend Vite import | **FIXED** |
| SEC-05 | High | x-user-email header bypasses JWT entirely | **FIXED (dev-only)** |
| SEC-06 | High | CORS wildcard `*` in production | **FIXED** |
| SEC-07 | Medium | JWT secret hardcoded fallback | **ACCEPTED RISK** |
| SEC-08 | Medium | No rate limiting on auth endpoints | **OPEN** |
| SEC-09 | Medium | `webContentsDebuggingEnabled: true` in Capacitor | **FIXED** |
| SEC-10 | Low | Time-based predictable user IDs | **ACCEPTED RISK** |
| SEC-11 | Low | DEMO_ACCOUNTS with plaintext passwords in frontend bundle | **ACCEPTED RISK** |

---

## SEC-01 — Plaintext Passwords in Database
**Severity:** Critical  
**CVSS Base Score:** 9.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N)

**Description:** All 6 seed users had `passwordHash: "setu123"` stored as literal plaintext in both `initialSeedData.json` and the live `setu_db.json`. Any read access to the database file would expose all user passwords.

**Status: FIXED**  
All seed passwords now use PBKDF2-SHA512 with a random 16-byte salt per user (format: `hex_salt:hex_hash`). The `verifyPassword()` function uses `crypto.timingSafeEqual()` to prevent timing-based attacks. New user registrations have used PBKDF2 from the beginning.

---

## SEC-02 — All Mutation Routes Unauthenticated
**Severity:** Critical  
**CVSS Base Score:** 9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)

**Description:** Eight POST/PUT routes in `challenges.js` had zero middleware. An unauthenticated attacker could:
- Accept/reject university assignments on behalf of any HEI
- Create fictitious CSR funding transactions
- Reassign government projects to arbitrary institutions
- Overwrite milestone data

**Status: FIXED**  
All routes now require `requireAuth` + `requireRole(...)` with least-privilege roles:
- HEI operations: `UNIVERSITY | ADMIN | GOVERNMENT`
- CSR funding: `INDUSTRY | ADMIN | GOVERNMENT`
- HEI reassignment: `ADMIN | GOVERNMENT` only

---

## SEC-03 — Admin Analytics Publicly Accessible
**Severity:** Critical  
**CVSS Base Score:** 8.6 (AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N)

**Description:** `GET /api/admin/analytics`, `GET /api/admin/districts`, and `GET /api/admin/export-csv` had no authentication. The CSV export exposed full citizen data including names, emails, phone numbers, GPS coordinates, and challenge descriptions.

**Status: FIXED**  
All three admin routes now require `requireAuth + requireRole('ADMIN', 'GOVERNMENT')`.

---

## SEC-04 — Backend Crash via Frontend Vite Module
**Severity:** Critical  
**CVSS Base Score:** 7.5 (AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H) — Denial of Service

**Description:** `backend/routes/chat.js` imported `../../src/services/conversationEngine.js` which contains `import.meta.env` — a Vite/bundler-only API that does not exist in Node.js. The backend crashed on every startup with a `TypeError`.

**Status: FIXED**  
Removed the cross-boundary import. Backend chat route now uses ML + LLM services directly.

---

## SEC-05 — x-user-email Header Bypasses JWT
**Severity:** High  
**CVSS Base Score:** 8.1 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N)

**Description:** `requireAuth` in `authMiddleware.js` accepted `x-user-email: admin@setu.jharkhand.gov.in` as a valid authentication mechanism for any environment. An attacker with knowledge of any registered email address could:
- Authenticate as that user with zero credentials
- In production, impersonate government administrators

**Status: FIXED**  
The `x-user-email` fallback is now gated by `process.env.NODE_ENV !== 'production'`. In production deployments, only signed HMAC-SHA256 Bearer tokens are accepted.

**Residual Risk:** In development the bypass remains active for developer convenience. This is acceptable as the development environment does not hold production data.

---

## SEC-06 — CORS Wildcard in All Environments
**Severity:** High  
**CVSS Base Score:** 6.5 (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N)

**Description:** `corsOrigin: '*'` permitted any website to make cross-origin requests to the SETU API. While the API uses Bearer tokens (not cookies), this violates defence-in-depth and the Government of India's IT Security Framework.

**Status: FIXED**  
Development: `localhost:5173`, `localhost:4173`, `127.0.0.1:5173`  
Production: `process.env.CORS_ORIGIN` or `https://setu.jharkhand.gov.in`

---

## SEC-07 — JWT Secret Hardcoded Fallback
**Severity:** Medium  
**CVSS Base Score:** 5.9

**Description:** `config.js` falls back to `'setu_jwt_secret_default_key_2026'` if `JWT_SECRET` env var is not set. This value is visible in the source code repository. Any deployment that omits `JWT_SECRET` from `.env` would use this known weak secret, allowing token forgery.

**Status: ACCEPTED RISK**  
The `.env` file includes `JWT_SECRET` set to a non-default value. The fallback is retained as a development convenience only.

**Recommendation:** Add a startup assertion that crashes the server if `JWT_SECRET` equals the default value in `NODE_ENV=production`.

---

## SEC-08 — No Rate Limiting on Authentication Endpoints
**Severity:** Medium  
**CVSS Base Score:** 5.3

**Description:** `POST /api/auth/login` and `POST /api/auth/register` have no rate limiting. An attacker can perform unlimited brute-force attempts against user passwords.

**Status: OPEN**

**Recommended Fix:**
```bash
npm install express-rate-limit
```
```js
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

---

## SEC-09 — WebContents Debugging Enabled in Capacitor
**Severity:** Medium  
**CVSS Base Score:** 5.0

**Description:** `capacitor.config.json` had `webContentsDebuggingEnabled: true`. This allows anyone with USB access to the Android device to connect Chrome DevTools and inspect all JavaScript execution, network requests, localStorage, IndexedDB, and auth tokens.

**Status: FIXED**  
Changed to `webContentsDebuggingEnabled: false` in the updated `capacitor.config.json`.

---

## SEC-10 — Time-Based Predictable User IDs
**Severity:** Low  
**CVSS Base Score:** 3.1

**Description:** `backend/routes/auth.js` generates user IDs using the last 6 digits of `Date.now()` (e.g., `CITIZEN-452938`). These IDs are predictable and enumerable. Combined with an endpoint that returns user data by ID, this could allow user enumeration.

**Status: ACCEPTED RISK**  
User IDs are not exposed via public endpoints. The only user-lookup route is `GET /auth/me` which returns only the authenticated user's own data. No user-by-ID lookup is publicly accessible.

---

## SEC-11 — DEMO_ACCOUNTS with Plaintext Passwords in Frontend Bundle
**Severity:** Low  
**CVSS Base Score:** 2.7

**Description:** `src/services/authService.js` exports a `DEMO_ACCOUNTS` object that includes `password: 'setu123'` for all demo accounts. This is compiled into the frontend JS bundle and is visible to anyone who inspects `dist/assets/index-*.js`.

**Status: ACCEPTED RISK — Prototype Context**  
The demo accounts are intentional prototype credentials for SIH evaluation. Inspecting browser JS to find these credentials gives no additional access beyond what the credentials themselves allow. Before a production deployment serving real citizens, these hardcoded credentials should be removed and the fallback offline auth path eliminated.

---

## Authentication Architecture — Final State

```
Login Request
    │
    ▼
POST /api/auth/login
    │── verifyPassword(password, PBKDF2_hash) [PBKDF2-SHA512, timing-safe]
    │── generateToken(user) [HMAC-SHA256, exp=7days]
    └── Returns { user, token }

Protected Request
    │
    ▼
requireAuth middleware
    │── Extract Bearer token from Authorization header
    │── verifyToken(token) [HMAC-SHA256 signature check, expiry check]
    │── findOne('users', id) [database lookup]
    │── Attach req.user (passwordHash removed)
    └── next() → route handler

    │── x-user-email fallback: dev only (NODE_ENV !== 'production')

requireRole(...allowedRoles)
    │── Check req.user.role against allowed list
    │── ADMIN ↔ GOVERNMENT treated as equivalent
    └── 403 Forbidden if role not in list
```

---

## Production Deployment Checklist

Before live deployment on government infrastructure:

- [ ] Set `JWT_SECRET` to a cryptographically random 64-char secret in `.env`
- [ ] Set `NODE_ENV=production` in the deployment environment
- [ ] Set `CORS_ORIGIN=https://setu.jharkhand.gov.in`
- [ ] Install and configure `express-rate-limit` (SEC-08)
- [ ] Remove `DEMO_ACCOUNTS` plaintext passwords from `authService.js` (SEC-11)
- [ ] Enable HTTPS termination at the reverse proxy (Nginx / AWS ALB)
- [ ] Set `Secure; HttpOnly; SameSite=Strict` if tokens are moved to cookies
- [ ] Configure security headers: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`
- [ ] Remove `webContentsDebuggingEnabled` entirely from production Capacitor config ✅ (already done)
