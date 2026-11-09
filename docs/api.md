# SETU Backend API Documentation
**Jharkhand Societal Innovation Collaboration Portal**  
*Smart India Hackathon 2026 • Problem Statement ID 26043*  
*Nodal Department: Department of Higher & Technical Education, Government of Jharkhand*

All API endpoints are hosted under `/api/*` and return JSON payloads.

---

## 1. System Health Check (`/api/health`)

### `GET /api/health`
Returns the operational status of the SETU backend service and ML pipeline readiness.

**Response (200 OK):**
```json
{
  "status": "ONLINE",
  "platform": "SETU - Jharkhand Societal Innovation Collaboration Portal",
  "psId": "26043",
  "version": "1.0.0",
  "timestamp": "2026-11-06T18:30:00.000Z"
}
```

---

## 2. Societal Challenges API (`/api/challenges`)

### `GET /api/challenges`
Retrieves crowdsourced societal challenges with optional multi-criteria filtering across Jharkhand's 24 districts.

**Query Parameters:**
- `district` (string, optional): e.g., `Dumka`, `Ranchi`, `Dhanbad`, `Khunti`
- `domain` (string, optional): e.g., `Water Resources`, `Agriculture`, `Healthcare`, `Clean Energy`, `Urban Infrastructure`, `Rural Livelihoods`
- `status` (string, optional): `Submitted`, `Under University Review`, `Assigned to HEI Team`, `Prototyping`, `Field Tested`, `Patented`
- `assignedUniversityId` (string, optional): HEI ID, e.g., `UNIV-BIT-MESRA`
- `industryPartnerId` (string, optional): Industry ID, e.g., `IND-TATA-CSR`
- `search` (string, optional): Case-insensitive keyword search in title, description, district, and domain

**Response (200 OK):**
```json
[
  {
    "id": "CHAL-JH-2026-001",
    "title": "Fluoride Contamination Mitigation in Rural Borewells",
    "domain": "Water Resources",
    "district": "Dumka",
    "block": "Jama",
    "panchayat": "Chikaniya",
    "description": "High fluoride concentration exceeding 4.5 mg/L causing widespread dental and skeletal fluorosis across 14 villages.",
    "severity": "HIGH",
    "status": "Assigned to HEI Team",
    "assignedUniversity": "Birsa Agricultural University & BIT Mesra",
    "assignedUniversityId": "UNIV-BIT-MESRA",
    "industryPartner": "Tata Steel CSR",
    "industryPartnerId": "IND-TATA-CSR",
    "csrFundingPledged": "₹28,50,000",
    "estimatedBeneficiaries": 18500,
    "team": {
      "facultyLead": "Dr. Ramesh Soren",
      "studentMembers": ["Pooja Kumari (B.Tech)", "Vikram Hembrom (M.Tech)"],
      "prototypeStatus": "Bio-Char Adsorbent Column Field Prototype v2.1"
    }
  }
]
```

### `GET /api/challenges/:id`
Retrieves full details, evidence attachments, milestone timeline, and research logs for a specific challenge.

### `POST /api/challenges`
Submits a new societal challenge from a citizen, Panchayati Raj Institution (PRI), or Urban Local Body (ULB).

**Request Body:**
```json
{
  "title": "Community Solar Cold Storage for Perishable Vegetables",
  "domain": "Clean Energy & Agriculture",
  "district": "Khunti",
  "block": "Murhu",
  "panchayat": "Torpa",
  "description": "Lack of decentralized cold chain facilities causing 35% tomato harvest spoilage during winter glut.",
  "submittedBy": "Murhu Kisan Samiti",
  "submitterRole": "PRI",
  "submitterEmail": "contact@murhukisan.org",
  "submitterPhone": "98XXXXXXXX",
  "multimedia": [
    { "type": "image", "url": "/evidence/tomatoes_spoilage_sample.jpg" },
    { "type": "gps", "coordinates": "23.0716° N, 85.2798° E" }
  ]
}
```

---

## 3. Stakeholder Authentication (`/api/auth`)

### `POST /api/auth/login`
Authenticates a portal stakeholder and returns a scoped session token.

**Request:**
```json
{
  "email": "university@setu.jharkhand.gov.in",
  "password": "setu123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "UNIV-BIT-MESRA",
    "name": "Dr. Ramesh Soren",
    "email": "university@setu.jharkhand.gov.in",
    "role": "UNIVERSITY",
    "institution": "BIT Mesra, Ranchi",
    "department": "Chemical & Environmental Engineering"
  },
  "token": "setu_token_UNIV-BIT-MESRA_1790548123"
}
```

---

## 4. AI Problem Intake & Intelligence Radar (`/api/chat`)

### `POST /api/chat`
Processes citizen problem descriptions through safety screening, ML domain classification, and semantic deduplication checks.

**Request:**
```json
{
  "conversationId": "CONV-1790548123",
  "message": "We have severe fluoride contamination in village drinking water pumps in Dumka."
}
```

**Response (200 OK):**
```json
{
  "reply": "I understand the critical water quality challenge in Dumka. The SETU AI Engine categorized this under Water Resources & Public Health.",
  "stage": "UNDERSTAND",
  "intent": "water_resources",
  "themes": [
    { "label": "Water Resources", "relevance": "High", "color": "#00F2FE" },
    { "label": "Rural Health", "relevance": "High", "color": "#F4B6D7" }
  ],
  "urgency": "AMBER",
  "deduplicationMatches": [
    {
      "id": "CHAL-JH-2026-001",
      "similarity": "84%",
      "status": "Under Active R&D at BIT Mesra"
    }
  ]
}
```

---

## 5. Machine Learning Inference (`/api/ml`)

### `POST /api/ml/classify`
Direct inference endpoint running Scikit-Learn TF-IDF vectorization and multiclass classification.

**Request:**
```json
{
  "text": "Frequent winter frost damaging off-season tomato and lac crops in Khunti plateau"
}
```

**Response (200 OK):**
```json
{
  "primaryIntent": "agriculture_livelihoods",
  "intentProbabilities": {
    "agriculture_livelihoods": 0.884,
    "rural_infrastructure": 0.082,
    "water_resources": 0.034
  },
  "urgencyLevel": "amber",
  "urgencyProbabilities": {
    "amber": 0.72,
    "green": 0.25,
    "red": 0.03
  },
  "confidence": 0.884,
  "isModelInference": true
}
```

---

## 6. State Analytics Cockpit (`/api/admin/analytics`)

### `GET /api/admin/analytics`
Returns aggregate statistics for the Department of Higher & Technical Education executive dashboard.

**Response (200 OK):**
```json
{
  "metrics": {
    "totalChallenges": 1480,
    "activeHEIs": 48,
    "csrFundingPledgedCr": 14.5,
    "patentsAndStartups": 38,
    "districtsCovered": 24
  },
  "domainDistribution": [
    { "domain": "Water Resources", "count": 420 },
    { "domain": "Agriculture & Soil", "count": 385 },
    { "domain": "Rural Livelihoods", "count": 290 },
    { "domain": "Clean Energy", "count": 210 },
    { "domain": "Healthcare Access", "count": 175 }
  ]
}
```

---

## 7. Additional Legacy Subsystems

For backward compatibility with the platform's initial service foundation, endpoints for cases (`/api/cases`), R&D review scheduling (`/api/appointments`), and waitlists (`/api/waitlist`) remain mounted and operational under their respective route files.
