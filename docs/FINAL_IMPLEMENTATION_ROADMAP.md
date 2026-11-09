# SETU – Final Implementation Roadmap & Action Plan
**Smart India Hackathon 2026 • Problem Statement ID: 26043**
*Department of Higher & Technical Education, Government of Jharkhand*

---

## 1. Roadmap Overview & Strategic Phasing

To transform the current SETU codebase from a verified functional prototype into an award-winning, production-grade Smart India Hackathon submission, implementation is structured into **5 sequential phases**.

```
[Phase 1: Critical Plumbing] ──> [Phase 2: Security & Auth] ──> [Phase 3: Media & Privacy]
                                                                        │
                                                                        ▼
[Phase 5: SIH NEP 2020 Features & PWA] <── [Phase 4: ML & Deduplication]
```

---

## 2. Phase 1: Critical Data Plumbing & UI-Backend Integration
*Estimated Effort: 1–2 Days • Priority: P0 (Blocker)*

### Objectives:
Close the loop between frontend user interactions and backend persistent storage. Ensure all dashboards and portals display live database state rather than mock arrays.

### Detailed Tasks:
1. **Connect Chat Problem Submission to Central Database**:
   - In `src/components/ChatInterface.jsx` and `src/services/conversationEngine.js`, call `apiCreateChallenge()` when a user confirms their problem statement.
   - Map conversational answers (district, problem text, domain, urgency) to `SocietalChallenge` schema.
   - Verify newly submitted issues immediately appear in `GET /api/challenges` and `SupportGrid.jsx`.

2. **Connect State Analytics Dashboard to Live API**:
   - In `src/pages/AdminPortalPage.jsx`, import `apiGetAdminAnalytics` from `apiClient.js`.
   - Replace hardcoded `districtData`, `domainData`, and `heiLeaderboard` arrays with live metrics returned from `GET /api/admin/analytics`.
   - Add graceful loading skeletons while metrics compute.

3. **Persist University Milestones to Database**:
   - Add backend route `PUT /api/challenges/:id/milestones` in `backend/routes/challenges.js`.
   - Update `src/components/MyJourneyView.jsx` to call `apiUpdateMilestones(challengeId, updatedMilestones)`.
   - Verify milestone progress survives browser page reloads.

4. **Wire Profile & Settings Pages to Live Auth State**:
   - In `src/pages/ProfilePage.jsx`, replace `Alex Rivers` with `getCurrentUser()`.
   - Allow user to update phone number, preferred language, and notification settings.
   - In `src/pages/SettingsPage.jsx`, wire "Delete History" button to actually purge `localStorage` and reset conversation state.

5. **Clean Dead Code**:
   - Safely remove unused `src/services/semanticSearchService.js`.

---

## 3. Phase 2: Security, Authentication & Role Authorization
*Estimated Effort: 1 Day • Priority: P0 (Security Compliance)*

### Objectives:
Elevate authentication and authorization to meet government-grade software security standards.

### Detailed Tasks:
1. **Cryptographic JWT Implementation**:
   - Update `backend/routes/auth.js` to sign real JSON Web Tokens using `jsonwebtoken` library and `process.env.JWT_SECRET`.
   - Set standard token expiration (24 hours).
   - Return decoded payload `{ id, email, role, name, institution }`.

2. **Password Security**:
   - Replace plaintext passwords in `database/seed/initialSeedData.json` and `setu_db.json` with bcrypt-hashed passwords.
   - Update `backend/routes/auth.js` to verify password hashes using `bcrypt.compare()`.

3. **Mount Role Authorization Middleware**:
   - Mount `requireAuth` and `requireRole` on sensitive backend mutation routes:
     - `POST /api/challenges` -> Requires authenticated `CITIZEN`, `UNIVERSITY`, or `ADMIN`.
     - `POST /api/challenges/:id/assign-hei` -> Requires `ADMIN` or `GOVERNMENT`.
     - `POST /api/challenges/:id/form-team` -> Requires `UNIVERSITY` faculty lead.
     - `POST /api/challenges/:id/fund` -> Requires `INDUSTRY` partner.

4. **Tighten CORS & Environment Security**:
   - Update `backend/server.js` to restrict CORS to trusted development and deployment origins rather than wildcard `*`.

---

## 4. Phase 3: Media Upload, Real EXIF Scrubbing & Geolocation
*Estimated Effort: 2 Days • Priority: P1 (Key Differentiator)*

