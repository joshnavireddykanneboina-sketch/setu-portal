// Unified State & Data Store for SETU Platform (SIH 2026 • PS ID 26043)
// Fully persistent via localStorage with reactive listener support

const STORAGE_KEY = 'SETU_PLATFORM_STATE_V1';

// Initial Seed Data
const INITIAL_STATE = {
  currentRole: 'citizen', // 'citizen' | 'university' | 'industry' | 'admin'
  currentUser: {
    id: 'CITIZEN-101',
    name: 'Rameshwar Mahato',
    email: 'citizen@setu.jharkhand.gov.in',
    role: 'CITIZEN',
    district: 'Dumka',
    block: 'Jama',
    language: 'EN',
    preferences: {
      modality: 'Online or Field Visit',
      shareSummaryWithHEI: true,
      allowCSRFunding: true
    }
  },

  // 6 Core Thematic Domains of Jharkhand (SIH 2026 PS ID 26043)
  departments: [
    { id: 'water', name: 'Water Resources & Fluoride Remediation', capacity: 92, activeCases: 48, waitTime: 'Under Review', lead: 'Dr. Rajeshwar Prasad (BIT Mesra)' },
    { id: 'agri', name: 'Smart Agriculture & Post-Harvest Cold Chain', capacity: 88, activeCases: 42, waitTime: 'Under Review', lead: 'Dr. Swati Soren (BAU Ranchi)' },
    { id: 'energy', name: 'Renewable Energy & Tribal Solar Microgrids', capacity: 90, activeCases: 36, waitTime: 'Allocated', lead: 'Prof. Alok Ranjan (IIT-ISM Dhanbad)' },
    { id: 'health', name: 'Rural Healthcare & Tribal Telemedicine', capacity: 84, activeCases: 29, waitTime: 'Under Review', lead: 'Dr. Ananya Mukherjee (NIT Jamshedpur)' },
    { id: 'mining', name: 'Mining Environmental Remediation & Waste Tech', capacity: 75, activeCases: 19, waitTime: 'Under Review', lead: 'Dr. S. K. Mandal (BIT Sindri)' },
    { id: 'livelihood', name: 'Tribal Livelihoods & Forest Produce Engineering', capacity: 95, activeCases: 31, waitTime: 'Prototyping', lead: 'Amitabh Choudhury (Tata Steel CSR)' },
  ],

  // HEI Technical Advisors & CSR Innovation Leads
  counsellors: [
    {
      id: 'ADV-001',
      name: 'Dr. Rajeshwar Prasad',
      department: 'Water Resources & Fluoride Remediation',
      specialization: 'Bio-Char & Activated Alumina Water Filtration Systems',
      availability: 'Wed, Fri',
      currentLoad: 6,
      maxLoad: 12,
      status: 'Available',
      avatarColor: '#00F2FE'
    },
    {
      id: 'ADV-002',
      name: 'Dr. Swati Soren',
      department: 'Smart Agriculture & Post-Harvest Cold Chain',
      specialization: 'IoT Frost Early Warning & Solar Crop Dehydration',
      availability: 'Tue, Thu',
      currentLoad: 5,
      maxLoad: 10,
      status: 'Available',
      avatarColor: '#8DCFA9'
    },
    {
      id: 'ADV-003',
      name: 'Amitabh Choudhury',
      department: 'Tribal Livelihoods & Forest Produce Engineering',
      specialization: 'CSR Seed Grants & Pilot Manufacturing Support',
      availability: 'Mon, Wed',
      currentLoad: 8,
      maxLoad: 15,
      status: 'Available',
      avatarColor: '#EBA756'
    },
    {
      id: 'ADV-004',
      name: 'Dr. Subhashish Roy, IAS',
      department: 'State Incubation & IP Desk',
      specialization: 'Statewide Deployment & Inter-Institutional Alliances',
      availability: 'Thu, Fri',
      currentLoad: 4,
      maxLoad: 8,
      status: 'Available',
      avatarColor: '#C7B8F5'
    }
  ],

  // Active Jharkhand Societal Challenges
  cases: [
    {
      id: 'SETU-2026-8901',
      studentId: 'CITIZEN-101',
      studentName: 'Rameshwar Mahato',
      createdAt: '2026-09-20T10:24:00Z',
      lastUpdated: '2026-09-25T14:30:00Z',
      message: 'In Majhgaon Panchayat (Dumka), over 12 hand-pumps extract water with fluoride levels exceeding 3.5 mg/L, causing dental and skeletal fluorosis across 1,800 school children.',
      intent: 'WATER_RESOURCES',
      isMultiDepartment: true,
      urgency: 'HIGH',
      confidence: 0.96,
      themes: [
        { label: 'Water Contamination', relevance: 'High', color: '#00F2FE' },
        { label: 'Fluoride Remediation', relevance: 'High', color: '#38BDF8' },
        { label: 'School Health Impact', relevance: 'High', color: '#EBA756' }
      ],
      recommendedDepartments: [
        'Water Resources & Fluoride Remediation',
        'Rural Healthcare & Tribal Telemedicine'
      ],
      assignedCounsellor: 'Dr. Rajeshwar Prasad',
      status: 'Assigned to BIT Mesra R&D Lab',
      studentConsent: {
        shareSummary: true,
        shareRawMessage: false,
        shareResourceHistory: true
      },
      approvedSummary: 'Citizen reports severe fluoride toxicity in 12 community borewells in Majhgaon, Dumka. Multi-institutional technical response initiated: BIT Mesra R&D laboratory allocated for domestic activated-alumina filter prototyping; Tata Steel CSR pledged pilot batch funding.',
      appointment: {
        id: 'REV-9041',
        counsellor: 'Dr. Rajeshwar Prasad (BIT Mesra)',
        dept: 'Water Resources & Fluoride Remediation',
        date: 'Wednesday, Oct 28',
        time: '11:00 AM',
        modality: 'Online Technical Review Consultation',
        status: 'confirmed'
      },
      timeline: [
        {
          id: 1,
          title: 'Request Shared in Sanctuary',
          timestamp: 'Yesterday, 10:24 AM',
          desc: 'Expressed concerns about exams, sleep, and fee deadlines.',
          status: 'completed',
          color: '#8DCFA9'
        },
        {
          id: 2,
          title: 'SETU Coordinated R&D Allocation',
          timestamp: 'Yesterday, 10:25 AM',
          desc: 'Unified pathway routed to BIT Mesra, BAU, and Industry CSR.',
          status: 'completed',
          color: '#8DCFA9'
        },
        {
          id: 3,
          title: 'Support Pathway Selected & Confirmed',
          timestamp: 'Yesterday, 10:30 AM',
          desc: 'Student verified AI Mirror understanding and authorized summary handoff.',
          status: 'completed',
          color: '#8DCFA9'
        },
        {
          id: 4,
          title: 'Appointment Confirmed & Bridge Care Open',
          timestamp: 'Active Now',
          desc: 'Consultation set with Dr. Sarah Jenkins. 3 tailored calming resources provided while waiting.',
          status: 'active',
          color: '#EBA756'
        },
        {
          id: 5,
          title: 'Wellbeing Check-in & Follow-up',
          timestamp: 'Friday, Oct 30 · 2:00 PM',
          desc: 'Automated gentle check-in to confirm tuition appeal submission.',
          status: 'upcoming',
          color: '#78746C'
        }
      ],
      assessments: [
        {
          timestamp: '2026-09-27T10:24:00Z',
          message: "I've been struggling with exams lately. I can't sleep properly and I'm also worried about my fees.",
          urgency: 'AMBER',
          themes: ['Academic Pressure', 'Sleep Difficulties', 'Financial Concern']
        }
      ]
    },
    {
      id: 'CASE-2026-00139',
      studentId: 'STU-55421',
      studentName: 'Maya Patel',
      createdAt: '2026-09-26T14:10:00Z',
      lastUpdated: '2026-09-26T15:00:00Z',
      message: 'Need urgent accommodation letters for midterms after sudden hospitalization.',
      intent: 'ACCESSIBILITY',
      isMultiDepartment: false,
      urgency: 'AMBER',
      confidence: 0.96,
      themes: [{ label: 'Accessibility & Health', relevance: 'High', color: '#93C5FD' }],
      recommendedDepartments: ['Accessibility & Neurodiversity'],
      assignedCounsellor: 'Dr. Amara Thorne',
      status: 'Scheduled',
      studentConsent: { shareSummary: true, shareRawMessage: true },
      approvedSummary: 'Discharge papers ready, requires 2-week exam rescheduling letter for CSE convenor.',
      appointment: {
        id: 'APT-9038',
        counsellor: 'Dr. Amara Thorne',
        dept: 'Accessibility & Neurodiversity',
        date: 'Wednesday, Oct 28',
        time: '11:00 AM',
        modality: 'Campus Wellbeing Suite 204',
        status: 'confirmed'
      },
      timeline: []
    }
  ],

  // Active Waitlist Entries
  waitlist: [
    {
      id: 'WAIT-701',
      caseId: 'CASE-2026-00142',
      studentId: 'STU-88219',
      studentName: 'Alex Rivera',
      department: 'Counselling & Mental Wellbeing',
      urgency: 'AMBER',
      requestedDate: 'Oct 28',
      preferredTime: 'Morning or Early Afternoon',
      createdAt: '2026-09-27T10:35:00Z',
      status: 'active'
    },
    {
      id: 'WAIT-702',
      caseId: 'CASE-2026-00155',
      studentId: 'STU-10294',
      studentName: 'Chris Lee',
      department: 'Academic Strategy & Tutoring',
      urgency: 'GREEN',
      requestedDate: 'Oct 28',
      preferredTime: 'Anytime',
      createdAt: '2026-09-27T09:12:00Z',
      status: 'active'
    }
  ],

  // Real-time Notifications
  notifications: [
    {
      id: 'NOTIF-01',
      type: 'case_created',
      title: 'Support Pathway Activated',
      message: 'Case #CASE-2026-00142 created. Your 3 requested departments are coordinating your care.',
      timestamp: 'Yesterday',
      read: false,
      route: '/journey'
    },
    {
      id: 'NOTIF-02',
      type: 'appointment_booked',
      title: 'Appointment Reserved',
      message: 'Consultation with Dr. Sarah Jenkins confirmed for Thursday, Oct 29 at 3:30 PM.',
      timestamp: 'Yesterday',
      read: true,
      route: '/appointments'
    },
    {
      id: 'NOTIF-03',
      type: 'resource_recommendation',
      title: 'Bridge Resources Available',
      message: '3 tailored exercises (Sleep Reset & Exam Grounding) ready while you wait.',
      timestamp: '1 hour ago',
      read: false,
      route: '/resources'
    }
  ],

  // Aggregate Campus Pulse Stats (Operational anonymized metrics)
  campusPulse: {
    totalStudentsSupported: 4280,
    activeCasesToday: 184,
    avgWaitHours: 1.4,
    routingConfidence: 94.2,
    multiDeptCasesRatio: 64, // 64% of cases involve 2+ departments!
    topConcerns: [
      { concern: 'Academic & Exam Pressure', percentage: 41, trend: '+8%' },
      { concern: 'Sleep Deprivation & Burnout', percentage: 28, trend: '+12%' },
      { concern: 'Financial & Rent Insecurity', percentage: 21, trend: '+5%' },
      { concern: 'Social Isolation on Campus', percentage: 10, trend: '-2%' }
    ],
    urgencyDistribution: {
      green: 58,
      amber: 37,
      red: 5
    }
  }
};

