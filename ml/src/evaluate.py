"""
Model Evaluation Suite for SETU Machine Learning Subsystem
Evaluates:
- Thematic Domain Classifier (8 Domains)
- Urgency Classifier (GREEN, AMBER, RED)
Generates:
- Accuracy, Precision, Recall, F1-Score (Macro & Weighted)
- Confusion Matrices
- Classification Reports
- Real-world Challenge Inference Verification
- Exports docs/MODEL_EVALUATION_REPORT.md
"""

import os
import csv
import joblib
import numpy as np
from datetime import datetime
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix
from sklearn.model_selection import train_test_split

try:
    from .preprocessing import clean_text
    from .feature_engineering import build_vectorizer
    from .predict import predict_single
except ImportError:
    from preprocessing import clean_text
    from feature_engineering import build_vectorizer
    from predict import predict_single

def load_dataset(csv_path):
    texts, intents, urgencies = [], [], []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('text') and row.get('intent') and row.get('urgency'):
                texts.append(row['text'].strip())
                intents.append(row['intent'].strip())
                urgencies.append(row['urgency'].strip().lower())
    return texts, intents, urgencies

def format_confusion_matrix(cm, labels):
    header = "True \\ Pred | " + " | ".join([l[:10] for l in labels])
    separator = "-" * len(header)
    rows = [header, separator]
    for idx, true_label in enumerate(labels):
        row_str = f"{true_label[:11]:<11} | " + " | ".join([f"{val:^10}" for val in cm[idx]])
        rows.append(row_str)
    return "\n".join(rows)