### Objectives:
Provide citizens with real evidence attachment capabilities while guaranteeing cryptographic privacy.

### Detailed Tasks:
1. **Backend Multipart File Upload Engine**:
   - Install `multer` on Express backend.
   - Create route `POST /api/challenges/upload` accepting image and video formats (`.jpg`, `.jpeg`, `.png`, `.mp4`).
   - Store uploaded files under `public/uploads/` with UUID-based filenames.

2. **Real Binary EXIF Metadata Stripping**:
   - In `src/services/privacyService.js`, implement true client-side EXIF removal using HTML5 Canvas (`drawImage` to clean Blob) before network transmission.
   - Remove GPS coordinates, camera model tags, and software metadata from image binaries.

3. **HTML5 Geolocation & Reverse Geocoding**:
   - In `ChatInterface.jsx`, add a "Detect My Location" button utilizing `navigator.geolocation.getCurrentPosition()`.
   - Match detected coordinates against bounding boxes of Jharkhand's 24 districts to automatically pre-select district and block.

---

## 5. Phase 4: Machine Learning & Semantic Deduplication
*Estimated Effort: 2 Days • Priority: P1 (Core Problem Statement Requirement)*

### Objectives:
Upgrade ML and AI components to deliver state-of-the-art deduplication and domain classification.

### Detailed Tasks:
1. **Dataset Expansion**:
   - Expand `ml/data/sample/jharkhand_societal_challenges_dataset.csv` from 58 samples to 300+ balanced samples.
   - Incorporate authentic regional Jharkhand vocabulary (e.g. *chua*, *jharia*, *bandh*, *mandua*, *lac*, *tussar silk*, *sabai grass*, *kendu leaf*).

2. **Advanced Semantic Deduplication**:
   - Create `backend/routes/ml.js` endpoint `POST /api/ml/deduplicate`.
   - Calculate TF-IDF cosine similarity between a new problem description and all existing challenges in the same district.
   - Flag potential duplicate submissions if similarity exceeds 0.72 threshold, linking the submitter to the existing university project.

3. **Active Gemini LLM Generative Extraction**:
   - Wire a valid Google Gemini API key into `.env`.
   - Leverage Gemini for automatic structured JSON extraction of local stakeholders, potential environmental hazards, and recommended university research departments.

---

## 6. Phase 5: SIH NEP 2020 Features, PWA & Production Deployment
*Estimated Effort: 2 Days • Priority: P2 (Competition Excellence)*

### Objectives:
Deliver distinctive features that directly satisfy Problem Statement 26043 evaluators.

### Detailed Tasks:
1. **NEP 2020 Experiential Learning Credit Logbook**:
   - Build student portal tab in `MyJourneyView.jsx` showing approved research hours (e.g. 120 hours logged = 3 Academic Credits).
   - Provide faculty verification and digital certificate generation.

2. **Government Nodal Officer Verification Queue**:
   - Build a dedicated triage interface in `AdminPortalPage.jsx` allowing State Nodal Officers to mark submitted challenges as `VERIFIED`, `REJECTED`, or `ASSIGNED_TO_HEI`.

3. **Multi-Tranche CSR Funding Schedule**:
   - Upgrade `IndustryPortalPage.jsx` modal to support milestone-based grant releases (30% Team Formation, 40% Prototype, 30% Field Deployment).

4. **Offline Progressive Web App (PWA) Mode**:
   - Add `manifest.json` and a Service Worker (`sw.js`) with cache-first strategy for static assets.
   - Enable rural citizens to draft problem submissions offline using IndexedDB, syncing automatically when connectivity resumes.

---

## 7. Immediate Next Steps (Priority Order)

| Step # | Task | Target Component | Estimated Time |
| :---: | :--- | :--- | :---: |
| **1** | Connect Chat problem submission to `POST /api/challenges` | `conversationEngine.js`, `ChatInterface.jsx` | 45 min |
| **2** | Connect Admin Dashboard to live `GET /api/admin/analytics` | `AdminPortalPage.jsx`, `apiClient.js` | 30 min |
| **3** | Persist university milestones via backend API | `MyJourneyView.jsx`, `challenges.js` | 40 min |
| **4** | Wire Profile and Settings pages to active auth state | `ProfilePage.jsx`, `SettingsPage.jsx` | 30 min |
| **5** | Delete dead file `src/services/semanticSearchService.js` | Project cleanup | 5 min |
| **6** | Implement JWT signing & mount auth middleware | `backend/routes/auth.js`, `server.js` | 60 min |