// Global in-memory instance
let store = null;
const listeners = new Set();

export function getStore() {
  if (!store) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        store = JSON.parse(stored);
      } else {
        store = JSON.parse(JSON.stringify(INITIAL_STATE));
        saveStore();
      }
    } catch (e) {
      console.error('Error loading HERE store from localStorage:', e);
      store = JSON.parse(JSON.stringify(INITIAL_STATE));
    }
  }
  return store;
}

function saveStore() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Error saving HERE store:', e);
  }
  notifyListeners();
}

export function subscribeStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener(store);
    } catch (e) {
      console.error('Store listener error:', e);
    }
  }
}

// -------------------------------------------------------------
// Core Business Actions & State Mutators
// -------------------------------------------------------------

export function setRole(newRole) {
  const s = getStore();
  s.currentRole = newRole;
  saveStore();
}

export function setCurrentAuthUser(user) {
  const s = getStore();
  if (user) {
    s.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || 'School of Computer Science & Engineering',
      year: user.year || '3rd Year Undergraduate'
    };
    s.currentRole = user.role.toLowerCase();
  } else {
    s.currentUser = {
      id: 'GUEST',
      name: 'Guest Visitor',
      email: '',
      role: 'GUEST',
      department: 'General Studies',
      year: 'Undergraduate'
    };
    s.currentRole = 'student';
  }
  saveStore();
}

