// Generative AI Integration Service for SETU Platform
// Powered by Gemini API with transparent, domain-rich fallback mechanisms for Jharkhand Societal Challenges.
// Smart India Hackathon 2026 • Problem Statement ID 26043

import { callUpstreamLLM } from './client.js';

/**
 * 1. Convert Unstructured Citizen Descriptions into Structured Problem Statements
 */
export async function structureCitizenProblem({ text, district, metadata = {} }) {
  const systemPrompt = `You are an AI innovation liaison for SETU (Jharkhand Societal Innovation Collaboration Portal).
Your task is to analyze raw, unstructured, voice-transcribed, or colloquial problem descriptions submitted by citizens, Panchayati Raj Institutions (PRIs), or ULBs in Jharkhand.
Convert the input into a structured technical problem specification for university researchers.

Output valid JSON with the following exact keys:
{
  "structuredTitle": "Clear, formal 8-12 word problem title",
  "problemSummary": "2-3 sentence crisp technical summary",
  "rootCauseHypothesis": "Underlying systemic, infrastructural, or environmental root causes",
  "suggestedDomain": "One of: Water Resources and Sanitation | Agriculture and Soil Health | Healthcare and Rural Nutrition | Clean Energy and Microgrids | Rural Livelihoods | Urban Infrastructure and Mobility | Accessibility and Public Services | Smart Education and Vocational Skilling",
  "communityImpactStatement": "Quantified or descriptive community impact",
  "estimatedBeneficiaries": 2500,
  "actionableParameters": ["Key parameter 1", "Key parameter 2", "Key parameter 3"]
}`;

  const userPrompt = `District: ${district || 'Jharkhand'}\nCitizen Input: "${text}"`;

  try {
    const rawResult = await callUpstreamLLM({
      messages: [{ role: 'user', text: userPrompt }],
      systemPrompt,
      jsonMode: true
    });

    if (rawResult) {
      const parsed = JSON.parse(rawResult);
      return {
        ...parsed,
        engine: 'Gemini 1.5 Pro/Flash',
        isAIGenerated: true,
        structuredAt: new Date().toISOString()
      };
    }
  } catch (err) {
    console.warn('[GEMINI SERVICE] Upstream call failed for problem structuring, engaging deterministic engine:', err.message);
  }

  // Domain-Aware Deterministic Fallback Engine for Jharkhand
  return fallbackStructureProblem(text, district);
}

/**
 * 2. Generate Clarification Questions to elicit missing details from citizens
 */
export async function generateClarificationQuestions({ text, domain, district }) {
  const systemPrompt = `You are a helpful community liaison for SETU Jharkhand.
Analyze this reported societal challenge and generate 2-3 concise, empathetic clarification questions in plain language to help the citizen or Panchayat officer provide critical missing details (e.g. water testing depth, seasonal variation, exact village/tola name, number of affected households).

Return JSON array of questions:
{
  "clarificationQuestions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}`;

  const userPrompt = `Domain: ${domain || 'General'}\nDistrict: ${district || 'Jharkhand'}\nProblem: "${text}"`;

  try {
    const rawResult = await callUpstreamLLM({
      messages: [{ role: 'user', text: userPrompt }],
      systemPrompt,
      jsonMode: true
    });

    if (rawResult) {
      const parsed = JSON.parse(rawResult);
      if (parsed.clarificationQuestions) {
        return {
          questions: parsed.clarificationQuestions,
          engine: 'Gemini 1.5 Pro/Flash',
          isAIGenerated: true
        };
      }
    }
  } catch (err) {
    console.warn('[GEMINI SERVICE] Upstream call failed for clarification questions:', err.message);
  }

  // Fallback Clarification Questions based on domain
  return fallbackClarificationQuestions(text, domain);
}

/**
 * 3. Generate Dual Concise Summaries: Citizen Receipt + Technical Researcher Brief
 */
