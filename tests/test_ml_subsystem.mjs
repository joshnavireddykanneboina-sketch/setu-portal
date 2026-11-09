// End-to-End Test Suite for SETU Machine Learning Subsystem
// Tests the 7 Core Requirements:
// 1. Thematic Domain Classification (8 domains)
// 2. Urgency Prediction & Explainability (GREEN, AMBER, RED + Human Verification Safeguard)
// 3. Duplicate Challenge Detection (TF-IDF Cosine Similarity, NO false FAISS claims)
// 4. Intelligent University Routing (100-point multi-factor algorithm)
// 5. Generative AI Integration (Gemini + Transparent Fallback)
// 6. Model Evaluation Report & Benchmark Metrics
// 7. Multilingual Architecture & Script Recognition

process.env.NODE_ENV = 'test';

import { EventEmitter } from 'events';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from '../backend/server.js';
import { detectDuplicateChallenges } from '../backend/services/ml/duplicateDetection.js';
import { routeChallenge } from '../backend/services/routing/routingEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`http://localhost${urlPath}`);
    const req = new Readable({
      read() {
        if (body) {
          const str = typeof body === 'string' ? body : JSON.stringify(body);
          this.push(Buffer.from(str));
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = parsedUrl.pathname + parsedUrl.search;
    req.originalUrl = req.url;
    req.body = body || {};
    req.headers = {
      'content-type': 'application/json',
      ...headers
    };
    req.query = {};
    for (const [k, v] of parsedUrl.searchParams) {
      req.query[k] = v;
    }

    const res = new EventEmitter();
    res.statusCode = 200;
    res._headers = {};
    res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res._headers[k.toLowerCase()];
    res.status = (code) => { res.statusCode = code; return res; };

    let resBody = '';
    res.write = (chunk) => {
      if (chunk) resBody += chunk.toString();
      return true;
    };
    res.end = (chunk) => {
      if (chunk) resBody += chunk.toString();
      let parsed = resBody;
      try {
        parsed = JSON.parse(resBody);
      } catch (e) {
        // keep string
      }
      resolve({
        status: res.statusCode,
        headers: res._headers,
        body: parsed
      });
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
}

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('SETU ML & AI SUBSYSTEM VERIFICATION SUITE');
  console.log('Smart India Hackathon 2026 • Problem Statement ID 26043');
  console.log('======================================================\n');

  // TEST 1: Thematic Domain Classification (Water Resources)
  console.log('[1/7] Testing Thematic Domain Classification (8 Domains)...');
  const classRes1 = await request('POST', '/api/ml/classify', {
    text: 'Severe fluoride contamination in drinking water handpumps in Jama block Dumka causing skeletal fluorosis'
  });
  assert(classRes1.status === 200, 'POST /api/ml/classify responds 200 OK');
  assert(
    classRes1.body.primaryDomain === 'Water Resources and Sanitation' || classRes1.body.primaryDomain === 'Water Resources',
    'Accurately classified as Water Resources domain',
    `Received: ${classRes1.body.primaryDomain}`
  );
  assert(typeof classRes1.body.confidenceScore === 'number', 'Returns numeric confidence score');
  assert(
    classRes1.body.probabilityDistribution && typeof classRes1.body.probabilityDistribution === 'object',
    'Returns full probability distribution across domains'
  );
  assert(classRes1.body.modelInferenceStatus !== undefined, 'Returns model inference status');

  // TEST 2: Thematic Domain Classification (Agriculture)
  const classRes2 = await request('POST', '/api/ml/classify', {
    text: 'Severe winter frost destroyed 8 acres of tomato and chili crop in Gumla due to lack of cold storage and micro-irrigation'
  });
  assert(
    classRes2.body.primaryDomain === 'Agriculture and Soil Health' || classRes2.body.primaryDomain === 'Agriculture',
    'Accurately classified as Agriculture and Soil Health',
    `Received: ${classRes2.body.primaryDomain}`
  );

  // TEST 3: Urgency Prediction & Public Safety Human Verification Rule
  console.log('\n[2/7] Testing Urgency Prediction & Human Verification Safeguard...');
  const urgentRes = await request('POST', '/api/ml/classify', {
    text: 'Critical toxic chemical mine drainage collapse causing fatal poison in village reservoir emergency'
  });
  assert(urgentRes.body.urgencyLevel === 'RED', 'Urgency correctly predicted as RED for acute public hazard');
  assert(
    urgentRes.body.humanVerificationRequired === true,
    'Human Verification Safeguard TRIGGERED: ML never replaces human review for RED public safety',
    `humanVerificationRequired: ${urgentRes.body.humanVerificationRequired}`
  );
  assert(
    typeof urgentRes.body.urgencyReason === 'string' && urgentRes.body.urgencyReason.length > 10,
    'Urgency classification includes explainable rationale',
    urgentRes.body.urgencyReason
  );

  // TEST 4: Urgency Prediction for Normal Challenge (GREEN)
  const normalRes = await request('POST', '/api/ml/classify', {
    text: 'Wheelchair access ramp needed at Panchayat Bhavan for elderly and differently-abled citizens'
  });
  assert(
    ['GREEN', 'AMBER'].includes(normalRes.body.urgencyLevel),
    'Non-emergency issue assigned standard priority (GREEN/AMBER)'
  );

  // TEST 5: Duplicate Challenge Detection (Cosine Similarity)
  console.log('\n[3/7] Testing Duplicate Challenge Semantic Detection...');
  const dupRes = await request('POST', '/api/ml/detect-duplicates', {
    query: 'Groundwater fluoride contamination in handpumps in Dumka',
    threshold: 0.30
  });
  assert(dupRes.status === 200, 'POST /api/ml/detect-duplicates responds 200 OK');
  assert(Array.isArray(dupRes.body.duplicates), 'Returns array of matched duplicate challenges');
  assert(dupRes.body.duplicates.length > 0, 'Successfully detected duplicate water fluoride challenge in Dumka');
  if (dupRes.body.duplicates.length > 0) {
    const match = dupRes.body.duplicates[0];
    assert(match.id !== undefined, 'Matched challenge has ID');
    assert(match.similarityPercentage !== undefined, 'Matched challenge has similarity percentage', match.similarityPercentage);
    assert(match.district !== undefined, 'Matched challenge includes district', match.district);
    assert(match.domain !== undefined, 'Matched challenge includes domain', match.domain);
    assert(match.assignedUniversity !== undefined, 'Matched challenge includes assigned university');
  }
  assert(
    !JSON.stringify(dupRes.body).toLowerCase().includes('faiss operational'),
    'FAISS safeguard: No false claims made about FAISS index'
  );

  // TEST 6: Intelligent University Routing Engine (100-Point Algorithm)
  console.log('\n[4/7] Testing Intelligent University Routing Engine (100-Point Scoring)...');
  const routeRes1 = await request('POST', '/api/ml/route-hei', {
    domain: 'Agriculture and Soil Health',
    district: 'Ranchi',
    urgency: 'AMBER',
    beneficiaries: 3000,
    description: 'Soil acidity and low-cost bio-fertilizer field validation needed for tribal farmers'
  });
  assert(routeRes1.status === 200, 'POST /api/ml/route-hei responds 200 OK');
  assert(
    routeRes1.body.assignedHEI.includes('Birsa Agricultural University') || routeRes1.body.assignedHEI.includes('BIT'),
    'Matches specialized agricultural HEI (Birsa Agricultural University / BIT Mesra)',
    `Assigned: ${routeRes1.body.assignedHEI}`
  );
  assert(typeof routeRes1.body.matchScore === 'number', 'Provides numeric 100-point match score', `${routeRes1.body.matchScore}/100`);
  assert(routeRes1.body.scoreBreakdown !== undefined, 'Provides score breakdown across all 4 factors');
  assert(routeRes1.body.scoreBreakdown.specialization !== undefined, 'Has specialization score');
  assert(routeRes1.body.scoreBreakdown.location !== undefined, 'Has location proximity score');
  assert(routeRes1.body.scoreBreakdown.capacity !== undefined, 'Has workload headroom score');
  assert(routeRes1.body.scoreBreakdown.expertise !== undefined, 'Has incubation expertise score');
  assert(typeof routeRes1.body.routingRationale === 'string', 'Provides explainable routing rationale');
  assert(Array.isArray(routeRes1.body.alternateRecommendations), 'Provides alternate HEI recommendations');
  assert(routeRes1.body.adminOverrideAllowed === true, 'Admin override explicitly allowed for governance compliance');

  // TEST 7: Routing Santhal Pargana Water Challenge
  const routeRes2 = await request('POST', '/api/ml/route-hei', {
    domain: 'Water Resources and Sanitation',
    district: 'Dumka',
    urgency: 'RED'
  });
  assert(
    routeRes2.body.turnaround.toLowerCase().includes('24 hours') || routeRes2.body.turnaround.toLowerCase().includes('fast-track'),
    'Urgency RED triggers 24-hour fast-track turnaround SLA'
  );

  // TEST 8: Generative AI Problem Structuring
  console.log('\n[5/7] Testing Generative AI Integration & Transparent Fallbacks...');
  const structRes = await request('POST', '/api/ml/structure-problem', {
    text: 'water in village handpumps has bad smell and yellow stains on teeth in jama block',
    district: 'Dumka'
  });
  assert(structRes.status === 200, 'POST /api/ml/structure-problem responds 200 OK');
  assert(typeof structRes.body.structuredTitle === 'string', 'Returns structured professional title', structRes.body.structuredTitle);
  assert(typeof structRes.body.problemSummary === 'string', 'Returns crisp problem summary');
  assert(typeof structRes.body.rootCauseHypothesis === 'string', 'Identifies root causes');
  assert(structRes.body.suggestedDomain !== undefined, 'Suggests domain');
  assert(typeof structRes.body.estimatedBeneficiaries === 'number', 'Estimates community beneficiaries');
  assert(structRes.body.engine !== undefined, 'Identifies AI/NLP inference engine');

  // TEST 9: Clarification Question Generation
  const clarifyRes = await request('POST', '/api/ml/clarification-questions', {
    text: 'Drinking water is contaminated in Jama',
    domain: 'Water Resources and Sanitation',
    district: 'Dumka'
  });
  assert(clarifyRes.status === 200, 'POST /api/ml/clarification-questions responds 200 OK');
  assert(Array.isArray(clarifyRes.body.questions) && clarifyRes.body.questions.length >= 2, 'Generates at least 2 clarification questions');

  // TEST 10: Research Directions Suggestion for HEIs
  const researchRes = await request('POST', '/api/ml/suggest-research', {
    domain: 'Water Resources and Sanitation',
    description: 'Fluoride contamination exceeding 5.2 ppm in rural drinking handpumps'
  });
  assert(researchRes.status === 200, 'POST /api/ml/suggest-research responds 200 OK');
  assert(Array.isArray(researchRes.body.researchDirections), 'Returns research directions array');
  assert(researchRes.body.researchDirections.length > 0, 'Contains at least one concrete prototype concept');
  if (researchRes.body.researchDirections.length > 0) {
    const rd = researchRes.body.researchDirections[0];
    assert(rd.prototypeConcept !== undefined, 'Specifies prototype concept');
    assert(rd.methodology !== undefined, 'Specifies validation methodology');
    assert(Array.isArray(rd.suitableDepartments), 'Specifies suitable student departments');
  }

  // TEST 11: Classification Explainability
  const explainRes = await request('POST', '/api/ml/explain', {
    text: 'Acute chemical toxic leakage from mine tailing',
    domain: 'Water Resources and Sanitation',
    urgency: 'RED',
    confidence: 0.92
  });
  assert(explainRes.status === 200, 'POST /api/ml/explain responds 200 OK');
  assert(typeof explainRes.body.domainExplanation === 'string', 'Returns domain explanation');
  assert(typeof explainRes.body.urgencyExplanation === 'string', 'Returns urgency explanation');
  assert(typeof explainRes.body.governanceAdvice === 'string', 'Returns district governance advice');

  // TEST 12: Model Evaluation Report Verification
  console.log('\n[6/7] Verifying Model Evaluation Report (docs/MODEL_EVALUATION_REPORT.md)...');
  const reportPath = path.resolve(__dirname, '../docs/MODEL_EVALUATION_REPORT.md');
  const reportExists = fs.existsSync(reportPath);
  assert(reportExists, 'docs/MODEL_EVALUATION_REPORT.md exists on disk');
  if (reportExists) {
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    assert(reportContent.includes('169'), 'Report documents dataset size (169 samples)');
    assert(reportContent.includes('Stratified'), 'Report documents train/test split methodology');
    assert(reportContent.includes('Confusion Matrix'), 'Report includes Confusion Matrix');
    assert(reportContent.includes('F1-Score') || reportContent.includes('f1-score'), 'Report includes F1-score evaluation');
    assert(reportContent.includes('Real-World Challenge Inference'), 'Report includes real-world challenge benchmark tests');
  }

  // TEST 13: End-to-End Challenge Submission with ML Routing Integration
  console.log('\n[7/7] Testing Challenge Submission End-to-End with ML Routing Integration...');
  const subRes = await request('POST', '/api/challenges', {
    title: 'Cold Storage Room for Perishable Vegetables in Khunti Block',
    description: 'Smallholder tribal farmers losing 35% of harvested cauliflower and capsicum due to absent cold chain storage facility',
    district: 'Khunti',
    block: 'Torpa',
    panchayat: 'Torpa Central',
    domain: 'auto',
    urgencyPreference: 'AMBER',
    estimatedBeneficiaries: 4200
  });
  assert(subRes.status === 201, 'POST /api/challenges successfully creates challenge');
  assert(subRes.body.id.startsWith('SETU-JH-2026-'), 'Generated unique tracking ID format (SETU-JH-2026-XXXX)');
  assert(subRes.body.routingScore !== undefined, 'Assigned 100-point ML routing score on submission', `${subRes.body.routingScore}/100`);
  assert(subRes.body.assignedUniversityName !== undefined, 'Assigned university matched via routing engine', subRes.body.assignedUniversityName);
  assert(subRes.body.routingRationale !== undefined, 'Routing rationale attached to challenge record');
  assert(subRes.body.aiClassification.urgencyReason !== undefined, 'Urgency reason saved in aiClassification');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