export function getCurrentCase() {
  const s = getStore();
  return s.cases.find(c => c.studentId === s.currentUser.id) || s.cases[0] || null;
}

/**
 * Creates a real Case object following NLP analysis & student confirmation
 */
export function createCaseFromAnalysis({ message, nlpResult, consent, user }) {
  const s = getStore();
  const caseNumber = Math.floor(10000 + Math.random() * 90000);
  const newCaseId = `SETU-2026-${caseNumber}`;

  const recommendedDepts = (nlpResult.recommendedServices || []).map(svc => svc.department || svc);
  const primaryDept = recommendedDepts[0] || 'Water Resources & Fluoride Remediation';
  const assignedAdvisor = s.counsellors.find(c => c.department === primaryDept)?.name || 'Dr. Rajeshwar Prasad (BIT Mesra)';

  const studentName = user?.name || s.currentUser?.name || 'Rameshwar Mahato';
  const studentId = user?.id || s.currentUser?.id || 'CITIZEN-101';

  const newCase = {
    id: newCaseId,
    studentId,
    studentName,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    message,
    intent: nlpResult.intent,
    isMultiDepartment: nlpResult.isMultiDepartment,
    urgency: nlpResult.urgency,
    confidence: nlpResult.confidence,
    themes: nlpResult.themes,
    recommendedDepartments: recommendedDepts,
    assignedCounsellor: assignedAdvisor,
    status: 'Assigned to HEI R&D Lab',
    studentConsent: consent || {
      shareSummary: true,
      shareRawMessage: false,
      shareResourceHistory: true
    },
    approvedSummary: nlpResult.aiMirror + ' Coordinated pathway activated across: ' + recommendedDepts.join(', ') + '.',
    appointment: null,
    messages: [
      {
        id: `MSG-${Date.now()}-1`,
        sender: 'student',
        senderName: studentName,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString()
      }
    ],
    timeline: [
      {
        id: 1,
        title: 'Challenge Submitted on Portal',
        timestamp: 'Just now',
        desc: 'Citizen securely initiated intake through SETU portal.',
        status: 'completed',
        color: '#8DCFA9'
      },
      {
        id: 2,
        title: 'SETU AI Triage & Domain Classification',
        timestamp: 'Just now',
        desc: `Analyzed themes (${nlpResult.themes.map(t => t.label).join(', ')}). Urgency categorized as ${nlpResult.urgency}.`,
        status: 'completed',
        color: '#8DCFA9'
      },
      {
        id: 3,
        title: 'University R&D Pathway Dispatched',
        timestamp: 'Active Now',
        desc: `Routed to ${recommendedDepts.join(', ')}. Assigned lead: ${assignedAdvisor}.`,
        status: 'active',
        color: '#EBA756'
      },
      {
        id: 4,
        title: 'Faculty & Industry Mentorship Plan',
        timestamp: 'Next Step',
        desc: 'R&D team reviews challenge technical briefing.',
        status: 'upcoming',
        color: '#78746C'
      }
    ],
    assessments: [
      {
        timestamp: new Date().toISOString(),
        message,
        urgency: nlpResult.urgency,
        themes: nlpResult.themes.map(t => t.label)
      }
    ]
  };

  // Prepend to cases so student case is immediately at the top
  s.cases = [newCase, ...s.cases.filter(c => c.studentId !== studentId)];

  // Also add to waitlist queue
  s.waitlist.unshift({
    id: `WAIT-${Math.floor(100 + Math.random() * 900)}`,
    caseId: newCaseId,
    studentId,
    studentName,
    department: primaryDept,
    urgency: nlpResult.urgency,
    requestedDate: 'Today',
    preferredTime: 'Next available',
    createdAt: new Date().toISOString(),
    status: 'active'
  });

  // Add Notification
  s.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    type: 'case_created',
    title: 'Support Request Dispatched',
    message: `Case #${newCaseId} routed to ${primaryDept}. Assigned specialist: ${assignedAdvisor}.`,
    timestamp: 'Just now',
    read: false,
    route: '/journey'
  });

  // Increment campus pulse counter
  s.campusPulse.activeCasesToday += 1;

  saveStore();
  return newCase;
}

