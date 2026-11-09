"""
Preprocessing Module for SETU Societal Innovation ML Engine
Handles text normalization, cleaning, and multilingual script tokenization for Jharkhand societal challenges.
Supports English, Hindi (Devanagari), and Santhali (Ol Chiki).
"""

import re

def clean_text(text: str) -> str:
    """
    Cleans raw challenge problem statement text by removing URLs, unusual symbols,
    collapsing multiple spaces, and normalizing Unicode.
    Preserves English, Devanagari (Hindi), and Ol Chiki (Santhali) characters.
    """
    if not isinstance(text, str):
        return ""
    
    # Lowercase (affects casing scripts like English/Latin; Devanagari & Ol Chiki remain unaffected)
    text = text.lower().strip()
    
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    
    # Remove email addresses
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '', text)
    
    # Unicode cleanup: Preserve Latin (\w), Devanagari (\u0900-\u097F), Ol Chiki (\u1C50-\u1C7F), and standard hyphens
    # Remove punctuation while preserving script characters
    text = re.sub(r"[^\w\s\u0900-\u097F\u1C50-\u1C7F'-]", ' ', text)
    
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def detect_script_language(text: str) -> dict:
    """
    Analyzes character distributions to provide a script detection hint.
    Returns primary script language and whether native multilingual model evaluation applies.
    """
    if not text:
        return {"detectedScript": "unknown", "primaryLanguage": "en", "isNativeModelEvaluated": True}
        
    devanagari_count = len(re.findall(r'[\u0900-\u097F]', text))
    ol_chiki_count = len(re.findall(r'[\u1C50-\u1C7F]', text))
    latin_count = len(re.findall(r'[a-zA-Z]', text))
    total_chars = max(devanagari_count + ol_chiki_count + latin_count, 1)

    if ol_chiki_count / total_chars > 0.3:
        return {
            "detectedScript": "Ol Chiki (Santhali)",
            "primaryLanguage": "sat",
            "isNativeModelEvaluated": False,
            "architectureReadiness": "Normalized for Ol Chiki; pending full native Santhali corpus training",
            "transliterationRecommended": True
        }
    elif devanagari_count / total_chars > 0.3:
        return {
            "detectedScript": "Devanagari (Hindi)",
            "primaryLanguage": "hi",
            "isNativeModelEvaluated": False,
            "architectureReadiness": "Normalized for Devanagari; trained primarily on English and Romanized Hinglish",
            "transliterationRecommended": True
        }
    else:
        return {
            "detectedScript": "Latin (English / Romanized Regional)",
            "primaryLanguage": "en",
            "isNativeModelEvaluated": True,
            "architectureReadiness": "Fully trained and evaluated on Scikit-Learn TF-IDF pipeline",
            "transliterationRecommended": False
        }

if __name__ == "__main__":
    sample_en = "High fluoride in handpump drinking water in Dumka https://jharkhand.gov.in"
    sample_hi = "दुमका के जामा प्रखंड में पीने के पानी में फ्लोराइड की समस्या"
    sample_sat = "ᱫᱟᱜ ᱨᱮ ᱯᱷᱞᱳᱨᱟᱭᱤᱰ ᱢᱮᱱᱟᱜ-ᱟ"
    print("EN Cleaned:", clean_text(sample_en), "->", detect_script_language(sample_en))
    print("HI Cleaned:", clean_text(sample_hi), "->", detect_script_language(sample_hi))
    print("SAT Cleaned:", clean_text(sample_sat), "->", detect_script_language(sample_sat))