export async function generateChallengeSummaries(challengeData) {
  const systemPrompt = `You are an innovation summarizer for SETU Jharkhand.
Generate two distinct summaries for the submitted societal challenge:
1. "citizenReceipt": Clear, respectful, reassuring receipt in accessible plain language confirming the issue, district, and tracking number.
2. "researcherBrief": Structured technical brief for university researchers (BIT Mesra, BAU, IIT ISM) and CSR evaluators specifying domain constraints, potential research directions, and field-testing considerations.

Output JSON:
{
  "citizenReceipt": "Receipt text...",
  "researcherBrief": "Technical brief..."
}`;

  const userPrompt = `Challenge Details:
Title: ${challengeData.title}
Description: ${challengeData.description}
District: ${challengeData.district}
Block: ${challengeData.block || 'N/A'}
Domain: ${challengeData.domain}
Urgency: ${challengeData.urgency || 'GREEN'}`;

  try {
    const rawResult = await callUpstreamLLM({
      messages: [{ role: 'user', text: userPrompt }],
      systemPrompt,
      jsonMode: true
    });

    if (rawResult) {
      const parsed = JSON.parse(rawResult);
      return {
        ...parsed,
        engine: 'Gemini 1.5 Pro/Flash',
        isAIGenerated: true
      };
    }
  } catch (err) {
    console.warn('[GEMINI SERVICE] Upstream call failed for challenge summaries:', err.message);
  }

  // Fallback Dual Summaries
  return fallbackChallengeSummaries(challengeData);
}

/**
 * 4. Suggest Relevant Research Directions for University Student/Faculty Teams
 */
export async function suggestResearchDirections({ domain, description }) {
  const systemPrompt = `You are a senior R&D and innovation advisor for university research faculties in Jharkhand (BIT Mesra, BAU, NIT Jamshedpur, IIT ISM Dhanbad).
Suggest 3-4 viable engineering, agricultural, or socio-technical research directions, low-cost prototype concepts, and field methodology ideas tailored to Jharkhand's geography and rural socio-economic conditions.

Output JSON:
{
  "researchDirections": [
    {
      "title": "Direction title",
      "prototypeConcept": "Description of low-cost hardware, IoT, or bio-process prototype",
      "methodology": "Field deployment & validation methodology",
      "suitableDepartments": ["ECE", "Civil & Env Eng", "Agriculture"]
    }
  ],
  "suggestedFieldTools": ["Tool 1", "Tool 2"],
  "estimatedTimelineMonths": 6
}`;

  const userPrompt = `Domain: ${domain}\nProblem: "${description}"`;

  try {
    const rawResult = await callUpstreamLLM({
      messages: [{ role: 'user', text: userPrompt }],
      systemPrompt,
      jsonMode: true
    });

    if (rawResult) {
      const parsed = JSON.parse(rawResult);
      return {
        ...parsed,
        engine: 'Gemini 1.5 Pro/Flash',
        isAIGenerated: true
      };
    }
  } catch (err) {
    console.warn('[GEMINI SERVICE] Upstream call failed for research directions:', err.message);
  }

  // Fallback Research Directions based on domain
  return fallbackResearchDirections(domain, description);
}

/**
 * 5. Explain ML Classification Results
 */
export async function explainClassification({ text, domain, urgency, confidence }) {
  const systemPrompt = `You are an AI explainability expert for the SETU Platform.
Explain to a citizen and an administrator why this societal challenge was classified under domain "${domain}" with urgency level "${urgency}" (Confidence: ${Math.round((confidence || 0.8) * 100)}%).
Provide a clear, jargon-free explanation highlighting key lexical signals and risk indicators.

Output JSON:
{
  "domainExplanation": "Why this domain was selected",
  "urgencyExplanation": "Why this urgency priority was assigned",
  "keySignals": ["word 1", "word 2", "word 3"],
  "governanceAdvice": "Recommended action for district nodal officers"
}`;

  const userPrompt = `Text: "${text}"\nDomain: ${domain}\nUrgency: ${urgency}`;

  try {
    const rawResult = await callUpstreamLLM({
      messages: [{ role: 'user', text: userPrompt }],
      systemPrompt,
      jsonMode: true
    });

    if (rawResult) {
      const parsed = JSON.parse(rawResult);
      return {
        ...parsed,
        engine: 'Gemini 1.5 Pro/Flash',
        isAIGenerated: true
      };
    }
  } catch (err) {
    console.warn('[GEMINI SERVICE] Upstream call failed for classification explainability:', err.message);
  }

  // Fallback Explainability
  return fallbackExplainClassification(text, domain, urgency, confidence);
}

