# SETU – Missing Features & Gap Analysis
**Smart India Hackathon 2026 • Problem Statement ID: 26043**
*Department of Higher & Technical Education, Government of Jharkhand*

---

## 1. Problem Statement Requirements vs. Current Implementation

Smart India Hackathon 2026 Problem Statement 26043 mandates a comprehensive digital collaboration platform that:
1. Crowdsources real-world societal problems across rural and urban Jharkhand from citizens, Panchayati Raj Institutions (PRIs), and Urban Local Bodies (ULBs).
2. Leverages AI/ML for automatic domain classification, urgency triaging, and semantic deduplication.
3. Automatically matches and allocates validated challenges to Higher Education Institutions (HEIs) for multidisciplinary student-faculty R&D.
4. Incentivizes experiential learning and academic credits under the National Education Policy (NEP 2020).
5. Engages corporate industry partners and MSMEs for CSR seed funding, technical mentorship, and pilot manufacturing.
6. Tracks solution milestones, field deployments, intellectual property (patents), and spin-off startup incubation.

Below is the structured gap analysis identifying what is currently missing to fulfill the full mandate.

---

## 2. Detailed Gap Analysis by Subsystem

### Subsystem A: Citizen & PRI Crowdsourcing Intake
| Feature | Current State | Missing Functionality | Status |
| :--- | :--- | :--- | :--- |
| **Real File Evidence Upload** | Mock list of attachments in React state | Real multipart form-data upload endpoint (`multer`), saving images/videos to disk or cloud object storage. | **NOT IMPLEMENTED** |
| **Real EXIF Metadata Stripping** | Returns mock metadata object | Client-side HTML5 Canvas or backend binary buffer parser that strips GPS EXIF metadata before file storage to guarantee anonymity. | **PARTIALLY IMPLEMENTED** |
| **GPS Geolocation & Reverse Geocoding** | Hardcoded Dumka/Jama coordinates | Browser `navigator.geolocation.getCurrentPosition()` integration with reverse geocoding to auto-fill district and block. | **NOT IMPLEMENTED** |
| **Jharkhand Administrative Hierarchy** | Hardcoded district strings | Complete structured master list of all 24 Jharkhand districts, 260+ blocks, and municipal corporations (Ranchi Municipal Corp, Dhanbad, etc.). | **PARTIALLY IMPLEMENTED** |
| **Voice / Speech Input** | Web Speech API hook in chat | Integration with Bhashini / Indic speech-to-text API for Hindi and regional dialects (Santhali, Ho, Kurukh). | **NOT IMPLEMENTED** |

---

### Subsystem B: Government Nodal Verification & Triage
| Feature | Current State | Missing Functionality | Status |
| :--- | :--- | :--- | :--- |
| **State Nodal Verification Queue** | Challenges default to `SUBMITTED` | Dedicated review desk for Block Development Officers (BDOs) and Nodal Officers to approve, reject, or request more evidence. | **NOT IMPLEMENTED** |
| **Semantic Deduplication Engine** | Substring keyword check in `challenges.js` | Vector embedding or TF-IDF cosine similarity calculation against existing district challenges to flag duplicate issues before approval. | **PARTIALLY IMPLEMENTED** |
| **Priority Scoring Algorithm** | Static priority score in seed data | Algorithmic scoring formula: `Priority = (Beneficiaries × 0.4) + (Severity × 0.3) + (Deduplication Confidence × 0.3)`. | **PARTIALLY IMPLEMENTED** |

---

### Subsystem C: Higher Education Institution (HEI) & NEP 2020 R&D
| Feature | Current State | Missing Functionality | Status |
| :--- | :--- | :--- | :--- |
| **NEP 2020 Academic Credit Tracker** | Informational text on policy | Digital credit logbook tracking student research hours, lab sign-offs, and semester credit recommendations (2–4 credits). | **NOT IMPLEMENTED** |
| **Student-Faculty Team Formation** | Backend endpoint `POST /form-team` exists | Frontend form allowing faculty leads to invite student team members by roll number/email and assign roles (Lead, Hardware, AI). | **PARTIALLY IMPLEMENTED** |
| **Milestone Synchronization** | Milestones toggle only in local state | Full CRUD API persisting milestone completion dates, lab evidence photos, and reviewer feedback in `setu_db.json`. | **PARTIALLY IMPLEMENTED** |
| **Patent & IP Filing Workflow** | Static list of 4 patents | Form to submit provisional patent application numbers, assignee details, and incubation center linkage. | **PARTIALLY IMPLEMENTED** |

---

### Subsystem D: Industry & CSR Co-Development
| Feature | Current State | Missing Functionality | Status |
| :--- | :--- | :--- | :--- |
| **Tranche-Based Grant Release** | Single total pledged amount | Multi-tranche release schedule (30% on team formation, 40% on prototype validation, 30% on field deployment). | **NOT IMPLEMENTED** |
| **Corporate CSR Digital MoU** | Modal creates DB record | Downloadable/printable CSR sponsorship agreement document template with digital timestamp. | **NOT IMPLEMENTED** |
| **Industry Mentor Session Booking** | Static specialist list | Interactive booking integration that writes directly to the shared project schedule. | **PARTIALLY IMPLEMENTED** |

---

### Subsystem E: Field Deployment & Community Impact Measurement
| Feature | Current State | Missing Functionality | Status |
| :--- | :--- | :--- | :--- |
| **Field Deployment Verification** | Static status pill | Community feedback loop: PRI Gram Pradhans can submit post-deployment water quality test results or photos confirming the fix works. | **NOT IMPLEMENTED** |
| **Real Impact Analytics** | Hardcoded dashboard numbers | Live aggregation of actual beneficiaries from verified resolved challenges in `setu_db.json`. | **PARTIALLY IMPLEMENTED** |

---

### Subsystem F: Security, Offline & Progressive Web App (PWA)
| Feature | Current State | Missing Functionality | Status |
| :--- | :--- | :--- | :--- |
| **Cryptographic Authentication** | Plaintext password check & pseudo-tokens | Industry-standard bcrypt password hashing and signed JSON Web Tokens (JWT) with HTTP-only cookies or bearer header. | **PARTIALLY IMPLEMENTED** |
| **Role Authorization Middleware** | `requireAuth` defined but unmounted | Mounting `requireAuth` and `requireRole` on protected mutation routes (`POST /challenges`, `POST /assign-hei`, `POST /fund`). | **PARTIALLY IMPLEMENTED** |
| **Offline PWA Capability** | Regular web application | Service Worker (`sw.js`) and IndexedDB queue allowing rural citizens to record problems offline and auto-sync when network returns. | **NOT IMPLEMENTED** |
