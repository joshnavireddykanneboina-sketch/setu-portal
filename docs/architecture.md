# SETU System Architecture & Design
**Jharkhand Societal Innovation Collaboration Portal**  
*Smart India Hackathon 2026 • Problem Statement ID 26043*  
*Government of Jharkhand • Department of Higher & Technical Education*

---

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CITIZEN & PRI INTAKE LAYER                        │
│   • Web & Mobile Interface (React 18, Glassmorphism, Fraunces Serifs)  │
│   • Multilingual UI: English, Hindi (हिंदी), Santhali (ᱥᱟᱱᱛᱟᱲᱤ)       │
│   • Evidence: Photos, Video, Audio Notes, GPX Coordinates              │
│   • Privacy Shield: Anonymous Tokenization & Zero-EXIF Scrubbing       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API GATEWAY                             │
│   • Node.js & Express 5 API Server (Port 5000)                         │
│   • Role-Based Access Control (RBAC): Citizens, HEIs, CSR, Admin       │
│   • Rate Limiting, Audit Logging & Input Sanitization                  │
└──────────────────┬─────────────────┬─────────────────┬─────────────────┘
                   │                 │                 │
                   ▼                 ▼                 ▼
         ┌───────────────────┐┌──────────────┐┌───────────────────┐
         │ AI CLASSIFICATION ││ DEDUPLICATION││ SMART HEI ROUTING │
         │ Scikit-Learn TF-IDF││ Semantic Cos ││ University Matrix │
         │ Thematic Domain   ││ Similarity   ││ Specialization    │
         └─────────┬─────────┘└──────┬───────┘└─────────┬─────────┘
                   └─────────────────┼──────────────────┘
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       PERSISTENT DATABASE LAYER                        │
│   • JSON File-Backed ACID Database (`setu_db.json`)                    │
│   • 24 Districts Seed Data, Active HEIs, CSR Industry Partners         │
└──────────────────┬─────────────────┬─────────────────┬─────────────────┘
                   │                 │                 │
                   ▼                 ▼                 ▼
         ┌───────────────────┐┌──────────────┐┌───────────────────┐
         │  UNIVERSITY HUB   ││ INDUSTRY CSR ││  STATE ANALYTICS  │
         │ NEP 2020 Teams    ││ Co-Development││ Real-Time Heatmap│
         │ Milestone Tracker ││ Grant Pledging││ District Metrics │
         │ Patent Filings    ││ Mentorship   ││ Policy Insights  │
         └───────────────────┘└──────────────┘└───────────────────┘
```

---

## 2. Core Architectural Principles

### 1. Privacy-Preserving Intake
- **Client-Side Metadata Stripping**: Uploaded photos and videos have EXIF metadata (camera serial, hardware identifiers, exact household GPS) stripped, replacing them with a secure `🔒 Zero-EXIF` badge.
- **Pseudonymous Tokens**: Submissions generate persistent cryptographic tokens (e.g. `CITIZEN-ANON-7892-JH`) so citizens can track project progress without exposing personal identifying information.

### 2. Dual-Engine Intelligence: Rules + ML + LLM
- **Heuristic Validation Layer**: Fast rule-based validation of essential challenge attributes (district, domain tags, evidence types).
- **Machine Learning Layer**: Python Scikit-Learn pipeline performing TF-IDF vectorization and multiclass logistic regression across thematic problem domains.
- **LLM Enrichment**: Upstream Generative AI (Gemini 1.5 Flash) provides empathetic dialogue, clarification prompts, and problem summary formatting.

### 3. Transparent Tripartite Collaboration
- Connects **Citizens / PRIs / ULBs** (Problem identifiers), **Higher Education Institutions** (Solution researchers & student teams under NEP 2020), and **Industry / CSR Hubs** (Technical mentors, prototype funders, pilot testers).
- Provides an executive operations cockpit for the **Department of Higher & Technical Education** to monitor progress across all 24 Jharkhand districts.