// -------------------------------------------------------------
// DETERMINISTIC FALLBACK IMPLEMENTATIONS (Jharkhand-Tailored)
// -------------------------------------------------------------

function fallbackStructureProblem(text, district) {
  const clean = (text || '').toLowerCase();
  let domain = 'Rural Livelihoods';
  let title = `Grassroots Societal Challenge in ${district || 'Jharkhand'}`;
  let rootCause = 'Infrastructure deficit and resource accessibility barriers in rural habitations.';
  let impact = 'Directly impacts community livelihood stability and daily subsistence.';
  let beneficiaries = 3500;
  let params = ['Community accessibility', 'Technical feasibility', 'Field monitoring'];

  if (/water|fluoride|arsenic|handpump|drinking|borewell|well/i.test(clean)) {
    domain = 'Water Resources and Sanitation';
    title = `Drinking Water Safety and Filtration Infrastructure Deficit in ${district || 'Jharkhand'}`;
    rootCause = 'Hydrogeological mineral leaching into shallow aquifers combined with unmonitored extraction.';
    impact = 'Severe long-term public health risk including dental fluorosis and waterborne gastrointestinal illnesses.';
    beneficiaries = 4800;
    params = ['PPM contaminant concentration', 'Aquifer water table depth', 'Daily consumption yield'];
  } else if (/crop|frost|soil|paddy|farming|farmer|harvest/i.test(clean)) {
    domain = 'Agriculture and Soil Health';
    title = `Agricultural Yield Resilience and Microclimate Protection in ${district || 'Jharkhand'}`;
    rootCause = 'Unmitigated microclimatic temperature swings and deficiency of low-cost localized protective mulch/storage.';
    impact = 'Vulnerable smallholder farmers face severe seasonal crop loss and cyclical agricultural debt.';
    beneficiaries = 2200;
    params = ['Soil moisture saturation', 'Diurnal surface temperature delta', 'Crop maturity window'];
  } else if (/solar|microgrid|electricity|power|energy|grid/i.test(clean)) {
    domain = 'Clean Energy and Microgrids';
    title = `Decentralized Renewable Microgrid Infrastructure in ${district || 'Jharkhand'}`;
    rootCause = 'Difficult undulating forest terrain preventing stable centralized high-tension grid connectivity.';
    impact = 'Hampered evening education, clinic refrigeration failure, and halted cottage industry machinery.';
    beneficiaries = 1800;
    params = ['Peak household KWh demand', 'Solar irradiance profile', 'Battery storage capacity days'];
  } else if (/hospital|health|malaria|maternal|phc|ambulance|medicine/i.test(clean)) {
    domain = 'Healthcare and Rural Nutrition';
    title = `Primary Healthcare Delivery and Diagnostic Cold-Chain in ${district || 'Jharkhand'}`;
    rootCause = 'Last-mile logistical detachment and lack of continuous power backup for vital medical cold storage.';
    impact = 'Compromised maternal-infant care delivery and delayed emergency response for critical rural patients.';
    beneficiaries = 5200;
    params = ['Distance to tertiary center (km)', 'Cold-chain vaccine integrity', 'Ambulance transit latency'];
  }

  return {
    structuredTitle: title,
    problemSummary: text ? (text.length > 120 ? text.slice(0, 120) + '...' : text) : 'Community reported societal need.',
    rootCauseHypothesis: rootCause,
    suggestedDomain: domain,
    communityImpactStatement: impact,
    estimatedBeneficiaries: beneficiaries,
    actionableParameters: params,
    engine: 'SETU_DETERMINISTIC_FALLBACK',
    isAIGenerated: false,
    structuredAt: new Date().toISOString()
  };
}

