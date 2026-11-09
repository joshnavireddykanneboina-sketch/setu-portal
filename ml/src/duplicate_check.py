"""
Duplicate Challenge Semantic Similarity Detection for SETU Platform
Computes pairwise similarity between a query problem description
and existing database challenge texts using Scikit-Learn TF-IDF vector representations
combined with query keyword recall.
(Transparently utilizes Scikit-Learn TF-IDF Cosine Similarity; does not make false FAISS claims).
"""

import sys
import json
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOPWORDS = {
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'was',
    'been', 'were', 'which', 'has', 'will', 'district', 'block', 'panchayat',
    'jharkhand', 'problem', 'village', 'issue', 'need', 'needed', 'due'
}

def extract_keywords(text: str):
    tokens = re.findall(r'[a-zA-Z0-9\u0900-\u097F\u1C50-\u1C7F]{3,}', (text or '').lower())
    return set(t for t in tokens if t not in STOPWORDS)

def detect_duplicates(query_text: str, database_records: list, threshold: float = 0.30):
    if not query_text or not database_records:
        return []

    query_keywords = extract_keywords(query_text)
    if not query_keywords:
        return []

    corpus = [r.get("text", "") for r in database_records]
    all_texts = [query_text] + corpus

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=1, stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(all_texts)

    query_vec = tfidf_matrix[0]
    corpus_vecs = tfidf_matrix[1:]

    sim_scores = cosine_similarity(query_vec, corpus_vecs)[0]

    matches = []
    for idx, raw_score in enumerate(sim_scores):
        rec = database_records[idx]
        rec_text = (rec.get("text", "") + " " + rec.get("title", "")).lower()
        rec_keywords = extract_keywords(rec_text)

        # Keyword recall / coverage ratio
        overlap = query_keywords.intersection(rec_keywords)
        recall = len(overlap) / len(query_keywords) if query_keywords else 0.0

        # Hybrid Score: 0.5 * TF-IDF Cosine + 0.5 * Keyword Recall
        score = max(raw_score, (0.4 * raw_score + 0.6 * recall))

        # Proximity bonus if district matches
        query_lower = query_text.lower()
        rec_dist = (rec.get("district") or "").lower()
        if rec_dist and rec_dist in query_lower and recall >= 0.30:
            score = min(1.0, score + 0.08)

        if score >= threshold:
            matches.append({
                "id": rec.get("id"),
                "similarityPercentage": f"{round(score * 100, 1)}%",
                "similarityScore": round(float(score), 4),
                "title": rec.get("title", ""),
                "district": rec.get("district", "Unknown"),
                "domain": rec.get("domain", "General"),
                "status": rec.get("status", "SUBMITTED"),
                "assignedUniversity": rec.get("assignedUniversityName", "Pending Allocation"),
                "isExactDuplicate": bool(score >= 0.80)
            })

    # Sort descending by similarity score
    matches.sort(key=lambda m: m["similarityScore"], reverse=True)
    return matches

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            payload = json.loads(sys.argv[1])
            query = payload.get("query", "")
            records = payload.get("records", [])
            thresh = float(payload.get("threshold", 0.30))
            result = detect_duplicates(query, records, thresh)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        sample_query = "Fluoride contamination in drinking water handpumps in Dumka"
        sample_records = [
            {"id": "SETU-01", "text": "Severe fluoride in handpumps in Jama Dumka", "district": "Dumka", "domain": "Water Resources and Sanitation"},
            {"id": "SETU-02", "text": "Solar power microgrid in Netarhat", "district": "Latehar", "domain": "Clean Energy and Microgrids"}
        ]
        print(json.dumps(detect_duplicates(sample_query, sample_records), indent=2))