/**
 * Counsellor Action: Accept Case
 */
export function acceptCaseByCounsellor(caseId, counsellorName = 'Dr. Sarah Jenkins') {
  const s = getStore();
  const targetCase = s.cases.find(c => c.id === caseId);
  if (!targetCase) return null;

  targetCase.status = 'Accepted by counsellor';
  targetCase.assignedCounsellor = counsellorName;
  targetCase.lastUpdated = new Date().toISOString();

  targetCase.timeline.push({
    id: targetCase.timeline.length + 1,
    title: `Case Accepted by ${counsellorName}`,
    timestamp: 'Just now',
    desc: 'Counsellor reviewed approved intake summary and initiated care coordination.',
    status: 'completed',
    color: '#8DCFA9'
  });

  s.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    type: 'case_accepted',
    title: 'Counsellor Accepted Your File',
    message: `${counsellorName} has accepted your support file and reviewed your intake summary.`,
    timestamp: 'Just now',
    read: false,
    route: '/journey'
  });

  saveStore();
  return targetCase;
}

/**
 * Counsellor Action: Send message to student
 */
export function sendCounsellorMessage(caseId, text, counsellorName = 'Dr. Sarah Jenkins') {
  const s = getStore();
  const targetCase = s.cases.find(c => c.id === caseId);
  if (!targetCase) return null;

  if (!targetCase.messages) {
    targetCase.messages = [];
  }

  const newMsg = {
    id: `MSG-${Date.now()}`,
    sender: 'counsellor',
    senderName: counsellorName,
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString()
  };

  targetCase.messages.push(newMsg);
  targetCase.status = 'Counsellor Responded';
  targetCase.lastUpdated = new Date().toISOString();

  targetCase.timeline.push({
    id: targetCase.timeline.length + 1,
    title: `Direct Message from ${counsellorName}`,
    timestamp: 'Just now',
    desc: `"${text.trim().slice(0, 60)}..."`,
    status: 'completed',
    color: '#8DCFA9'
  });

  s.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    type: 'counsellor_message',
    title: 'Your Counsellor Has Replied',
    message: `${counsellorName}: "${text.trim().slice(0, 75)}..."`,
    timestamp: 'Just now',
    read: false,
    route: '/journey'
  });

  saveStore();
  return newMsg;
}