function fallbackClarificationQuestions(text, domain) {
  const questionsMap = {
    'Water Resources and Sanitation': [
      'What is the estimated depth of the affected borewells/handpumps in meters?',
      'Has water quality laboratory testing (e.g., PHE Department) been conducted previously in this panchayat?',
      'Approximately how many tolas or habitations rely on these contaminated water sources?'
    ],
    'Agriculture and Soil Health': [
      'What specific crops or produce varieties suffered the most severe damage?',
      'Is there access to perennial surface water (check dam, aahar, pond) for emergency irrigation?',
      'Are local farmers registered under the Birsa Fasal Bima Yojana or Kisan Credit Card scheme?'
    ],
    'Clean Energy and Microgrids': [
      'What is the primary community demand: household domestic lighting, irrigation pumping, or micro-enterprises?',
      'Is there an accessible community land parcel (Gair Mazarua or Panchayat Bhavan roof) for solar array placement?',
      'How far is the nearest existing 11kV/33kV distribution line from the habitation?'
    ],
    'Healthcare and Rural Nutrition': [
      'What is the road transit distance from the village to the nearest functional Community Health Centre (CHC)?',
      'Does the local Health Sub-Centre or Anganwadi have dedicated electricity backup for vaccine storage?',
      'Are ASHAs and ANMs equipped with portable diagnostic toolkits in this block?'
    ]
  };

  const questions = questionsMap[domain] || [
    'What is the exact village, tola, and panchayat name where this challenge is most acute?',
    'Approximately how many households are directly impacted by this condition?',
    'Has this challenge been formally submitted to the Gram Sabha or Block Development Officer (BDO)?'
  ];

  return {
    questions,
    engine: 'SETU_DETERMINISTIC_FALLBACK',
    isAIGenerated: false
  };
}

function fallbackChallengeSummaries(challengeData) {
  const title = challengeData.title || 'Societal Challenge';
  const district = challengeData.district || 'Jharkhand';
  const domain = challengeData.domain || 'Societal Innovation';

  return {
    citizenReceipt: `Receipt Confirmed: Your challenge regarding "${title}" in ${district} has been logged in the SETU state registry. It has been routed to university innovation cells under the ${domain} thematic category. You can track all progress using your unique Tracking ID.`,
    researcherBrief: `R&D Brief: Field challenge in ${district} categorized under ${domain}. Primary constraint involves low-cost deployment, local tribal community participation, and resilient operation under extreme seasonal weather conditions. Priority incubation recommended for student research teams.`,
    engine: 'SETU_DETERMINISTIC_FALLBACK',
    isAIGenerated: false
  };
}

