"""
Prediction Module for SETU ML Layer
Runs inference for a given societal challenge problem statement:
- Thematic Domain Classification (8 Domains)
- Urgency Prediction (GREEN, AMBER, RED)
- Explainable Urgency Reason & Public Safety Human Verification Flags
- Multilingual Script Detection (English, Hindi, Santhali)
"""

import sys
import os
import json
import joblib

try:
    from .preprocessing import clean_text, detect_script_language
except ImportError:
    from preprocessing import clean_text, detect_script_language

def load_models():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))

    intent_dir = os.path.join(project_root, 'models', 'intent_model')
    urgency_dir = os.path.join(project_root, 'models', 'urgency_model')

    intent_clf_path = os.path.join(intent_dir, 'intent_classifier.joblib')
    intent_vec_path = os.path.join(intent_dir, 'intent_vectorizer.joblib')

    urgency_clf_path = os.path.join(urgency_dir, 'urgency_classifier.joblib')
    urgency_vec_path = os.path.join(urgency_dir, 'urgency_vectorizer.joblib')

    if not (os.path.exists(intent_clf_path) and os.path.exists(intent_vec_path)):
        return None, None, None, None

    intent_clf = joblib.load(intent_clf_path)
    intent_vec = joblib.load(intent_vec_path)

    urgency_clf = joblib.load(urgency_clf_path)
    urgency_vec = joblib.load(urgency_vec_path)

    return intent_clf, intent_vec, urgency_clf, urgency_vec

def derive_urgency_reason(text: str, urgency_level: str) -> str:
    clean = text.lower()
    if urgency_level == "RED":
        if any(w in clean for w in ["fluoride", "arsenic", "contamination", "toxic", "poison"]):
            return "Critical water contamination posing acute toxic risk or skeletal fluorosis hazards."
        if any(w in clean for w in ["collapse", "bridge", "flood", "subsidence", "fire"]):
            return "Severe structural hazard or disaster risking community isolation and physical injury."
        if any(w in clean for w in ["infant", "neonatal", "ambulance", "malnutrition", "outbreak", "epidemic", "snakebite"]):
            return "Imminent threat to life or maternal/infant healthcare emergency requiring fast-track intervention."
        return "Critical community urgency detected by model risk weights requiring 24-hour response."
    elif urgency_level == "AMBER":
        if any(w in clean for w in ["frost", "pest", "crop", "spoilage", "cold storage"]):
            return "Time-sensitive agricultural vulnerability risking severe seasonal harvest loss within days."
        if any(w in clean for w in ["power", "blackout", "pumping", "road", "choked", "pension"]):
            return "Elevated infrastructure disruption causing substantial socio-economic friction."
        return "High priority societal challenge with notable community impact window."
    else:
        return "Standard societal challenge suitable for programmatic semester research and prototype incubation."

def predict_single(text: str):
    script_info = detect_script_language(text)
    intent_clf, intent_vec, urgency_clf, urgency_vec = load_models()

    if intent_clf is None:
        # Fallback heuristic
        return {
            "text": text,
            "primaryDomain": "Water Resources and Sanitation",
            "confidenceScore": 0.50,
            "probabilityDistribution": {"Water Resources and Sanitation": 1.0},
            "modelInferenceStatus": "FALLBACK_HEURISTIC",
            "urgencyLevel": "AMBER",
            "urgencyProbabilities": {"green": 0.1, "amber": 0.8, "red": 0.1},
            "urgencyReason": "Preliminary heuristic routing prior to model bundle load.",
            "humanVerificationRequired": False,
            "scriptLanguage": script_info,
            "fallbackReason": "Trained joblib model files not found on disk"
        }

    # Thematic Domain Inference
    cleaned_input = clean_text(text)
    X_intent = intent_vec.transform([cleaned_input])
    intent_probs = intent_clf.predict_proba(X_intent)[0]
    intent_classes = intent_clf.classes_
    intent_dict = {cls: round(float(prob), 4) for cls, prob in zip(intent_classes, intent_probs)}
    primary_domain = intent_classes[intent_probs.argmax()]
    domain_conf = round(float(intent_probs.max()), 4)

    # Urgency Inference
    X_urgency = urgency_vec.transform([cleaned_input])
    urgency_probs = urgency_clf.predict_proba(X_urgency)[0]
    urgency_classes = urgency_clf.classes_
    urgency_dict = {cls.lower(): round(float(prob), 4) for cls, prob in zip(urgency_classes, urgency_probs)}
    urgency_level = urgency_classes[urgency_probs.argmax()].upper()
    urgency_conf = round(float(urgency_probs.max()), 4)

    # Public Safety Rule: Never let ML prediction independently replace human verification for critical issues
    is_critical_flag = (urgency_level == "RED") or any(
        kw in cleaned_input for kw in ["death", "fatal", "poison", "toxic", "collapse", "outbreak", "epidemic", "electrocution"]
    )

    urgency_reason = derive_urgency_reason(cleaned_input, urgency_level)

    return {
        "text": text,
        "primaryDomain": primary_domain,
        "confidenceScore": domain_conf,
        "probabilityDistribution": intent_dict,
        "modelInferenceStatus": "MODEL_INFERENCE",
        "urgencyLevel": urgency_level,
        "urgencyProbabilities": urgency_dict,
        "urgencyReason": urgency_reason,
        "humanVerificationRequired": is_critical_flag,
        "humanVerificationNotice": "Mandatory administrative validation required for RED urgency prior to field deployment." if is_critical_flag else None,
        "overallConfidence": round((domain_conf + urgency_conf) / 2.0, 4),
        "scriptLanguage": script_info
    }

if __name__ == '__main__':
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "High concentration of fluoride in handpumps causing severe fluorosis in Dumka children"

    result = predict_single(query)
    print(json.dumps(result, indent=2))
