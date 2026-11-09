"""
Train Urgency Classifier for SETU Platform
Trains a class-weighted Logistic Regression model to predict support urgency:
- GREEN (Normal priority)
- AMBER (High priority / seasonal intervention)
- RED (Critical public safety / urgent intervention)
"""

import os
import csv
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

try:
    from .preprocessing import clean_text
    from .feature_engineering import build_vectorizer
except ImportError:
    from preprocessing import clean_text
    from feature_engineering import build_vectorizer

def load_data(csv_path):
    texts = []
    labels = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('text') and row.get('urgency'):
                texts.append(row['text'].strip())
                labels.append(row['urgency'].strip().lower())
    return texts, labels

def train():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, '..'))
    data_path = os.path.join(project_root, 'data', 'sample', 'jharkhand_societal_challenges_dataset.csv')
    output_dir = os.path.join(project_root, 'models', 'urgency_model')
    os.makedirs(output_dir, exist_ok=True)

    print(f"[URGENCY MODEL] Loading dataset from: {data_path}")
    texts, labels = load_data(data_path)
    print(f"[URGENCY MODEL] Total samples: {len(texts)}")

    # Vectorizer
    vectorizer = build_vectorizer(max_features=1500, ngram_range=(1, 2))
    X = vectorizer.fit_transform(texts)
    y = labels

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Class-weighted Logistic Regression to prioritize RED/AMBER detection
    clf = LogisticRegression(C=2.0, class_weight='balanced', max_iter=1000, random_state=42)
    clf.fit(X_train, y_train)

    # Evaluation
    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"\n[URGENCY MODEL] Test Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, preds, zero_division=0))

    # Save artifacts
    model_path = os.path.join(output_dir, 'urgency_classifier.joblib')
    vec_path = os.path.join(output_dir, 'urgency_vectorizer.joblib')
    classes_path = os.path.join(output_dir, 'urgency_classes.joblib')

    joblib.dump(clf, model_path)
    joblib.dump(vectorizer, vec_path)
    joblib.dump(clf.classes_, classes_path)

    print(f"[URGENCY MODEL] Saved model artifacts to: {output_dir}")
    return acc

if __name__ == '__main__':
    train()
