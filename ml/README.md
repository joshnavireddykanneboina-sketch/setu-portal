# SETU Machine Learning Classification & Deduplication Engine
**Smart India Hackathon 2026 • Problem Statement ID 26043**  
*Department of Higher & Technical Education, Government of Jharkhand*

This directory houses the independent, production-grade Machine Learning classification service for the **SETU Societal Innovation Collaboration Portal**. It is decoupled from the user-facing frontend and Express backend, providing fast ($< 10\text{ ms}$), explainable, and verifiable thematic domain classification and urgency triage.

---

## 1. Architectural Philosophy: Why Classical ML is Used

In state governance and higher-education research coordination:

| Layer | Primary Role | What It Does NOT Do |
| :--- | :--- | :--- |
| **LLM (Language Model)** | Conversational discovery, empathetic community clarification, problem summary formatting. | Does NOT enforce deterministic allocation rules; does NOT bypass safety protocols. |
| **ML (Machine Learning)** | Fast, verifiable classification of thematic societal domains and urgency tiers. Probabilistic vectors. | Does NOT converse with citizens or hallucinate narratives. |
| **Backend Service** | Business logic, challenge lifecycle, university team constitution, CSR grant tracking, notifications. | Does NOT classify problems without ML signals. |
| **University Researchers** | Multi-disciplinary research, prototype development, field testing, and patent filing. | Does NOT handle redundant manual problem sorting. |

### Why Dedicated ML is Essential
1. **Explainability & Transparency**: Government operations require deterministic, auditable classification confidence scores rather than opaque generative black-box responses.
2. **Speed & Scalability**: Classical Scikit-Learn TF-IDF inference executes in under **10 milliseconds**, whereas commercial LLM roundtrips take 1–3 seconds.
3. **Offline & Edge Capability**: Operates fully offline without cloud API token dependencies or per-query subscription costs.

---

## 2. Supported Thematic Domains & Urgency Tiers

### A. Thematic Societal Domains
1. `water_resources`: Fluoride/arsenic contamination, dying aquifers, borewell drying, water harvesting.
2. `smart_agriculture`: Crop disease, frost defense, acidic red soil improvement, micro-drip irrigation.
3. `healthcare_sanitation`: Primary health centre needs, malnutrition, maternal healthcare access, village drainage.
4. `clean_energy`: Rural microgrids, solar pump sets, cold chain energy, biomass gasification.
5. `rural_livelihoods`: Tussar silk, lac cultivation, Dokra metalcraft, minor forest produce processing.
6. `urban_infrastructure`: Potholed arterial roads, flood drainage, mining fire fumes (Jharia), traffic bottlenecks.

### B. Urgency & Severity Tiers
- `GREEN`: Standard societal improvement inquiry. Evaluated within university semester project cycles.
- `AMBER`: High seasonal vulnerability (e.g. frost damaging standing crops, seasonal water scarcity). Priority allocation.
- `RED`: Acute public safety hazard or critical drinking water contamination. Escalated for immediate nodal intervention.

---

## 3. Dataset Format

The primary dataset is located at:
`ml/data/sample/jharkhand_societal_challenges_dataset.csv`

Columns:
- `text`: Natural language statement describing a community challenge across Jharkhand districts.
- `intent`: Target societal domain category.
- `urgency`: Triage priority tier (`green`, `amber`, `red`).

---

## 4. Execution Commands

```bash
# 1. Install dependencies
pip install -r ml/requirements.txt

# 2. Train Intent / Domain Classifier
python ml/src/train_intent.py

# 3. Train Urgency / Severity Classifier
python ml/src/train_urgency.py

# 4. Run Comprehensive Benchmark Evaluation
python ml/src/evaluate.py

# 5. Run Single-Text Inference Test
python ml/src/predict.py "High fluoride concentration detected in handpumps in Dumka district"
```
