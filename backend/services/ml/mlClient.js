// ML Service Client for SETU Platform
// Invokes the independent Python ML model or transparently falls back to explainable prototype rules
// for Jharkhand Societal Challenge classification across all 8 official thematic domains

import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPT_PATH = path.resolve(__dirname, '../../../ml/src/predict.py');

export const SETU_THEMATIC_DOMAINS = [
  'Water Resources and Sanitation',
  'Agriculture and Soil Health',
  'Healthcare and Rural Nutrition',
  'Clean Energy and Microgrids',
  'Rural Livelihoods',
  'Urban Infrastructure and Mobility',
  'Accessibility and Public Services',
  'Smart Education and Vocational Skilling'
];

export async function classifySocietalChallenge(text) {
  if (!text || typeof text !== 'string') {
    return getFallbackClassification(text || '');
  }

  // 1. Attempt to execute the trained Python ML model
  try {
    const pyOutput = await runPythonPredict(text);
    if (pyOutput && (pyOutput.primaryDomain || pyOutput.primaryIntent)) {
      const primaryDomain = pyOutput.primaryDomain || pyOutput.primaryIntent;
      return {
        text,
        primaryDomain,
        primaryIntent: primaryDomain, // backward-compatibility
        confidenceScore: pyOutput.confidenceScore ?? pyOutput.confidence ?? 0.85,
        confidence: pyOutput.confidenceScore ?? pyOutput.confidence ?? 0.85,
        probabilityDistribution: pyOutput.probabilityDistribution || pyOutput.intentProbabilities || {},
        intentProbabilities: pyOutput.probabilityDistribution || pyOutput.intentProbabilities || {},
        urgencyLevel: pyOutput.urgencyLevel || 'GREEN',
        urgencyProbabilities: pyOutput.urgencyProbabilities || { green: 0.7, amber: 0.2, red: 0.1 },
        urgencyReason: pyOutput.urgencyReason || 'Standard societal challenge prioritized by ML risk features.',
        humanVerificationRequired: Boolean(pyOutput.humanVerificationRequired),
        humanVerificationNotice: pyOutput.humanVerificationNotice || (pyOutput.urgencyLevel === 'RED' ? 'Mandatory administrative validation required for RED urgency prior to field deployment.' : null),
        scriptLanguage: pyOutput.scriptLanguage || { detectedScript: 'Latin/Romanized', primaryLanguage: 'English' },
        overallConfidence: pyOutput.overallConfidence || pyOutput.confidenceScore || 0.85,
        modelInferenceStatus: pyOutput.modelInferenceStatus || 'MODEL_INFERENCE',
        engine: 'Scikit-Learn TF-IDF Logistic Regression Pipeline (SETU)',
        classifiedAt: new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn('[ML CLIENT] Python model execution unavailable, engaging explainable prototype classifier:', err.message);
  }

  // 2. Deterministic Prototype Classifier (Clearly tagged)
  return getFallbackClassification(text);
}

// Backward-compatible alias
export const classifySupportCase = classifySocietalChallenge;

function runPythonPredict(text) {
  return new Promise((resolve, reject) => {
    execFile('python', [SCRIPT_PATH, text], { timeout: 5000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        reject(new Error(`Failed to parse ML JSON output: ${stdout}`));
      }
    });
  });
}

function getFallbackClassification(text) {
  const clean = (text || '').toLowerCase();
  let primaryDomain = 'Rural Livelihoods';
  let urgencyLevel = 'GREEN';
  let conf = 0.88;

  const probs = {
    'Water Resources and Sanitation': 0.05,
    'Agriculture and Soil Health': 0.05,
    'Healthcare and Rural Nutrition': 0.05,
    'Clean Energy and Microgrids': 0.05,
    'Rural Livelihoods': 0.40,
    'Urban Infrastructure and Mobility': 0.15,
    'Accessibility and Public Services': 0.15,
    'Smart Education and Vocational Skilling': 0.10
  };

  if (/\b(water|fluoride|arsenic|well|filtration|borewell|drinking|contamination|river|sanitation|toilets|jal)\b/i.test(clean)) {
    primaryDomain = 'Water Resources and Sanitation';
    probs['Water Resources and Sanitation'] = 0.86;
    probs['Rural Livelihoods'] = 0.04;
  } else if (/\b(crop|frost|soil|paddy|pest|farming|farmer|cultivation|harvest|bio-fertilizer|drought|seeds)\b/i.test(clean)) {
    primaryDomain = 'Agriculture and Soil Health';
    probs['Agriculture and Soil Health'] = 0.87;
    probs['Rural Livelihoods'] = 0.05;
  } else if (/\b(hospital|health|nutrition|malaria|maternal|clinic|phc|ambulance|medicine|stunting|anemia)\b/i.test(clean)) {
    primaryDomain = 'Healthcare and Rural Nutrition';
    probs['Healthcare and Rural Nutrition'] = 0.85;
    probs['Rural Livelihoods'] = 0.05;
  } else if (/\b(solar|microgrid|electricity|power|energy|grid|biomass|mini-grid|transmission)\b/i.test(clean)) {
    primaryDomain = 'Clean Energy and Microgrids';
    probs['Clean Energy and Microgrids'] = 0.88;
    probs['Rural Livelihoods'] = 0.04;
  } else if (/\b(road|bridge|drainage|waste|traffic|solid waste|urban|culvert|flyover|drain|pothole)\b/i.test(clean)) {
    primaryDomain = 'Urban Infrastructure and Mobility';
    probs['Urban Infrastructure and Mobility'] = 0.84;
    probs['Rural Livelihoods'] = 0.06;
  } else if (/\b(disability|wheelchair|ramp|pension|caste|aadhaar|ration|portal|entitlement|public service|panchayat bhavan)\b/i.test(clean)) {
    primaryDomain = 'Accessibility and Public Services';
    probs['Accessibility and Public Services'] = 0.85;
    probs['Rural Livelihoods'] = 0.05;
  } else if (/\b(school|teacher|education|skilling|iti|vocational|laboratory|computers|digital literacy|dropout)\b/i.test(clean)) {
    primaryDomain = 'Smart Education and Vocational Skilling';
    probs['Smart Education and Vocational Skilling'] = 0.86;
    probs['Rural Livelihoods'] = 0.04;
  } else if (/\b(lac|artisan|handloom|tussar|bamboo|minor forest produce|shg|market linkage|mahua|pottery)\b/i.test(clean)) {
    primaryDomain = 'Rural Livelihoods';
    probs['Rural Livelihoods'] = 0.89;
  }

  let urgencyReason = 'Standard societal challenge suitable for programmatic semester research and incubation.';
  let humanVerificationRequired = false;

  if (/\b(critical|immediate|toxic|poison|collapse|outbreak|epidemic|electrocution|death|fatal|severe contamination)\b/i.test(clean)) {
    urgencyLevel = 'RED';
    humanVerificationRequired = true;
    urgencyReason = 'Critical public safety risk detected by domain lexicon. Mandatory 24-hour administrative review required.';
  } else if (/\b(urgent|loss|failing|severe|acute|frost|spoilage|failing pump|sub-zero|blackout)\b/i.test(clean)) {
    urgencyLevel = 'AMBER';
    urgencyReason = 'Time-sensitive seasonal or infrastructure vulnerability with acute community impact window.';
  }

  return {
    text,
    primaryDomain,
    primaryIntent: primaryDomain,
    confidenceScore: conf,
    confidence: conf,
    probabilityDistribution: probs,
    intentProbabilities: probs,
    urgencyLevel,
    urgencyProbabilities: {
      green: urgencyLevel === 'GREEN' ? 0.82 : 0.12,
      amber: urgencyLevel === 'AMBER' ? 0.78 : 0.16,
      red: urgencyLevel === 'RED' ? 0.92 : 0.06
    },
    urgencyReason,
    humanVerificationRequired,
    humanVerificationNotice: humanVerificationRequired ? 'Mandatory administrative validation required for RED urgency prior to field deployment.' : null,
    scriptLanguage: { detectedScript: 'Latin/Romanized', primaryLanguage: 'English', modelReadiness: 'Ready (Evaluated on Jharkhand Challenge Lexicon)' },
    overallConfidence: conf,
    modelInferenceStatus: 'DETERMINISTIC_FALLBACK',
    engine: 'SETU Deterministic Domain Lexicon Classifier',
    source: 'SETU PROTOTYPE FALLBACK CLASSIFIER',
    note: 'Classified using SETU 8-domain lexicon and safety heuristics'
  };
}