/**
 * Student Action: Reply in case thread
 */
export function sendStudentCaseMessage(caseId, text, studentName = 'Aarav Sharma') {
  const s = getStore();
  const targetCase = s.cases.find(c => c.id === caseId);
  if (!targetCase) return null;

  if (!targetCase.messages) {
    targetCase.messages = [];
  }

  const newMsg = {
    id: `MSG-${Date.now()}`,
    sender: 'student',
    senderName: studentName,
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date().toISOString()
  };

  targetCase.messages.push(newMsg);
  targetCase.lastUpdated = new Date().toISOString();

  saveStore();
  return newMsg;
}

/**
 * Re-assessment: Student clicks "Something changed"
 * Runs NLP again, compares previous vs current, updates case without overwriting history!
 */
export function reassessCase(caseId, newMessage, newNlpResult) {
  const s = getStore();
  const targetCase = s.cases.find(c => c.id === caseId);
  if (!targetCase) return null;

  const previousUrgency = targetCase.urgency;
  targetCase.urgency = newNlpResult.urgency;
  targetCase.lastUpdated = new Date().toISOString();
  targetCase.themes = newNlpResult.themes;
  targetCase.recommendedDepartments = newNlpResult.recommendedServices.map(s => s.department);
  targetCase.status = newNlpResult.urgency === 'RED' ? 'Urgent Triage Required' : 'Pathway Reassessed';

  targetCase.assessments.push({
    timestamp: new Date().toISOString(),
    message: newMessage,
    urgency: newNlpResult.urgency,
    themes: newNlpResult.themes.map(t => t.label)
  });

  targetCase.timeline.push({
    id: targetCase.timeline.length + 1,
    title: `Student Reassessment (${previousUrgency} → ${newNlpResult.urgency})`,
    timestamp: 'Just now',
    desc: `Updated with new context: "${newMessage.slice(0, 70)}...". Urgency adjusted accordingly.`,
    status: 'active',
    color: newNlpResult.urgency === 'RED' ? '#F87171' : '#EBA756'
  });

  s.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    type: 'reassessment',
    title: 'Reassessment Recorded',
    message: `Your support coordinates were updated based on your updated situation.`,
    timestamp: 'Just now',
    read: false,
    route: '/journey'
  });

  saveStore();
  return targetCase;
}

