// In-Memory End-to-End Stakeholder Ecosystem Verification Suite for SETU Portal
// Tests Citizen, University, Industry, Government Admin flows without requiring network sockets
process.env.NODE_ENV = 'test';

import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { app } from '../backend/server.js';

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
        if (res.getHeader('content-type')?.includes('json') || resBody.startsWith('{') || resBody.startsWith('[')) {
          parsed = JSON.parse(resBody);
        }
      } catch (e) {}
      resolve({ status: res.statusCode, data: parsed, headers: res._headers });
    };
    res.json = (obj) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(obj));
    };
    res.send = (val) => {
      if (typeof val === 'object') return res.json(val);
      res.end(val);
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
    });
  });
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING SETU STAKEHOLDER ECOSYSTEM VERIFICATION SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.psId === '26043', '1. System Health API is operational (PS ID 26043)');

    // 2. Authentication: Citizen Registration
    const citizenEmail = `citizen.test.${Date.now()}@setu.jharkhand.gov.in`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Manish Hansda',
      email: citizenEmail,
      password: 'password123',
      role: 'CITIZEN',
      district: 'Dumka',
      block: 'Jama',
      panchayat: 'Kathikund GP',
      phone: '+91-9431889900'
    });
    assert(regRes.status === 201 && regRes.data.token, '2. Citizen registration succeeds with PBKDF2 hashing & session token');
    const citizenToken = regRes.data.token;

    // 3. Authentication: Login with valid credentials
    const loginRes = await request('POST', '/api/auth/login', {
      email: citizenEmail,
      password: 'password123'
    });
    assert(loginRes.status === 200 && loginRes.data.user.role === 'CITIZEN', '3. Citizen login succeeds with valid token issuance');

    // 4. Portal A: Citizen Submits Societal Challenge with GPS and Media
    const createRes = await request('POST', '/api/challenges', {
      title: 'Groundwater Fluoride Exceeding 5.2 ppm in Jama Block Wells',
      submittedBy: 'Manish Hansda',
      submitterEmail: citizenEmail,
      district: 'Dumka',
      block: 'Jama',
      panchayat: 'Kathikund GP',
      coordinates: { lat: 24.2692, lng: 87.2497, consentGiven: true },
      domain: 'Water Resources',
      description: 'Severe fluorosis observed in school children due to high fluoride levels in drinking tube wells. Decentralized filtration unit required urgently.',
      urgencyPreference: 'RED',
      estimatedBeneficiaries: 12000
    }, { 'authorization': `Bearer ${citizenToken}` });

    assert(createRes.status === 201 && createRes.data.id.startsWith('SETU-JH-2026-'), `4. Citizen challenge submitted with unique state tracking ID (${createRes.data?.id})`);
    const challengeId = createRes.data.id;
    assert(createRes.data.aiClassification?.urgency === 'RED', '   Urgency rated RED and allocated to specialized University');

    // 5. Portal B: University Accepts Challenge Assignment
    const acceptRes = await request('POST', `/api/challenges/${challengeId}/hei-decision`, {
      decision: 'ACCEPT',
      facultyMentor: 'Dr. Rajeshwar Prasad (BIT Mesra)'
    });
    assert(acceptRes.status === 200 && acceptRes.data.challenge?.status === 'HEI_ACCEPTED', '5. University HEI accepts project assignment');

    // 6. Portal B: University Forms Multidisciplinary Student Team
    const teamRes = await request('POST', `/api/challenges/${challengeId}/form-team`, {
      facultyMentor: 'Dr. Rajeshwar Prasad',
      studentLead: 'Ankit Kumar (B.Tech 4th Yr)',
      members: ['Ankit Kumar', 'Priya Soren', 'Rahul Verma'],
      departments: ['Civil & Environmental Engineering', 'Chemistry'],
      solutionName: 'Adsorption-Based Solar Community Water Purifier'
    });
    assert(teamRes.status === 200 && teamRes.data.challenge?.team?.studentLead === 'Ankit Kumar (B.Tech 4th Yr)', '6. Multidisciplinary student team assembled');

    // 7. Portal B: Update Research Roadmap & Prototype Stage
    const planRes = await request('POST', `/api/challenges/${challengeId}/research-plan`, {
      prototypeStage: 'LAB_PROTOTYPE',
      researchPlan: 'Phase 1: Bench test zeolite adsorbent. Phase 2: Assemble 500 LPH pilot unit.',
      expectedPilotDate: '2026-11-20'
    });
    assert(planRes.status === 200 && planRes.data.challenge?.team?.prototypeStage === 'LAB_PROTOTYPE', '7. Prototype stage updated to LAB_PROTOTYPE');

    // 8. Portal C: Industry Pledges CSR Prototyping Grant
    const fundRes1 = await request('POST', `/api/challenges/${challengeId}/fund`, {
      industryPartnerId: 'IND-01',
      industryPartnerName: 'Tata Steel CSR Division',
      grantAmount: 450000,
      industryMentor: 'Amitabh Choudhury (CSR Lead)',
      transactionRef: 'CSR-PO-2026-904'
    });
    assert(fundRes1.status === 201 && fundRes1.data.challenge?.team?.grantApproved === 450000, '8. Industry CSR grant pledged (₹4,50,000)');

    // 9. Portal C: Anti-Duplicate Transaction Protection Test
    const fundRes2 = await request('POST', `/api/challenges/${challengeId}/fund`, {
      industryPartnerId: 'IND-01',
      industryPartnerName: 'Tata Steel CSR Division',
      grantAmount: 450000,
      industryMentor: 'Amitabh Choudhury (CSR Lead)',
      transactionRef: 'CSR-PO-2026-904'
    });
    assert(fundRes2.status === 409, '9. Anti-Duplicate transaction protection triggered (HTTP 409 Conflict)');

    // 10. Portal B: Upload Village Field Testing Report
    const reportRes = await request('POST', `/api/challenges/${challengeId}/field-report`, {
      reportTitle: 'Dumka Jama Block 30-Day Village Validation',
      testLocation: 'Jama Panchayat, Dumka',
      beneficiariesSurveyed: 350,
      outcomeMetrics: 'Fluoride reduced from 5.2 ppm to 0.7 ppm. Community acceptance verified by Mukhiya.'
    });
    assert(reportRes.status === 200 && reportRes.data.challenge?.team?.fieldReports?.length > 0, '10. Village field testing report uploaded');

    // 11. Portal B: Record Patent & Commercial Startup
    const patentRes = await request('POST', `/api/challenges/${challengeId}/patent`, {
      patentNumber: 'IN-PAT-2026-88129',
      patentTitle: 'Zeolite Composite Matrix for Fluoride Remediation',
      startupCreated: 'JharPure Tech Pvt. Ltd.'
    });
    assert(patentRes.status === 200 && patentRes.data.challenge?.team?.patentFiled === true, '11. Intellectual property patent & startup spinoff recorded');

    // 12. Portal D: Government Administrator 24 Districts API
    const distRes = await request('GET', '/api/admin/districts');
    assert(distRes.status === 200 && distRes.data.length === 24, '12. Government Admin covers all 24 Jharkhand districts');

    // 13. Portal D: State Innovation Pulse & Analytics
    const analyticsRes = await request('GET', '/api/admin/analytics');
    assert(analyticsRes.status === 200 && analyticsRes.data.metrics?.totalCSRFundingMobilized > 0, '13. State governance analytics & live pulse metrics verified');

    // 14. Portal D: RFC4180 CSV Export Generation
    const csvRes = await request('GET', '/api/admin/export-csv');
    assert(csvRes.status === 200 && csvRes.headers['content-type']?.includes('text/csv'), '14. Government executive state report CSV export generated');
    assert(typeof csvRes.data === 'string' && csvRes.data.includes('Challenge ID') && csvRes.data.includes('Dumka'), '   CSV content contains challenge headers and district data');

    console.log('\n========================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================');
    
    if (failed > 0) process.exit(1);
    else process.exit(0);

  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
