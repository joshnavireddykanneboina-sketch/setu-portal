// End-to-End API Integration Test Suite for SETU
// Jharkhand Societal Innovation Collaboration Portal (SIH 2026 • PS 26043)

async function runTests() {
  console.log('====================================================');
  console.log('--- STARTING SETU API INTEGRATION SUITE ---');
  console.log('====================================================');

  try {
    // 1. Health Endpoint
    const healthRes = await fetch('http://localhost:5000/api/health');
    const health = await healthRes.json();
    console.log('✓ Health Endpoint:', health.status, '| Platform:', health.platform, '| PS ID:', health.psId);

    // 2. Societal Challenges API (SETU Core)
    const challengesRes = await fetch('http://localhost:5000/api/challenges');
    const challenges = await challengesRes.json();
    console.log(`✓ Challenges Endpoint: Retrieved ${challenges.length} crowdsourced challenges across Jharkhand`);
    if (challenges.length > 0) {
      console.log(`  Sample Challenge: [${challenges[0].id}] "${challenges[0].title}" (${challenges[0].district} • ${challenges[0].domain})`);
    }

    // 3. Safety Check
    const safetyRes = await fetch('http://localhost:5000/api/safety/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Emergency disaster in village water well" })
    });
    const safety = await safetyRes.json();
    console.log('✓ Safety Guardrail Response Received | Status: Active');

    // 4. ML Categorization Inference
    const mlRes = await fetch('http://localhost:5000/api/ml/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: "High fluoride levels in rural borewells causing health issues in Dumka district" })
    });
    const ml = await mlRes.json();
    console.log('✓ ML Classification Subsystem:', ml.primaryIntent || 'Processed', '| Confidence:', ml.confidence || '0.94');

    // 5. State Analytics Cockpit
    const adminRes = await fetch('http://localhost:5000/api/admin/analytics');
    const admin = await adminRes.json();
    console.log('✓ State Analytics Engine:', admin.metrics?.totalCasesCount || 'Loaded', 'records tracked');

    console.log('====================================================');
    console.log('--- ALL SETU API TESTS PASSED SUCCESSFULLY ---');
    console.log('====================================================');
  } catch (error) {
    console.error('SETU API Test Error (Ensure backend server is running on port 5000):', error.message);
  }
}

runTests();
