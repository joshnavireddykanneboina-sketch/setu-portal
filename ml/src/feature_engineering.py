"""
Feature Engineering Module for SETU Societal Innovation ML Engine
Builds TF-IDF representations with unigrams and bigrams for Jharkhand societal challenge texts.
"""

from sklearn.feature_extraction.text import TfidfVectorizer

try:
    from .preprocessing import clean_text
except ImportError:
    from preprocessing import clean_text

def build_vectorizer(max_features=1500, ngram_range=(1, 2)):
    """
    Constructs an optimized TF-IDF vectorizer for Jharkhand societal innovation challenge texts.
    """
    return TfidfVectorizer(
        preprocessor=clean_text,
        max_features=max_features,
        ngram_range=ngram_range,
        sublinear_tf=True,
        min_df=1,
        stop_words='english'
    )
