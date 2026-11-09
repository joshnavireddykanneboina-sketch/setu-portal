// Backend API Routes for Societal Challenges (/api/challenges)
// SETU - Jharkhand Societal Innovation Collaboration Portal (SIH 2026 PS ID 26043)
import express from 'express';
import { find, findOne, insert, update } from '../../database/db.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { routeChallenge } from '../services/routing/routingEngine.js';

const router = express.Router();

// GET /api/challenges - List all societal challenges with comprehensive filters
router.get('/', optionalAuth, (req, res) => {
  let items = find('challenges') || [];
  const { district, domain, status, urgency, assignedUniversityId, industryPartnerId, submitterEmail, search } = req.query;

  if (district && district !== 'all') {
    items = items.filter(c => c.district?.toLowerCase() === district.toLowerCase());
  }
  if (domain && domain !== 'all') {
    items = items.filter(c => c.domain?.toLowerCase() === domain.toLowerCase());
  }
  if (status && status !== 'all') {
    items = items.filter(c => c.status?.toLowerCase() === status.toLowerCase());
  }
  if (urgency && urgency !== 'all') {
    items = items.filter(c => c.aiClassification?.urgency?.toUpperCase() === urgency.toUpperCase());
  }
  if (assignedUniversityId && assignedUniversityId !== 'all') {
    items = items.filter(c => c.assignedUniversityId === assignedUniversityId);
  }
  if (industryPartnerId && industryPartnerId !== 'all') {
    items = items.filter(c => c.industryPartnerId === industryPartnerId);
  }
  if (submitterEmail) {
    items = items.filter(c => c.submitterEmail?.toLowerCase() === submitterEmail.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(c => 
      c.title?.toLowerCase().includes(q) || 
      c.description?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q) ||
      c.block?.toLowerCase().includes(q) ||
      c.panchayat?.toLowerCase().includes(q)
    );
  }

  res.json(items);
});

// GET /api/challenges/:id - Get single challenge detail
router.get('/:id', optionalAuth, (req, res) => {
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: 'Societal challenge not found with ID: ' + req.params.id });
  }
  res.json(challenge);
});