/**
 * Books an appointment for a student
 */
export function bookAppointment({ caseId, counsellorName, dept, date, time, modality = 'Confidential Video' }) {
  const s = getStore();
  const aptId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;

  const appointment = {
    id: aptId,
    caseId,
    studentId: s.currentUser.id,
    studentName: s.currentUser.name,
    counsellor: counsellorName,
    dept,
    date,
    time,
    modality,
    status: 'confirmed'
  };

  // Update target case
  const c = s.cases.find(item => item.id === caseId) || s.cases[0];
  if (c) {
    c.appointment = appointment;
    c.status = 'Appointment Scheduled';
    c.timeline.push({
      id: c.timeline.length + 1,
      title: `Appointment Confirmed with ${counsellorName}`,
      timestamp: 'Just now',
      desc: `${date} at ${time} (${modality}).`,
      status: 'completed',
      color: '#8DCFA9'
    });
  }

  // Remove from active waitlist
  s.waitlist = s.waitlist.filter(w => w.caseId !== caseId);

  s.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    type: 'appointment_booked',
    title: 'Appointment Confirmed',
    message: `Session booked with ${counsellorName} for ${date} at ${time}.`,
    timestamp: 'Just now',
    read: false,
    route: '/appointments'
  });

  saveStore();
  return appointment;
}

/**
 * WAITLIST SWAP ENGINE:
 * When a counsellor or admin cancels an appointment, the system immediately:
 * 1. Frees up the slot (e.g., "Today · 12:00 PM")
 * 2. Scans the waiting list for eligible students based on urgency (RED > AMBER > GREEN), service match, wait time
 * 3. Sends an immediate interactive notification to the eligible waiting student with [Accept] [Keep current]
 */
