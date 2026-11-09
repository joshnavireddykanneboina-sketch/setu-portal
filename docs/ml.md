# SETU Machine Learning Subsystem Documentation
**Jharkhand Societal Innovation Collaboration Portal**  
*Smart India Hackathon 2026 • Problem Statement ID 26043*

The machine learning layer operates as a decoupled Python service inside `ml/`, integrated with the Node.js backend through `backend/services/ml/mlClient.js`.

---

## 1. Problem Formulation & Objectives

In the SETU platform, the ML subsystem is responsible for:
1. **Thematic Domain Classification**: Classifying crowdsourced problem descriptions into primary societal sectors:
   - Water Resources & Sanitation
   - Agriculture & Soil Health
   - Healthcare & Rural Nutrition
   - Clean Energy & Microgrids
   - Rural Livelihoods & Agro-Processing
   - Urban Infrastructure & Mobility
   - Accessibility & Public Services
   - Smart Education & Vocational Skilling
2. **Severity & Urgency Categorization**: Triaging community issues into 3 urgency tiers (`GREEN`, `AMBER`, `RED`) based on public health risk, seasonal urgency (e.g. crop frost / monsoon flooding), and beneficiary population scale.
3. **Semantic Deduplication (Under Development)**: Utilizing sentence embeddings and cosine similarity scoring against the repository of 1,480+ existing Jharkhand challenges to prevent duplicated research across universities.

---

## 2. Feature Engineering & Preprocessing Pipeline

- **Text Cleaning**: Strip HTML, URLs, and extraneous symbols while maintaining domain terminology (e.g. "borewell", "fluorosis", "paddy", "lac", "tussar").
- **Vectorization**: Sublinear TF-IDF representation extracting unigrams and bigrams (`ngram_range=(1, 2)`):
  $$\text{tf}_{\text{sublinear}} = 1 + \log(\text{tf}) \quad \text{for } \text{tf} > 0$$
- **Vocabulary Sizing**: Capped at `max_features=1500` to guarantee ultra-fast inference latency ($< 10\text{ ms}$).

---

## 3. Training & Inference Execution

```bash
# 1. Install ML dependencies
pip install -r ml/requirements.txt

# 2. Train intent/domain classifier
python ml/src/train_intent.py

# 3. Train urgency triage model
python ml/src/train_urgency.py

# 4. Run model evaluation benchmarks
python ml/src/evaluate.py

# 5. Run single-text inference test
python ml/src/predict.py "High fluoride concentration detected in handpumps in Dumka district"
```

---

## 4. Current State vs. Roadmap

- **Implemented**: Standalone Python pipeline, serialization using `joblib`, sub-10ms subprocess bridge from Express.js with automatic heuristic fallback when Python is uninstalled.
- **Under Active Development**: Fine-tuned BERT / IndicBERT embeddings for bilingual Hindi and Santhali problem descriptions, along with a vector database index (FAISS) for real-time deduplication across all 24 districts.