def evaluate_models():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))
    data_path = os.path.join(project_root, 'ml', 'data', 'sample', 'jharkhand_societal_challenges_dataset.csv')
    doc_output_path = os.path.join(project_root, 'docs', 'MODEL_EVALUATION_REPORT.md')

    print(f"[EVALUATION] Loading dataset from: {data_path}")
    texts, intents, urgencies = load_dataset(data_path)
    total_samples = len(texts)

    # 1. EVALUATE INTENT / THEMATIC DOMAIN MODEL
    intent_vec = joblib.load(os.path.join(project_root, 'ml', 'models', 'intent_model', 'intent_vectorizer.joblib'))
    intent_clf = joblib.load(os.path.join(project_root, 'ml', 'models', 'intent_model', 'intent_classifier.joblib'))

    X_intent = intent_vec.transform(texts)
    X_train_i, X_test_i, y_train_i, y_test_i = train_test_split(
        X_intent, intents, test_size=0.20, random_state=42, stratify=intents
    )

    preds_intent = intent_clf.predict(X_test_i)
    acc_intent = accuracy_score(y_test_i, preds_intent)
    p_macro_i, r_macro_i, f1_macro_i, _ = precision_recall_fscore_support(y_test_i, preds_intent, average='macro', zero_division=0)
    p_wt_i, r_wt_i, f1_wt_i, _ = precision_recall_fscore_support(y_test_i, preds_intent, average='weighted', zero_division=0)
    report_intent = classification_report(y_test_i, preds_intent, zero_division=0)
    cm_intent = confusion_matrix(y_test_i, preds_intent, labels=intent_clf.classes_)

    # 2. EVALUATE URGENCY MODEL
    urgency_vec = joblib.load(os.path.join(project_root, 'ml', 'models', 'urgency_model', 'urgency_vectorizer.joblib'))
    urgency_clf = joblib.load(os.path.join(project_root, 'ml', 'models', 'urgency_model', 'urgency_classifier.joblib'))

    X_urgency = urgency_vec.transform(texts)
    X_train_u, X_test_u, y_train_u, y_test_u = train_test_split(
        X_urgency, urgencies, test_size=0.20, random_state=42, stratify=urgencies
    )

    preds_urgency = urgency_clf.predict(X_test_u)
    acc_urgency = accuracy_score(y_test_u, preds_urgency)
    p_macro_u, r_macro_u, f1_macro_u, _ = precision_recall_fscore_support(y_test_u, preds_urgency, average='macro', zero_division=0)
    p_wt_u, r_wt_u, f1_wt_u, _ = precision_recall_fscore_support(y_test_u, preds_urgency, average='weighted', zero_division=0)
    report_urgency = classification_report(y_test_u, preds_urgency, zero_division=0)
    cm_urgency = confusion_matrix(y_test_u, preds_urgency, labels=urgency_clf.classes_)

    # 3. REAL-WORLD BENCHMARK CHALLENGE INFERENCE TESTS
    test_cases = [
        "Dangerous levels of fluoride causing dental and bone fluorosis in Jama village children",
        "Winter frost and sub-zero temperatures destroyed 8 acres of tomato and capsicum crops in Khunti",
        "Community clinic has no solar power or refrigerator for emergency anti-venom and newborn vaccines",
        "Remote tribal village situated 6 km inside Saranda forest has zero electricity or grid connection",
        "Lac farmers in Torpa forced to sell raw resin to intermediaries at low prices due to lack of processing machines",
        "Old bridge piers collapsing after flash floods cutting off all connectivity to 10 tribal hamlets",
        "Wheelchair-using students cannot access computer laboratories on the second floor of the polytechnic",
        "Government ITI institute students trained on obsolete equipment with no CNC or robotics simulators"
    ]

    inference_results = [predict_single(tc) for tc in test_cases]

    # Generate Markdown Report
    report_md = f"""# SETU Machine Learning Subsystem Evaluation Report
**Jharkhand Societal Innovation Collaboration Portal**  
**Smart India Hackathon 2026 • Problem Statement ID: 26043**  
**Generated On:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 1. Dataset & Methodology
- **Dataset Path:** `ml/data/sample/jharkhand_societal_challenges_dataset.csv`
- **Total Validated Samples:** {total_samples}
- **Train / Test Split:** 80% Train ({int(total_samples * 0.8)} samples) / 20% Test ({int(total_samples * 0.2)} samples), Stratified
- **Feature Extraction:** Sublinear TF-IDF (Unigrams + Bigrams, max_features=2000)
- **Classification Engine:** Multi-class Logistic Regression with balanced class weighting

---

## 2. Thematic Domain Classification Performance (8 Domains)
- **Supported Thematic Domains:**
  1. Water Resources and Sanitation
  2. Agriculture and Soil Health
  3. Healthcare and Rural Nutrition
  4. Clean Energy and Microgrids
  5. Rural Livelihoods
  6. Urban Infrastructure and Mobility
  7. Accessibility and Public Services
  8. Smart Education and Vocational Skilling

### Performance Summary
- **Test Accuracy:** **{acc_intent * 100:.2f}%**
- **Macro Precision:** {p_macro_i:.4f} | **Weighted Precision:** {p_wt_i:.4f}
- **Macro Recall:** {r_macro_i:.4f} | **Weighted Recall:** {r_wt_i:.4f}
- **Macro F1-Score:** {f1_macro_i:.4f} | **Weighted F1-Score:** {f1_wt_i:.4f}

### Detailed Classification Report
```
{report_intent}
```

### Confusion Matrix
```
{format_confusion_matrix(cm_intent, intent_clf.classes_)}
```

---

## 3. Urgency Prediction Performance (GREEN, AMBER, RED)
- **Tiers:**
  - **GREEN:** Normal priority (Programmatic semester R&D)
  - **AMBER:** High priority (Time-sensitive seasonal crop/infrastructure vulnerability)
  - **RED:** Critical public safety / urgent intervention (24-hour SLA with mandatory human verification)

### Performance Summary
- **Test Accuracy:** **{acc_urgency * 100:.2f}%**
- **Macro Precision:** {p_macro_u:.4f} | **Weighted Precision:** {p_wt_u:.4f}
- **Macro Recall:** {r_macro_u:.4f} | **Weighted Recall:** {r_wt_u:.4f}
- **Macro F1-Score:** {f1_macro_u:.4f} | **Weighted F1-Score:** {f1_wt_u:.4f}

### Detailed Classification Report
```
{report_urgency}
```

### Confusion Matrix
```
{format_confusion_matrix(cm_urgency, urgency_clf.classes_)}
```

---

## 4. Real-World Challenge Inference Verification

| # | Real-World Challenge Description | Predicted Domain | Urgency | Confidence | Human Verification Required |
|---|---|---|---|---|---|
"""
    for idx, r in enumerate(inference_results, 1):
        report_md += f"| {idx} | {r['text'][:65]}... | **{r['primaryDomain']}** | `{r['urgencyLevel']}` | {r['confidenceScore']*100:.1f}% | {'⚠️ YES (Public Safety)' if r['humanVerificationRequired'] else 'No'} |\n"

    report_md += """
---

## 5. Public Safety & Ethical Safeguards
- **Human Verification Policy:** In accordance with state public safety standards, an ML prediction independently **NEVER** overrides human verification for `RED` tier issues. All `RED` predictions trigger mandatory notification to state administrative nodal officers.
- **Multilingual Support Status:**
  - English & Romanized Hinglish/Santhali: Fully trained and operational.
  - Native Devanagari Hindi & Ol Chiki Santhali: Unicode normalization and character detection architecture in place; marked transparently for full native training once annotated corpus is available.
"""

    os.makedirs(os.path.dirname(doc_output_path), exist_ok=True)
    with open(doc_output_path, 'w', encoding='utf-8') as f:
        f.write(report_md)

    print(f"\n[EVALUATION] Successfully generated evaluation report at: {doc_output_path}")
    print(f"[EVALUATION] Thematic Domain Accuracy: {acc_intent * 100:.2f}%")
    print(f"[EVALUATION] Urgency Classifier Accuracy: {acc_urgency * 100:.2f}%")
    return acc_intent, acc_urgency

if __name__ == '__main__':
    evaluate_models()