function fallbackResearchDirections(domain, description) {
  const directionsMap = {
    'Water Resources and Sanitation': [
      {
        title: 'Activated Alumina & Terracotta Composite Domestic Adsorption Filter',
        prototypeConcept: 'Gravity-fed low-cost clay-composite filtration candle coated with locally sourced nano-alumina for fluoride and heavy metal capture without electricity.',
        methodology: 'Deploy 10 prototype filter pots in 2 affected tolas; sample effluent water bi-weekly using spectrophotometry for 90 days.',
        suitableDepartments: ['Chemical Engineering', 'Civil & Environmental Engineering', 'Materials Science']
      },
      {
        title: 'Solar-Powered Low-Maintenance Micro-Electrocoagulation Cell',
        prototypeConcept: 'Off-grid 50W DC solar-driven electrocoagulation vessel with sacrificial aluminum/iron electrodes for community-scale handpump head integration.',
        methodology: 'Pilot installation at a community handpump; measure sludge sedimentation rate and arsenic/fluoride reduction efficiency.',
        suitableDepartments: ['Electrical Engineering', 'Environmental Science']
      }
    ],
    'Agriculture and Soil Health': [
      {
        title: 'IoT Sub-Surface Low-Cost Micro-Irrigation & Frost Alert Sensor Node',
        prototypeConcept: 'LoRa-enabled soil moisture and ambient temperature sensor probe sending automated SMS alerts to farmer SHGs 3 hours before sub-zero frost onset.',
        methodology: 'Calibrate capacitive probes against BAU soil moisture baselines across 5 demonstration plots.',
        suitableDepartments: ['Electronics & Communication', 'Agronomy', 'Computer Science']
      },
      {
        title: 'Organic Bio-Char & Trichoderma Enriched Microbial Seed Coating',
        prototypeConcept: 'Pelletized bio-fertilizer formulation utilizing paddy stubble biochar and native mycorrhizae to enhance drought and moisture stress endurance.',
        methodology: 'Randomized block field trial with smallholder farmers comparing germination rate and yield vs control.',
        suitableDepartments: ['Biotechnology', 'Soil Science & Agricultural Chemistry']
      }
    ],
    'Clean Energy and Microgrids': [
      {
        title: 'Smart Decentralized DC Nano-Grid with Smart Pre-Paid Token Metering',
        prototypeConcept: '48V DC microgrid architecture interconnecting 20 households with lithium-iron-phosphate storage and Bluetooth mobile-token recharge.',
        methodology: 'Install in an un-electrified forest hamlet; monitor daily load curves and battery depth-of-discharge cycles.',
        suitableDepartments: ['Electrical & Electronics Engineering', 'Energy Studies']
      }
    ],
    'Rural Livelihoods': [
      {
        title: 'Ergonomic Solar-Heated Lac Processing & Scrapper Machine',
        prototypeConcept: 'Portable mechanical decorticator with flat-plate solar thermal jacket reducing fuel wood consumption in raw sticklac melting by 70%.',
        methodology: 'Field user-experience trials with tribal women lac-gatherers in Khunti district; record throughput per hour and worker fatigue indices.',
        suitableDepartments: ['Mechanical Engineering', 'Production Engineering', 'Rural Management']
      }
    ]
  };

  const directions = directionsMap[domain] || [
    {
      title: 'Community-Centered Low-Cost Assistive Technology Prototype',
      prototypeConcept: 'Modular, field-repairable hardware utilizing locally available bamboo, steel scrap, and open-source microcontroller units.',
      methodology: 'Participatory Rural Appraisal (PRA) followed by 60-day in-situ testing with local Gram Panchayat stakeholders.',
      suitableDepartments: ['Multidisciplinary Engineering', 'Social Sciences']
    }
  ];

  return {
    researchDirections: directions,
    suggestedFieldTools: ['Portable Multi-Parameter Tester', 'Field Data Logger', 'Participatory Survey Kit'],
    estimatedTimelineMonths: 6,
    engine: 'SETU_DETERMINISTIC_FALLBACK',
    isAIGenerated: false
  };
}

function fallbackExplainClassification(text, domain, urgency, confidence) {
  return {
    domainExplanation: `The model categorized this challenge under "${domain}" based on high-frequency semantic associations with related infrastructural, resource, or socio-economic keywords.`,
    urgencyExplanation: urgency === 'RED'
      ? 'Assigned RED urgency due to critical indicators of public safety risk, toxicity, or structural collapse requiring immediate administrative intervention.'
      : (urgency === 'AMBER'
        ? 'Assigned AMBER urgency due to acute seasonal or operational vulnerability threatening community livelihoods or public services.'
        : 'Assigned GREEN priority representing a standard societal innovation challenge suitable for semester-long academic R&D.'),
    keySignals: ['domain keywords', 'severity indicators', 'community footprint'],
    governanceAdvice: urgency === 'RED'
      ? 'Immediate dispatch to District Collector / Deputy Commissioner and designated HEI nodal officer within 24 hours.'
      : 'Schedule for next bi-weekly District Innovation Council review meeting.',
    engine: 'SETU_DETERMINISTIC_FALLBACK',
    isAIGenerated: false
  };
}
