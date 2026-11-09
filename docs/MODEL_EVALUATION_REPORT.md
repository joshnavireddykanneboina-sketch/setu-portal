# SETU Machine Learning Subsystem Evaluation Report
**Jharkhand Societal Innovation Collaboration Portal**  
**Smart India Hackathon 2026 • Problem Statement ID: 26043**  
**Generated On:** 2026-11-08 13:48:23

---

## 1. Dataset & Methodology
- **Dataset Path:** `ml/data/sample/jharkhand_societal_challenges_dataset.csv`
- **Total Validated Samples:** 169
- **Train / Test Split:** 80% Train (135 samples) / 20% Test (33 samples), Stratified
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
- **Test Accuracy:** **44.12%**
- **Macro Precision:** 0.4815 | **Weighted Precision:** 0.4797
- **Macro Recall:** 0.4437 | **Weighted Recall:** 0.4412
- **Macro F1-Score:** 0.4224 | **Weighted F1-Score:** 0.4224

### Detailed Classification Report
```
                                         precision    recall  f1-score   support

      Accessibility and Public Services       0.50      0.75      0.60         4
            Agriculture and Soil Health       0.50      0.40      0.44         5
            Clean Energy and Microgrids       1.00      0.25      0.40         4
         Healthcare and Rural Nutrition       0.00      0.00      0.00         4
                      Rural Livelihoods       0.50      0.75      0.60         4
Smart Education and Vocational Skilling       0.67      0.50      0.57         4
      Urban Infrastructure and Mobility       0.29      0.50      0.36         4
         Water Resources and Sanitation       0.40      0.40      0.40         5

                               accuracy                           0.44        34
                              macro avg       0.48      0.44      0.42        34
                           weighted avg       0.48      0.44      0.42        34

```

### Confusion Matrix
```
True \ Pred | Accessibil | Agricultur | Clean Ener | Healthcare | Rural Live | Smart Educ | Urban Infr | Water Reso
-------------------------------------------------------------------------------------------------------------------
Accessibili |     3      |     0      |     0      |     0      |     0      |     1      |     0      |     0     
Agriculture |     0      |     2      |     0      |     0      |     2      |     0      |     1      |     0     
Clean Energ |     0      |     1      |     1      |     0      |     0      |     0      |     1      |     1     
Healthcare  |     2      |     1      |     0      |     0      |     0      |     0      |     0      |     1     
Rural Livel |     0      |     0      |     0      |     1      |     3      |     0      |     0      |     0     
Smart Educa |     0      |     0      |     0      |     1      |     0      |     2      |     1      |     0     
Urban Infra |     1      |     0      |     0      |     0      |     0      |     0      |     2      |     1     
Water Resou |     0      |     0      |     0      |     0      |     1      |     0      |     2      |     2     
```

---

## 3. Urgency Prediction Performance (GREEN, AMBER, RED)
- **Tiers:**
  - **GREEN:** Normal priority (Programmatic semester R&D)
  - **AMBER:** High priority (Time-sensitive seasonal crop/infrastructure vulnerability)
  - **RED:** Critical public safety / urgent intervention (24-hour SLA with mandatory human verification)

### Performance Summary
- **Test Accuracy:** **58.82%**
- **Macro Precision:** 0.4198 | **Weighted Precision:** 0.5316
- **Macro Recall:** 0.4248 | **Weighted Recall:** 0.5882
- **Macro F1-Score:** 0.3906 | **Weighted F1-Score:** 0.5205

### Detailed Classification Report
```
              precision    recall  f1-score   support

       amber       0.67      0.33      0.44        12
       green       0.59      0.94      0.73        17
         red       0.00      0.00      0.00         5

    accuracy                           0.59        34
   macro avg       0.42      0.42      0.39        34
weighted avg       0.53      0.59      0.52        34

```

### Confusion Matrix
```
True \ Pred | amber | green | red
---------------------------------
amber       |     4      |     8      |     0     
green       |     0      |     16     |     1     
red         |     2      |     3      |     0     
```

---

## 4. Real-World Challenge Inference Verification

| # | Real-World Challenge Description | Predicted Domain | Urgency | Confidence | Human Verification Required |
|---|---|---|---|---|---|
| 1 | Dangerous levels of fluoride causing dental and bone fluorosis in... | **Water Resources and Sanitation** | `AMBER` | 28.2% | No |
| 2 | Winter frost and sub-zero temperatures destroyed 8 acres of tomat... | **Healthcare and Rural Nutrition** | `AMBER` | 16.2% | No |
| 3 | Community clinic has no solar power or refrigerator for emergency... | **Clean Energy and Microgrids** | `GREEN` | 25.5% | No |
| 4 | Remote tribal village situated 6 km inside Saranda forest has zer... | **Clean Energy and Microgrids** | `AMBER` | 29.6% | No |
| 5 | Lac farmers in Torpa forced to sell raw resin to intermediaries a... | **Rural Livelihoods** | `AMBER` | 26.8% | No |
| 6 | Old bridge piers collapsing after flash floods cutting off all co... | **Water Resources and Sanitation** | `GREEN` | 14.5% | No |
| 7 | Wheelchair-using students cannot access computer laboratories on ... | **Accessibility and Public Services** | `GREEN` | 21.7% | No |
| 8 | Government ITI institute students trained on obsolete equipment w... | **Smart Education and Vocational Skilling** | `GREEN` | 27.0% | No |

---

## 5. Public Safety & Ethical Safeguards
- **Human Verification Policy:** In accordance with state public safety standards, an ML prediction independently **NEVER** overrides human verification for `RED` tier issues. All `RED` predictions trigger mandatory notification to state administrative nodal officers.
- **Multilingual Support Status:**
  - English & Romanized Hinglish/Santhali: Fully trained and operational.
  - Native Devanagari Hindi & Ol Chiki Santhali: Unicode normalization and character detection architecture in place; marked transparently for full native training once annotated corpus is available.