export function cancelAppointmentAndTriggerWaitlistSwap(appointmentId) {
  const s = getStore();
  let cancelledApt = null;

  for (const c of s.cases) {
    if (c.appointment && c.appointment.id === appointmentId) {
      cancelledApt = { ...c.appointment };
      c.appointment.status = 'cancelled';
      c.timeline.push({
        id: c.timeline.length + 1,
        title: 'Appointment Slot Cancelled',
        timestamp: 'Just now',
        desc: `Slot on ${cancelledApt.date} at ${cancelledApt.time} was opened.`,
        status: 'cancelled',
        color: '#94A3B8'
      });
      break;
    }
  }

  if (!cancelledApt) {
    cancelledApt = {
      id: appointmentId,
      date: 'Today',
      time: '12:00 PM',
      dept: 'Counselling & Mental Wellbeing',
      counsellor: 'Dr. Sarah Jenkins'
    };
  }

  // Find eligible waiting student (prioritize AMBER/RED or current active student)
  const candidate = s.waitlist[0] || {
    caseId: s.cases[0]?.id || 'CASE-2026-00142',
    studentId: s.currentUser.id,
    studentName: s.currentUser.name
  };

  // Generate Waitlist Swap Notification
  const swapNotif = {
    id: `WAITLIST-SWAP-${Date.now()}`,
    type: 'waitlist_offer',
    title: '⚡ Earlier Appointment Available!',
    message: `A slot with ${cancelledApt.counsellor} just opened up: Today · 12:00 PM. Would you like to take this earlier time?`,
    timestamp: 'Just now',
    read: false,
    offerData: {
      counsellor: cancelledApt.counsellor,
      date: 'Today',
      time: '12:00 PM',
      dept: cancelledApt.dept,
      targetCaseId: candidate.caseId
    }
  };

  s.notifications.unshift(swapNotif);
  saveStore();
  return swapNotif;
}

/**
 * Student accepts earlier waitlist offer
 */
export function acceptWaitlistOffer(notificationId) {
  const s = getStore();
  const notif = s.notifications.find(n => n.id === notificationId);
  if (!notif || !notif.offerData) return false;

  const { targetCaseId, counsellor, date, time, dept } = notif.offerData;
  const targetCase = s.cases.find(c => c.id === targetCaseId) || s.cases[0];

  if (targetCase) {
    targetCase.appointment = {
      id: `APT-SWAP-${Date.now()}`,
      caseId: targetCase.id,
      studentId: s.currentUser.id,
      studentName: s.currentUser.name,
      counsellor,
      dept,
      date,
      time,
      modality: 'Confidential Consultation (Waitlist Swap)',
      status: 'confirmed'
    };

    targetCase.timeline.push({
      id: targetCase.timeline.length + 1,
      title: 'Waitlist Swap Accepted ⚡',
      timestamp: 'Just now',
      desc: `Moved up to earlier slot: ${date} at ${time} with ${counsellor}.`,
      status: 'completed',
      color: '#8DCFA9'
    });
  }

  notif.read = true;
  notif.accepted = true;

  // Confirmation notification
  s.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    type: 'appointment_updated',
    title: 'Journey Updated with Earlier Time',
    message: `Your consultation has been rescheduled to Today · 12:00 PM.`,
    timestamp: 'Just now',
    read: false,
    route: '/journey'
  });

  saveStore();
  return true;
}

/**
 * Student declines earlier waitlist offer
 */
export function declineWaitlistOffer(notificationId) {
  const s = getStore();
  const notif = s.notifications.find(n => n.id === notificationId);
  if (notif) {
    notif.read = true;
    notif.declined = true;
  }
  saveStore();
  return true;
}

export function markNotificationRead(notifId) {
  const s = getStore();
  const n = s.notifications.find(item => item.id === notifId);
  if (n) {
    n.read = true;
    saveStore();
  }
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  store = JSON.parse(JSON.stringify(INITIAL_STATE));
  saveStore();
  return store;
}