// POST /api/challenges - Submit new societal challenge from Citizen / PRI / Community
router.post('/', optionalAuth, (req, res) => {
  const {
    title,
    submittedBy,
    submitterRole,
    submitterEmail,
    submitterPhone,
    district,
    block,
    panchayat,
    coordinates,
    domain,
    description,
    urgencyPreference,
    evidenceMedia = [],
    estimatedBeneficiaries = 5000
  } = req.body;

  if (!title || !description || !district) {
    return res.status(400).json({ 
      error: 'Validation Error',
      message: 'Title, problem description, and district are mandatory fields.' 
    });
  }

  const existingChallenges = find('challenges') || [];

  // Idempotency Protection for Offline Queue Sync & Network Retries
  const idempotencyKey = req.headers['x-idempotency-key'] || req.body.idempotencyKey;
  if (idempotencyKey) {
    const existingByIdempotency = existingChallenges.find(c => c.idempotencyKey === idempotencyKey);
    if (existingByIdempotency) {
      return res.status(200).json({
        ...existingByIdempotency,
        isIdempotentReplay: true
      });
    }
  }

  // Semantic Deduplication Scan (matches tokens and district against existing challenges in Jharkhand)
  let matchedDuplicate = null;
  const descLower = (title + ' ' + description).toLowerCase();
  for (const item of existingChallenges) {
    const existingText = (item.title + ' ' + item.description).toLowerCase();
    const commonKeywords = [
      'water', 'fluoride', 'frost', 'lac', 'cold storage', 'paddy', 'solar', 
      'arsenic', 'mine', 'acid mine', 'malnutrition', 'tussar', 'forest', 'waste'
    ];
    const matchedKeyword = commonKeywords.find(w => descLower.includes(w) && existingText.includes(w));
    if (matchedKeyword && item.district.toLowerCase() === district.toLowerCase()) {
      matchedDuplicate = item;
      break;
    }
  }

  // Domain Classifier Fallback
  let primaryDomain = domain;
  if (!primaryDomain || primaryDomain === 'auto') {
    if (descLower.includes('crop') || descLower.includes('farmer') || descLower.includes('lac') || descLower.includes('soil') || descLower.includes('cold storage')) {
      primaryDomain = 'Agriculture';
    } else if (descLower.includes('water') || descLower.includes('filtration') || descLower.includes('fluoride') || descLower.includes('arsenic') || descLower.includes('borewell')) {
      primaryDomain = 'Water Resources';
    } else if (descLower.includes('health') || descLower.includes('hospital') || descLower.includes('disease') || descLower.includes('clinic')) {
      primaryDomain = 'Healthcare';
    } else if (descLower.includes('solar') || descLower.includes('energy') || descLower.includes('microgrid') || descLower.includes('power')) {
      primaryDomain = 'Renewable Energy';
    } else if (descLower.includes('mine') || descLower.includes('tailing') || descLower.includes('overburden') || descLower.includes('drainage')) {
      primaryDomain = 'Mining & Environmental Remediation';
    } else if (descLower.includes('tribal') || descLower.includes('artisan') || descLower.includes('handicraft') || descLower.includes('forest')) {
      primaryDomain = 'Tribal Livelihoods';
    } else {
      primaryDomain = 'Water Resources';
    }
  }

  // Urgency Prediction
  let predictedUrgency = urgencyPreference || 'AMBER';
  if (!urgencyPreference) {
    if (descLower.includes('emergency') || descLower.includes('toxic') || descLower.includes('death') || descLower.includes('fluoride') || descLower.includes('severe') || descLower.includes('frost')) {
      predictedUrgency = 'RED';
    } else if (descLower.includes('immediate') || descLower.includes('crisis') || descLower.includes('shortage')) {
      predictedUrgency = 'AMBER';
    } else {
      predictedUrgency = 'GREEN';
    }
  }

  // Intelligent Multi-Factor HEI Routing (100-Point Algorithm)
  const routingResult = routeChallenge({
    domain: primaryDomain,
    district,
    urgency: predictedUrgency,
    beneficiaries: Number(estimatedBeneficiaries) || 5000,
    description
  });

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `SETU-JH-2026-${randomNum}`;

  const callerUser = req.user;
  const submitterNameFinal = submittedBy || callerUser?.name || 'Citizen Contributor';
  const submitterEmailFinal = submitterEmail || callerUser?.email || 'citizen@setu.jharkhand.gov.in';

  const newChallenge = {
    id: newId,
    idempotencyKey: idempotencyKey || null,
    title: title.trim(),
    submittedBy: submitterNameFinal,
    submitterRole: submitterRole || callerUser?.role || 'Community Resident',
    submitterEmail: submitterEmailFinal,
    submitterPhone: submitterPhone || callerUser?.phone || '+91-9431000000',
    district,
    block: block || 'Central Block',
    panchayat: panchayat || 'Gram Panchayat Office',
    coordinates: coordinates || { lat: 23.3441, lng: 85.3096, consentGiven: !!coordinates },
    domain: primaryDomain,
    description: description.trim(),
    evidenceMedia: evidenceMedia.length ? evidenceMedia : ['https://images.unsplash.com/photo-1541888946425-d0fbb186c572?auto=format&fit=crop&w=800&q=80'],
    status: matchedDuplicate ? 'DUPLICATE_FLAGGED' : 'AI_VALIDATED',
    aiClassification: {
      primaryDomain,
      secondaryDomain: 'Rural Technology',
      confidenceScore: 0.95,
      isDuplicate: !!matchedDuplicate,
      matchedDuplicateId: matchedDuplicate ? matchedDuplicate.id : null,
      priorityScore: predictedUrgency === 'RED' ? 94 : (predictedUrgency === 'AMBER' ? 82 : 68),
      urgency: predictedUrgency,
      urgencyReason: predictedUrgency === 'RED' 
        ? 'Critical public safety or severe toxicity risk identified. 24-hr administrative oversight initiated.'
        : (predictedUrgency === 'AMBER' ? 'High priority seasonal crop/infrastructure vulnerability.' : 'Standard societal challenge for semester incubation.'),
      humanVerificationRequired: predictedUrgency === 'RED',
      humanVerificationNotice: predictedUrgency === 'RED' ? 'Mandatory administrative validation required for RED urgency prior to field deployment.' : null,
      estimatedBeneficiaries: Number(estimatedBeneficiaries) || 8500
    },
    assignedUniversityId: routingResult.heiId,
    assignedUniversityName: routingResult.assignedHEI,
    heiIncubationCenter: routingResult.heiIncubationCenter,
    routingScore: routingResult.matchScore,
    routingScoreBreakdown: routingResult.scoreBreakdown,
    routingRationale: routingResult.routingRationale,
    partnerIndustryName: routingResult.partnerIndustry,
    alternateRecommendations: routingResult.alternateRecommendations,
    industryPartnerId: null,
    industryPartnerName: null,
    team: {
      facultyMentor: null,
      studentLead: null,
      members: [],
      solutionName: `Research Initiative for ${title.slice(0, 40)}`,
      grantApproved: 0,
      milestones: [
        { title: 'AI Classification & Deduplication Validation', completed: true, date: new Date().toISOString().split('T')[0] },
        { title: 'HEI University Allocation & Faculty Assignment', completed: false, date: 'Pending' },
        { title: 'Multidisciplinary Team Formation & Prototype Proposal', completed: false, date: 'Pending' },
        { title: 'Industry CSR Mentorship & Prototyping Grant', completed: false, date: 'Pending' },
        { title: 'Field Pilot Testing & Community Validation', completed: false, date: 'Pending' },
        { title: 'IP Patent Filing & Commercial Deployment', completed: false, date: 'Pending' }
      ],
      patentFiled: false,
      patentNumber: null,
      startupCreated: null,
      fieldReports: [],
      prototypeStage: 'CONCEPT'
    },
    fundingTransactions: [],
    rejectionHistory: [],
    auditHistory: [
      {
        action: 'CHALLENGE_SUBMITTED',
        actor: submitterNameFinal,
        role: 'CITIZEN',
        timestamp: new Date().toISOString(),
        details: `Submitted challenge in ${district} district. Automated AI classification: ${primaryDomain} (${predictedUrgency} urgency).`
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  insert('challenges', newChallenge);

  // Add Notification to audit log
  insert('notifications', {
    id: `NOTIF-${Date.now()}`,
    type: 'challenge_submitted',
    title: 'Societal Challenge Registered',
    message: `Challenge #${newId} recorded for ${district} district. Auto-allocated to ${routingResult.assignedHEI || 'HEI'}.`,
    timestamp: 'Just now',
    read: false,
    route: '/journey'
  });

  res.status(201).json(newChallenge);
});

// POST /api/challenges/:id/hei-decision - University accepts or rejects allocation
router.post('/:id/hei-decision', requireAuth, requireRole('UNIVERSITY', 'ADMIN', 'GOVERNMENT'), (req, res) => {
  const { decision, reason, facultyMentor } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  if (decision === 'ACCEPT') {
    const updatedMilestones = challenge.team?.milestones?.map((m, idx) => 
      idx === 1 ? { ...m, completed: true, date: new Date().toISOString().split('T')[0] } : m
    );

    const updated = update('challenges', req.params.id, {
      status: 'HEI_ACCEPTED',
      team: {
        ...challenge.team,
        facultyMentor: facultyMentor || challenge.team?.facultyMentor || 'Assigned Faculty Coordinator',
        milestones: updatedMilestones
      },
      auditHistory: [
        ...(challenge.auditHistory || []),
        {
          action: 'HEI_ASSIGNMENT_ACCEPTED',
          actor: challenge.assignedUniversityName,
          role: 'UNIVERSITY',
          timestamp: new Date().toISOString(),
          details: `Accepted project assignment by ${challenge.assignedUniversityName}. Faculty coordinator: ${facultyMentor || 'Pending'}.`
        }
      ]
    });
    return res.json({ message: 'Challenge assignment accepted by university.', challenge: updated });
  }

  if (decision === 'REJECT') {
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is mandatory.' });
    }

    const rejectionRecord = {
      universityId: challenge.assignedUniversityId,
      universityName: challenge.assignedUniversityName,
      reason: reason.trim(),
      timestamp: new Date().toISOString()
    };

    const updated = update('challenges', req.params.id, {
      status: 'HEI_REJECTED',
      rejectionHistory: [...(challenge.rejectionHistory || []), rejectionRecord],
      auditHistory: [
        ...(challenge.auditHistory || []),
        {
          action: 'HEI_ASSIGNMENT_REJECTED',
          actor: challenge.assignedUniversityName,
          role: 'UNIVERSITY',
          timestamp: new Date().toISOString(),
          details: `Rejected assignment: "${reason.trim()}". Re-queued for government reallocation.`
        }
      ]
    });
    return res.json({ message: 'Assignment rejected. Challenge re-queued for administrative reallocation.', challenge: updated });
  }

  return res.status(400).json({ error: 'Decision must be ACCEPT or REJECT.' });
});

// POST /api/challenges/:id/form-team - Form multidisciplinary project team
router.post('/:id/form-team', requireAuth, requireRole('UNIVERSITY', 'ADMIN', 'GOVERNMENT'), (req, res) => {
  const { facultyMentor, studentLead, members = [], solutionName, departments = [] } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  if (!facultyMentor || !studentLead) {
    return res.status(400).json({ error: 'Faculty mentor and student team lead are required.' });
  }

  const updatedMilestones = challenge.team?.milestones?.map((m, idx) => 
    idx === 2 ? { ...m, completed: true, date: new Date().toISOString().split('T')[0] } : m
  );

  const updated = update('challenges', req.params.id, {
    status: 'TEAM_FORMED',
    team: {
      ...challenge.team,
      facultyMentor,
      studentLead,
      members: members.length ? members : (challenge.team?.members || [studentLead]),
      solutionName: solutionName || challenge.team?.solutionName,
      departments: departments.length ? departments : ['Engineering', 'Rural Development'],
      milestones: updatedMilestones
    },
    auditHistory: [
      ...(challenge.auditHistory || []),
      {
        action: 'PROJECT_TEAM_FORMED',
        actor: facultyMentor,
        role: 'UNIVERSITY',
        timestamp: new Date().toISOString(),
        details: `Multidisciplinary team assembled. Lead: ${studentLead}, Solution: ${solutionName || 'Initiative'}.`
      }
    ]
  });

  res.json({ message: 'Multidisciplinary research team constituted.', challenge: updated });
});

// POST /api/challenges/:id/research-plan - Update prototype stage and research roadmap
router.post('/:id/research-plan', requireAuth, requireRole('UNIVERSITY', 'ADMIN', 'GOVERNMENT'), (req, res) => {
  const { researchPlan, prototypeStage = 'LAB_PROTOTYPE', expectedPilotDate } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const updated = update('challenges', req.params.id, {
    status: prototypeStage === 'FIELD_TESTING' ? 'FIELD_TESTING' : 'PROTOTYPE_DEVELOPMENT',
    team: {
      ...challenge.team,
      researchPlan: researchPlan || challenge.team?.researchPlan,
      prototypeStage,
      expectedPilotDate: expectedPilotDate || challenge.team?.expectedPilotDate
    },
    auditHistory: [
      ...(challenge.auditHistory || []),
      {
        action: 'RESEARCH_PLAN_UPDATED',
        actor: challenge.team?.facultyMentor || 'University Lead',
        role: 'UNIVERSITY',
        timestamp: new Date().toISOString(),
        details: `Prototype stage advanced to ${prototypeStage}. Expected field pilot: ${expectedPilotDate || 'TBD'}.`
      }
    ]
  });

  res.json({ message: 'Research plan and prototype stage updated.', challenge: updated });
});

// POST /api/challenges/:id/field-report - Upload field testing report and outcome evidence
router.post('/:id/field-report', requireAuth, requireRole('UNIVERSITY', 'ADMIN', 'GOVERNMENT'), (req, res) => {
  const { reportTitle, testLocation, beneficiariesSurveyed, outcomeMetrics, reportDocumentUrl } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  if (!reportTitle) {
    return res.status(400).json({ error: 'Report title is required.' });
  }

  const newReport = {
    id: `RPT-${Date.now().toString().slice(-4)}`,
    reportTitle: reportTitle.trim(),
    testLocation: testLocation || `${challenge.block}, ${challenge.district}`,
    beneficiariesSurveyed: Number(beneficiariesSurveyed) || 150,
    outcomeMetrics: outcomeMetrics || 'Field validation completed with community PRI verification.',
    reportDocumentUrl: reportDocumentUrl || 'https://setu.jharkhand.gov.in/docs/field-test-certified.pdf',
    date: new Date().toISOString().split('T')[0]
  };

  const updatedMilestones = challenge.team?.milestones?.map((m, idx) => 
    idx === 4 ? { ...m, completed: true, date: new Date().toISOString().split('T')[0] } : m
  );

  const updated = update('challenges', req.params.id, {
    status: 'FIELD_TESTING',
    team: {
      ...challenge.team,
      prototypeStage: 'FIELD_TESTING',
      fieldReports: [...(challenge.team?.fieldReports || []), newReport],
      milestones: updatedMilestones
    },
    auditHistory: [
      ...(challenge.auditHistory || []),
      {
        action: 'FIELD_TEST_REPORT_FILED',
        actor: challenge.team?.facultyMentor || 'University Team',
        role: 'UNIVERSITY',
        timestamp: new Date().toISOString(),
        details: `Field report "${reportTitle}" uploaded. ${beneficiariesSurveyed || 150} local residents surveyed in ${challenge.district}.`
      }
    ]
  });

  res.json({ message: 'Field testing report successfully archived.', challenge: updated });
});

// POST /api/challenges/:id/patent - Record intellectual property (patent) or startup created
router.post('/:id/patent', requireAuth, requireRole('UNIVERSITY', 'ADMIN', 'GOVERNMENT'), (req, res) => {
  const { patentNumber, patentTitle, filingDate, startupCreated } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  if (!patentNumber && !startupCreated) {
    return res.status(400).json({ error: 'Provide at least a patent application number or startup company name.' });
  }

  const updatedMilestones = challenge.team?.milestones?.map((m, idx) => 
    idx === 5 ? { ...m, completed: true, date: new Date().toISOString().split('T')[0] } : m
  );

  const updated = update('challenges', req.params.id, {
    status: 'FIELD_DEPLOYED',
    team: {
      ...challenge.team,
      patentFiled: !!patentNumber,
      patentNumber: patentNumber || challenge.team?.patentNumber,
      patentTitle: patentTitle || challenge.team?.solutionName,
      patentFilingDate: filingDate || new Date().toISOString().split('T')[0],
      startupCreated: startupCreated || challenge.team?.startupCreated,
      milestones: updatedMilestones
    },
    auditHistory: [
      ...(challenge.auditHistory || []),
      {
        action: 'IP_PATENT_RECORDED',
        actor: challenge.assignedUniversityName,
        role: 'UNIVERSITY',
        timestamp: new Date().toISOString(),
        details: patentNumber ? `Patent filed (#${patentNumber}) for ${challenge.team?.solutionName}.` : `Startup spun off: ${startupCreated}.`
      }
    ]
  });

  res.json({ message: 'Innovation IP and commercialization record saved.', challenge: updated });
});

// POST /api/challenges/:id/fund - Industry partner pledges CSR funding with duplicate prevention
router.post('/:id/fund', requireAuth, requireRole('INDUSTRY', 'ADMIN', 'GOVERNMENT'), (req, res) => {
  const { industryPartnerId, industryPartnerName, grantAmount, industryMentor, transactionRef } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const pledgeNum = Number(grantAmount);
  if (!pledgeNum || pledgeNum <= 0) {
    return res.status(400).json({ error: 'Pledge amount must be a positive number.' });
  }

  const pId = industryPartnerId || 'IND-01';
  const pName = industryPartnerName || 'Tata Steel CSR Division';

  // Transaction de-duplication check: prevent duplicate submissions within 60 seconds
  const recentTransactions = challenge.fundingTransactions || [];
  const oneMinuteAgo = Date.now() - 60000;
  const isDuplicate = recentTransactions.some(txn => 
    txn.partnerId === pId && 
    txn.amount === pledgeNum && 
    new Date(txn.timestamp).getTime() > oneMinuteAgo
  );

  if (isDuplicate) {
    return res.status(409).json({ 
      error: 'Duplicate Transaction Detected',
      message: 'A CSR funding pledge of this exact amount was just processed for this challenge. Please wait before submitting another transaction.'
    });
  }

  const txnId = `TXN-CSR-${Date.now().toString().slice(-6)}`;
  const newTransaction = {
    id: txnId,
    ref: transactionRef || `CSR-GRANT-${Date.now()}`,
    partnerId: pId,
    partnerName: pName,
    amount: pledgeNum,
    industryMentor: industryMentor || 'Senior CSR Lead',
    status: 'COMMITTED',
    timestamp: new Date().toISOString()
  };

  const updatedMilestones = challenge.team?.milestones?.map((m, idx) => 
    idx === 3 ? { ...m, completed: true, date: new Date().toISOString().split('T')[0] } : m
  );

  const updated = update('challenges', req.params.id, {
    industryPartnerId: pId,
    industryPartnerName: pName,
    status: challenge.status === 'SUBMITTED' || challenge.status === 'AI_VALIDATED' ? 'INDUSTRY_SPONSORED' : challenge.status,
    team: {
      ...challenge.team,
      grantApproved: (challenge.team?.grantApproved || 0) + pledgeNum,
      industryMentor: industryMentor || challenge.team?.industryMentor,
      milestones: updatedMilestones
    },
    fundingTransactions: [...recentTransactions, newTransaction],
    auditHistory: [
      ...(challenge.auditHistory || []),
      {
        action: 'CSR_FUNDING_PLEDGED',
        actor: pName,
        role: 'INDUSTRY',
        timestamp: new Date().toISOString(),
        details: `Pledged ₹${pledgeNum.toLocaleString('en-IN')} CSR prototyping grant. Transaction ID: ${txnId}. Mentor: ${industryMentor || 'Assigned'}.`
      }
    ]
  });

  res.status(201).json({
    message: `₹${pledgeNum.toLocaleString('en-IN')} CSR funding pledged successfully.`,
    transaction: newTransaction,
    challenge: updated
  });
});

// POST /api/challenges/:id/reassign-hei - Government Admin reallocates HEI
router.post('/:id/reassign-hei', requireAuth, requireRole('ADMIN', 'GOVERNMENT'), (req, res) => {
  const { newUniversityId, newUniversityName, reassignmentNote } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  if (!newUniversityId || !newUniversityName) {
    return res.status(400).json({ error: 'Target university ID and name are required.' });
  }

  const updated = update('challenges', req.params.id, {
    assignedUniversityId: newUniversityId,
    assignedUniversityName: newUniversityName,
    status: 'HEI_ASSIGNED',
    auditHistory: [
      ...(challenge.auditHistory || []),
      {
        action: 'GOVERNMENT_HEI_REALLOCATION',
        actor: 'Dept of Higher & Technical Education',
        role: 'GOVERNMENT',
        timestamp: new Date().toISOString(),
        details: `Reassigned from ${challenge.assignedUniversityName} to ${newUniversityName}. Note: ${reassignmentNote || 'Administrative load rebalance'}.`
      }
    ]
  });

  res.json({ message: `Challenge reallocated to ${newUniversityName}.`, challenge: updated });
});

// PUT /api/challenges/:id/milestones - Update project milestones
router.put('/:id/milestones', requireAuth, requireRole('UNIVERSITY', 'ADMIN', 'GOVERNMENT'), (req, res) => {
  const { milestones } = req.body;
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  if (!Array.isArray(milestones)) {
    return res.status(400).json({ error: 'Milestones must be an array.' });
  }

  const updated = update('challenges', req.params.id, {
    team: {
      ...challenge.team,
      milestones
    },
    updatedAt: new Date().toISOString()
  });

  res.json(updated);
});

// PUT /api/challenges/:id - General update for challenge details
router.put('/:id', requireAuth, (req, res) => {
  const challenge = findOne('challenges', req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const allowedUpdates = {};
  const fields = ['title', 'description', 'status', 'domain', 'district', 'block', 'panchayat', 'team'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      allowedUpdates[f] = req.body[f];
    }
  }
  allowedUpdates.updatedAt = new Date().toISOString();

  const updated = update('challenges', req.params.id, allowedUpdates);
  res.json(updated);
});

export default router;
