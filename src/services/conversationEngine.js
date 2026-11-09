// SETU Conversational AI Intake Engine
// Multi-turn context extraction, continuous safety, adaptive questioning, AI mirror, and university routing

import { evaluateSafetyLayer } from './nlpService.js';
import { createCaseFromAnalysis, bookAppointment, getStore } from './store.js';
import { getCurrentUser } from './authService.js';
import { apiCreateChallenge } from './apiClient.js';

const CONV_STORAGE_KEY = 'SETU_CONVERSATION_STATE_V1';

/**
 * Canonical Conversation Stages
 */
export const STAGES = {
  OPEN: 'OPEN',                     // Stage 1: "What's been going on?"
  UNDERSTAND: 'UNDERSTAND',         // Stage 2: Identify context (vague -> specific)
  CLARIFY: 'CLARIFY',               // Stage 3: Clarify specific friction & pain points
  ASSESS_IMPACT: 'ASSESS_IMPACT',   // Stage 4: Assess impact on sleep, routine, daily life
  ASSESS_URGENCY: 'ASSESS_URGENCY', // Stage 5: Assess duration and severity
  SUMMARIZE: 'SUMMARIZE',           // Stage 6: Generate internal structured summary
  CONFIRM: 'CONFIRM',               // Stage 7: AI Mirror - ask student to confirm/correct
  RECOMMEND: 'RECOMMEND',           // Stage 8: Recommend relevant support pathways
  CONNECT: 'CONNECT',               // Stage 9: Route to appropriate department/counsellor
  SCHEDULE: 'SCHEDULE',             // Stage 10: Natural conversational appointment scheduling
  JOURNEY: 'JOURNEY',               // Stage 11: Track through My Journey
  FOLLOW_UP: 'FOLLOW_UP'            // Stage 12: Ongoing care
};

/**
 * Available appointment slots for conversational booking
 */
export const AVAILABLE_SLOTS = [
  { id: 'SLOT-1', day: 'Today', period: 'afternoon', time: '4:30 PM', modality: 'Online Innovation Consultation', counsellor: 'Dr. Rajeshwar Prasad (BIT Mesra)', dept: 'Water Resources R&D Lab' },
  { id: 'SLOT-2', day: 'Tomorrow', period: 'morning', time: '11:00 AM', modality: 'BAU Kanke Incubation Suite (In-Person)', counsellor: 'Dr. Swati Soren (BAU Kanke)', dept: 'Agri-Tech & Soil Testing Center' },
  { id: 'SLOT-3', day: 'Tomorrow', period: 'afternoon', time: '12:30 PM', modality: 'Online Innovation Consultation', counsellor: 'Amitabh Choudhury (Tata Steel CSR)', dept: 'CSR Review & Pilot Funding' },
  { id: 'SLOT-4', day: 'Tomorrow', period: 'afternoon', time: '3:30 PM', modality: 'BIT STEP Incubation Lab or Video', counsellor: 'Dr. Rajeshwar Prasad (BIT Mesra)', dept: 'Water Resources R&D Lab' },
  { id: 'SLOT-5', day: 'Thursday', period: 'morning', time: '10:00 AM', modality: 'State Nodal IP Office', counsellor: 'Dr. Subhashish Roy, IAS', dept: 'State Incubation & IP Desk' }
];

/**
 * Creates initial conversation state
 */
export function createInitialConversationState(user = null) {
  let currentUser = user;
  if (!currentUser && typeof getCurrentUser === 'function') {
    try {
      currentUser = getCurrentUser();
    } catch (e) {
      // fallback
    }
  }
  if (!currentUser) {
    currentUser = { id: 'CITIZEN-101', name: 'Rameshwar Mahato' };
  }
  
  return {
    conversationId: `CONV-${Date.now()}`,
    studentId: currentUser.id,
    studentName: currentUser.name,
    stage: STAGES.OPEN,
    currentStage: STAGES.OPEN,
    engineMode: 'DEMO FALLBACK MODE',
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: "Johar & Namaste. Welcome to SETU — Jharkhand's Societal Innovation Portal.\n\nPlease describe the challenge in your village or district (e.g., water quality, crop loss, solar energy, sanitation, healthcare access). You can also attach photos, audio, or location map coordinates.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: STAGES.OPEN
      }
    ],
    intent: null,
    detectedIntent: null,
    themes: [],
    detectedThemes: [],
    entities: {
      sourceOfPressure: null,
      specificFriction: null,
      duration: null,
      sleep: null,
      finances: null,
      family: null
    },
    context: {
      sourceOfPressure: null,
      specificFriction: null,
      sleepImpact: null,
      routineImpact: null
    },
    duration: null,
    impact: {
      academics: null,
      sleep: null,
      routine: null,
      social: null,
      emotional: null
    },
    urgency: 'GREEN',
    confidence: 0.0,
    supportPreference: null,
    missingInformation: ['sourceOfPressure'],
    knownInformation: {
      hasAcademicConcern: false,
      hasConcentrationIssue: false,
      hasSleepIssue: false,
      hasFinancialIssue: false,
      hasFamilyPressure: false,
      hasSocialIsolation: false,
      duration: null,
      supportPreference: null,
      impactOutsideAcademics: null
    },
    provisionalSummary: '',
    confirmedSummary: null,
    summary: '',
    aiMirrorPoints: [],
    recommendedServices: [],
    selectedDepartments: [],
    appointmentPreferences: {
      preferredDay: null,
      preferredPeriod: null,
      selectedSlot: null
    },
    appointmentBooked: null,
    createdCaseId: null,
    handoffComplete: false,
    meaningfulTurns: 0
  };
}

export function getConversationState() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(CONV_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {
    console.error('Error reading conversation state:', e);
  }

  const initial = createInitialConversationState();
  saveConversationState(initial);
  return initial;
}

export function saveConversationState(state) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    console.error('Error saving conversation state:', e);
  }
}

export function resetConversation() {
  const initial = createInitialConversationState();
  saveConversationState(initial);
  return initial;
}

// -------------------------------------------------------------
// PROCESS CONVERSATION ENGINE (Sections 4, 5, 8, 9, 10, 11)
// -------------------------------------------------------------

export async function processConversation(message, conversationState) {
  await new Promise(resolve => setTimeout(resolve, 280));

  const text = message.trim();
  const lower = text.toLowerCase();

  // 1. Continuous Safety Check (Section 11)
  const safetyEval = evaluateSafetyLayer(text);
  if (safetyEval.isSafetyCrisis) {
    return handleSafetyCrisis(safetyEval, conversationState, text);
  }

  // 2. Section 28: Reassessment Detection ("Something has changed")
  if (/\b(something has changed|things changed|situation changed|update my case|changed since)\b/i.test(lower)) {
    return handleReassessment(conversationState);
  }

  // 2b. Direct Appointment Request Detection ("i wanna book an appointment", "book appointment", etc.)
  // Chatting is OPTIONAL: When student explicitly requests booking, never force them through discovery!
  if (isExplicitAppointmentRequest(lower)) {
    return handleDirectAppointmentRequest(conversationState);
  }

  // 3. Section 18 & 19: Conversational Scheduling (Active when in STAGES.SCHEDULE)
  if (conversationState.currentStage === STAGES.SCHEDULE) {
    const schedulingMatch = handleSchedulingInteraction(lower, conversationState);
    if (schedulingMatch) return schedulingMatch;
  }

  // 4. Pure Greetings (Never assume issues, never show support options)
  if (isGreeting(lower) && conversationState.meaningfulTurns === 0 && !hasSubstantiveConcern(lower)) {
    return {
      reply: "Hey. I'm here.\n\nWhat's been going on?",
      stage: STAGES.OPEN,
      intent: null,
      themes: [],
      urgency: 'GREEN',
      knownInformation: conversationState.knownInformation,
      missingInformation: ['sourceOfPressure'],
      options: null, // Let student speak freely
      nextAction: null,
      progress: "Listening to what's on your mind...",
      engineMode: 'DEMO FALLBACK MODE'
    };
  }

  // 5. Execute Deep Contextual Conversation Understanding
  return executeContextualDialogue(text, conversationState);
}

function isGreeting(text) {
  const clean = text.trim().replace(/[.,!?;:]/g, '').toLowerCase();
  return /^(hi|hey|hello|hey hi|hi there|hey there|good morning|good afternoon|good evening|yo|hola|greetings)$/i.test(clean);
}

function hasSubstantiveConcern(text) {
  return /\b(exam|exams|assignment|assignments|study|studying|fail|failing|concentrat|sleep|sleeping|tired|exhausted|overwhelm|pressure|struggl|money|rent|fees|tuition|anxious|anxiety|stress|lonely|alone|dorm|parents|deadline|class)\b/i.test(text);
}
export function isExplicitAppointmentRequest(text) {
  const clean = text.toLowerCase().trim();
  return /\b(book an appointment|book appointment|schedule appointment|schedule an appointment|wanna book an appointment|want to book an appointment|wanna book|want to book|need an appointment|make an appointment|book a session|schedule a session|book a slot|schedule a slot|book slot|how to book|how do i book|appointment please|meet someone|see a counsellor|see a counselor|consultation appointment|book consultation|book direct|direct booking|reserve a slot|schedule a consultation|book now)\b/i.test(clean) ||
    /^(appointment|book|schedule|appointments)$/i.test(clean);
}

export function handleDirectAppointmentRequest(state) {
  return {
    reply: "Absolutely. Chatting is completely optional—you don't have to explain anything if you prefer not to.\n\nHere are the earliest available confidential sessions you can reserve right now. Click any time below to book directly:",
    stage: STAGES.SCHEDULE,
    intent: state.detectedIntent || 'counselling_wellbeing',
    themes: state.detectedThemes?.length > 0 ? state.detectedThemes : [{ label: 'Direct Consultation', relevance: 'Immediate', color: '#EBA756' }],
    urgency: state.urgency || 'GREEN',
    knownInformation: state.knownInformation,
    missingInformation: [],
    options: [
      "Tomorrow at 11:00 AM (In-Person Suite 204)",
      "Tomorrow at 12:30 PM (Video)",
      "Tomorrow at 3:30 PM (Suite 204 or Video)",
      "Open Full Calendar Directory →"
    ],
    nextAction: 'DIRECT_SCHEDULE_ACTIVE',
    progress: 'Selecting your preferred consultation time...'
  };
}

function handleReassessment(state) {
  const prevSummary = state.confirmedSummary || state.provisionalSummary || "you were feeling pressure with your courses and sleep";
  return {
    reply: `Last time you told me:\n"${prevSummary}"\n\nWhat's changed since then?`,
    stage: STAGES.CLARIFY,
    intent: state.detectedIntent,
    themes: state.detectedThemes,
    urgency: state.urgency,
    knownInformation: state.knownInformation,
    missingInformation: ['recentChanges'],
    options: ["My workload increased", "My sleep got worse", "I feel a bit better", "Something new came up"],
    nextAction: 'REASSESSMENT_ACTIVE',
    progress: 'Updating your support file...'
  };
}

function handleSchedulingInteraction(lower, state) {
  // If student asks for tomorrow afternoon or tomorrow
  if (/\b(tomorrow afternoon|tomorrow|afternoon)\b/i.test(lower)) {
    const slots = AVAILABLE_SLOTS.filter(s => s.day === 'Tomorrow' && s.period === 'afternoon');
    return {
      reply: `I found ${slots.length} options tomorrow afternoon:\n\n• 12:30 PM (Confidential Video Consultation)\n• 3:30 PM (Sanctuary Suite 204 or Video)\n\nWhich of these would you prefer?`,
      stage: STAGES.SCHEDULE,
      intent: state.detectedIntent,
      themes: state.detectedThemes,
      urgency: state.urgency,
      knownInformation: state.knownInformation,
      missingInformation: ['selectedTime'],
      options: ["Tomorrow at 12:30 PM", "Tomorrow at 3:30 PM", "Show all slots"],
      nextAction: 'FILTER_SLOTS_AFTERNOON',
      progress: 'Found available consultation times...'
    };
  }

  // If student selects 3:30 or 3:30 PM
  if (/\b(3:30|3:30 pm|330|3:30pm)\b/i.test(lower)) {
    const slot = AVAILABLE_SLOTS.find(s => s.id === 'SLOT-4') || AVAILABLE_SLOTS[3];
    const bookingResult = bookConversationalAppointment(slot.id);
    return {
      reply: `Consultation confirmed.\n\nYou will connect with ${slot.counsellor} (${slot.dept}) on ${slot.day} at ${slot.time}.\n\nYour challenge brief has been securely routed to the university innovation desk.`,
      stage: STAGES.JOURNEY,
      intent: state.detectedIntent,
      themes: state.detectedThemes,
      urgency: state.urgency,
      knownInformation: state.knownInformation,
      missingInformation: [],
      options: null,
      nextAction: 'HANDOFF_COMPLETED',
      handoff: {
        caseId: bookingResult.caseId,
        specialist: slot.counsellor,
        department: slot.dept,
        time: `${slot.day} at ${slot.time}`
      },
      progress: 'R&D consultation scheduled'
    };
  }

  // If student selects 12:30 or 12:30 PM
  if (/\b(12:30|12:30 pm|1230|12:30pm)\b/i.test(lower)) {
    const slot = AVAILABLE_SLOTS.find(s => s.id === 'SLOT-3') || AVAILABLE_SLOTS[2];
    const bookingResult = bookConversationalAppointment(slot.id);
    return {
      reply: `Consultation confirmed.\n\nYou will connect with ${slot.counsellor} (${slot.dept}) on ${slot.day} at ${slot.time}.\n\nYour challenge brief has been securely routed to the university innovation desk.`,
      stage: STAGES.JOURNEY,
      intent: state.detectedIntent,
      themes: state.detectedThemes,
      urgency: state.urgency,
      knownInformation: state.knownInformation,
      missingInformation: [],
      options: null,
      nextAction: 'HANDOFF_COMPLETED',
      handoff: {
        caseId: bookingResult.caseId,
        specialist: slot.counsellor,
        department: slot.dept,
        time: `${slot.day} at ${slot.time}`
      },
      progress: 'R&D consultation scheduled'
    };
  }

  // If student says "yes" to "Would you like me to help you find someone to talk to?"
  if (/\b(yes|yeah|sure|yep|find someone|help me find|book|show times)\b/i.test(lower)) {
    return {
      reply: "I found three available support options for Counselling & Wellbeing.\n\nWould you prefer today or sometime tomorrow?",
      stage: STAGES.SCHEDULE,
      intent: state.detectedIntent,
      themes: state.detectedThemes,
      urgency: state.urgency,
      knownInformation: state.knownInformation,
      missingInformation: ['preferredDay'],
      options: ["Today", "Tomorrow afternoon", "All available times"],
      nextAction: 'PROMPT_APPOINTMENT_DAY',
      progress: 'Checking live calendar availability...'
    };
  }

  return null;
}

/**
 * CONTEXTUAL DIALOGUE ENGINE
 * Progression:
 * message -> understand -> clarify -> assess impact -> assess duration -> summarize -> confirm -> recommend -> connect -> schedule
 */
function executeContextualDialogue(currentText, state) {
  const lower = currentText.toLowerCase();
  const fullConversation = [...state.messages.map(m => m.text), currentText].join(' ').toLowerCase();

  // 1. Extract context updates from the message and conversation history
  const ctx = { ...state.context };
  const known = { ...state.knownInformation };
  const entities = { ...state.entities };
  const themes = [...state.detectedThemes];

  // A. Detect Academic Source
  if (/\b(exam|exams|assignment|assignments|finals|midterm|midterms|coursework|classes|deadlines|academic|studying|study)\b/i.test(fullConversation)) {
    known.hasAcademicConcern = true;
    ctx.sourceOfPressure = 'Exams and assignments';
    entities.sourceOfPressure = 'Exams and assignments';
    upsertTheme(themes, { name: 'academic_pressure', label: 'Academic pressure', confidence: 0.94 });
  }

  // B. Detect Concentration / Workload Friction
  if (/\b(concentrat|focus|can't focus|distract|can't keep up|struggling to keep up|keeping up with the work|behind on work|brain fog)\b/i.test(fullConversation)) {
    known.hasConcentrationIssue = true;
    ctx.specificFriction = 'Difficulty keeping up and concentrating';
    entities.specificFriction = 'Difficulty concentrating';
    upsertTheme(themes, { name: 'concentration_difficulty', label: 'Difficulty concentrating', confidence: 0.92 });
  }

  // C. Detect Sleep Impact
  if (/\b(barely sleep|barely been sleeping|can't sleep|insomnia|awake|sleep is ruined|haven't slept|not sleeping|sleep around 4 hours|4 hours)\b/i.test(fullConversation)) {
    known.hasSleepIssue = true;
    known.impactOutsideAcademics = true;
    ctx.sleepImpact = 'Barely sleeping';
    entities.sleep = 'Barely sleeping';
    upsertTheme(themes, { name: 'sleep_difficulty', label: 'Sleep difficulty', confidence: 0.90 });
  }

  // D. Detect Duration
  if (/\b(two weeks|2 weeks|couple weeks|couple of weeks)\b/i.test(fullConversation)) {
    known.duration = 'Approximately two weeks';
    entities.duration = 'About two weeks';
  } else if (/\b(month|months|several weeks|over a month)\b/i.test(fullConversation)) {
    known.duration = 'Over a month';
    entities.duration = 'Over a month';
  } else if (/\b(few days|recent|yesterday|this week|past few days)\b/i.test(fullConversation)) {
    known.duration = 'Past few days';
    entities.duration = 'Past few days';
  }

  // E. Detect Financial Pressure
  if (/\b(money|fees|rent|tuition|bursary|afford|broke|debt|financial)\b/i.test(fullConversation)) {
    known.hasFinancialIssue = true;
    ctx.sourceOfPressure = ctx.sourceOfPressure ? `${ctx.sourceOfPressure} & Finances` : 'Financial pressure';
    entities.finances = 'Rent and tuition costs';
    upsertTheme(themes, { name: 'financial_pressure', label: 'Financial pressure', confidence: 0.88 });
  }

  // F. Detect Family Pressure
  if (/\b(parent|parents|family|mom|dad|expectations|marks)\b/i.test(fullConversation)) {
    known.hasFamilyPressure = true;
    entities.family = 'Family expectations';
    upsertTheme(themes, { name: 'family_expectations', label: 'Family expectations', confidence: 0.84 });
  }

  // Determine evolving intent
  let intent = 'GENERAL_SUPPORT';
  if (known.hasAcademicConcern && known.hasSleepIssue) {
    intent = 'ACADEMIC_AND_WELLBEING';
  } else if (known.hasAcademicConcern && known.hasFinancialIssue) {
    intent = 'ACADEMIC_AND_FINANCIAL';
  } else if (known.hasAcademicConcern) {
    intent = 'ACADEMIC_SUPPORT';
  } else if (known.hasSleepIssue) {
    intent = 'MENTAL_WELLBEING';
  } else if (known.hasFinancialIssue) {
    intent = 'FINANCIAL_ASSISTANCE';
  }

  // Dynamic urgency (AMBER if academic pressure + sleep disruption + duration >= 2 weeks)
  let urgency = 'GREEN';
  if (known.hasAcademicConcern && known.hasSleepIssue && (known.duration?.includes('two weeks') || known.duration?.includes('month'))) {
    urgency = 'AMBER';
  } else if (known.hasAcademicConcern && known.hasSleepIssue) {
    urgency = 'AMBER';
  }

  const updatedState = {
    ...state,
    stage: state.stage,
    currentStage: state.currentStage,
    intent,
    detectedIntent: intent,
    themes,
    detectedThemes: themes,
    entities,
    context: ctx,
    knownInformation: known,
    urgency,
    meaningfulTurns: state.meaningfulTurns + 1
  };

  // Next question logic (Section 8, 9, 10)
  const decision = getNextBestQuestion(updatedState, currentText);

  // If ready for AI Mirror
  if (decision.stage === STAGES.CONFIRM) {
    const mirror = generateAIMirror(updatedState);
    return {
      reply: "Here's what I'm understanding so far.\n\nTake a look and tell me if I got that right.",
      stage: STAGES.CONFIRM,
      intent,
      themes,
      urgency,
      knownInformation: known,
      missingInformation: [],
      options: null,
      nextAction: 'SHOW_AI_MIRROR',
      aiMirrorPoints: mirror.bulletPoints,
      provisionalSummary: mirror.narrativeSummary,
      recommendedServices: mirror.recommendedDepartments,
      progress: 'Reflecting what you shared...',
      engineMode: 'DEMO FALLBACK MODE'
    };
  }

  return {
    reply: decision.reply,
    stage: decision.stage,
    intent,
    themes,
    urgency,
    knownInformation: known,
    missingInformation: decision.missingInformation || [],
    options: decision.options,
    nextAction: decision.nextAction,
    progress: getProgressForStage(decision.stage),
    engineMode: 'DEMO FALLBACK MODE'
  };
}

function upsertTheme(themes, newTheme) {
  const existing = themes.find(t => t.name === newTheme.name);
  if (existing) {
    if (newTheme.confidence > existing.confidence) existing.confidence = newTheme.confidence;
  } else {
    themes.push(newTheme);
  }
}

/**
 * Question Selection Logic
 * NEVER recommends support during the understanding phase.
 * Clarifies step-by-step:
 * Vague statement -> Ask source of pressure
 * Source of pressure -> Ask specific friction
 * Friction -> Ask impact on sleep / routine
 * Impact -> Ask duration
 * All known -> AI Mirror
 */
export function getNextBestQuestion(state, latestStudentMessage = '') {
  const lower = latestStudentMessage.toLowerCase();
  const known = state.knownInformation;
  const ctx = state.context;

  // STOP CONDITION: If we know source of pressure + friction + sleep impact + duration
  // OR if student has shared rich multi-factor context and turns >= 3
  const hasCompleteContext = (
    known.hasAcademicConcern &&
    known.hasConcentrationIssue &&
    known.hasSleepIssue &&
    Boolean(known.duration)
  );

  if (hasCompleteContext || (state.meaningfulTurns >= 5 && known.hasAcademicConcern && known.hasSleepIssue)) {
    return {
      stage: STAGES.CONFIRM,
      reply: "Here's what I'm understanding so far.",
      options: null,
      nextAction: 'SHOW_AI_MIRROR'
    };
  }

  // 1. VAGUE STATEMENTS OF PRESSURE / SUFFERING / OVERWHELM (Example 2)
  // "I am suffering from pressure", "I'm under pressure", "I feel overwhelmed"
  const isVaguePressure = /\b(pressure|suffering from pressure|under pressure|feeling pressure|overwhelmed|struggling|too much|stress|stressed)\b/i.test(lower);
  if (isVaguePressure && !ctx.sourceOfPressure && !known.hasAcademicConcern && !known.hasFinancialIssue) {
    // Check if student specifically says "everything is too much"
    if (/\b(everything feels like too much|everything is too much|don't know where to start)\b/i.test(lower)) {
      return {
        stage: STAGES.UNDERSTAND,
        reply: "You don't have to explain everything at once.\n\nIf you had to point to one thing that's been hardest lately, what would it be?",
        options: [
          "Exams and assignments",
          "Feeling constantly exhausted",
          "Personal or family stuff",
          "Something else"
        ],
        nextAction: 'UNPACK_OVERWHELM',
        missingInformation: ['sourceOfPressure']
      };
    }

    return {
      stage: STAGES.UNDERSTAND,
      reply: "I hear you.\n\nWhen you say pressure, what's been weighing on you most lately?",
      options: [
        "Exams and assignments",
        "Something personal",
        "Financial pressure",
        "Something else"
      ],
      nextAction: 'CLARIFY_PRESSURE_SOURCE',
      missingInformation: ['sourceOfPressure']
    };
  }

  // 2. FEAR OF FAILING
  if (/\b(worried about failing|fear of failing|failing my exams|going to fail|afraid i'll fail)\b/i.test(lower)) {
    return {
      stage: STAGES.CLARIFY,
      reply: "Is the fear mostly about the amount of work left, or are you worried even when you feel prepared?",
      options: [
        "The amount of work left",
        "Even when I study I feel unprepared",
        "The exams are very hard"
      ],
      nextAction: 'CLARIFY_FAILING_FEAR',
      missingInformation: ['specificFriction']
    };
  }

  // 3. SOURCE KNOWN (Exams / Coursework) BUT FRICTION UNKNOWN (Example 3)
  if (known.hasAcademicConcern && !known.hasConcentrationIssue && !known.hasSleepIssue && !known.duration) {
    return {
      stage: STAGES.CLARIFY,
      reply: "Got it. Is it mainly the amount of work, the pressure to perform, or feeling like you're struggling to keep up?",
      options: [
        "I can't keep up and I can't concentrate",
        "The amount of work",
        "The pressure to perform",
        "Something else"
      ],
      nextAction: 'CLARIFY_ACADEMIC_FRICTION',
      missingInformation: ['specificFriction']
    };
  }

  // 4. FRICTION KNOWN (Concentration / Keeping Up) BUT IMPACT UNKNOWN (Example 4)
  if (known.hasConcentrationIssue && !known.hasSleepIssue && !known.duration) {
    return {
      stage: STAGES.ASSESS_IMPACT,
      reply: "That sounds difficult.\n\nHas it been affecting your sleep or your routine outside studying too?",
      options: [
        "Yeah, I've barely been sleeping",
        "My sleep is okay",
        "It's affecting my whole routine"
      ],
      nextAction: 'ASSESS_SLEEP_IMPACT',
      missingInformation: ['sleepImpact', 'duration']
    };
  }

  // 5. SLEEP IMPACT KNOWN BUT DURATION UNKNOWN (Example 5)
  if (known.hasSleepIssue && !known.duration) {
    return {
      stage: STAGES.ASSESS_URGENCY,
      reply: "How long has that been happening?",
      options: [
        "About two weeks",
        "Just the past few days",
        "Over a month now"
      ],
      nextAction: 'ASSESS_DURATION',
      missingInformation: ['duration']
    };
  }

  // 6. DURATION KNOWN BUT SLEEP NOT YET CHECKED
  if (known.duration && !known.hasSleepIssue && known.hasAcademicConcern) {
    return {
      stage: STAGES.ASSESS_IMPACT,
      reply: "Thanks for telling me. Has it been affecting your sleep or energy too?",
      options: [
        "Yeah, I've barely been sleeping",
        "My sleep is okay",
        "I feel constantly exhausted"
      ],
      nextAction: 'ASSESS_SLEEP_IMPACT',
      missingInformation: ['sleepImpact']
    };
  }

  // 7. FAMILY PRESSURE
  if (known.hasFamilyPressure && !known.duration) {
    return {
      stage: STAGES.CLARIFY,
      reply: "That sounds like there's pressure outside your coursework too. Is that something that's weighing on you a lot right now?",
      options: [
        "Yeah, it's adding a lot of stress",
        "It's mostly the coursework itself",
        "Both together"
      ],
      nextAction: 'CLARIFY_FAMILY_PRESSURE',
      missingInformation: ['familySeverity']
    };
  }

  // 8. FINANCIAL PRESSURE
  if (known.hasFinancialIssue && !known.duration) {
    return {
      stage: STAGES.CLARIFY,
      reply: "Financial stress makes focusing on classes ten times harder.\n\nIs the immediate worry with housing rent, tuition fee deadlines, or daily expenses?",
      options: [
        "Tuition fee deadline",
        "Rent and housing",
        "Daily living expenses"
      ],
      nextAction: 'CLARIFY_FINANCIAL_TYPE',
      missingInformation: ['financialType']
    };
  }

  // 9. GENERAL CONVERSATIONAL LISTENING (Never jump to support options!)
  return {
    stage: STAGES.UNDERSTAND,
    reply: "I'm listening. Can you tell me a little more about what's been feeling hardest to manage?",
    options: null, // Let student type naturally
    nextAction: 'LISTEN_DEEPER',
    missingInformation: ['coreConcern']
  };
}

/**
 * Generate Structured AI Mirror (Section 12 & 13)
 */
function generateAIMirror(state) {
  const known = state.knownInformation;
  const bulletPoints = [];

  bulletPoints.push("You're feeling pressure from your academic workload and upcoming exams");

  if (known.hasConcentrationIssue) {
    bulletPoints.push("You're finding it difficult to concentrate and keep up with coursework");
  }
  if (known.hasSleepIssue) {
    const dur = known.duration ? `for ${known.duration.toLowerCase()}` : 'recently';
    bulletPoints.push(`It's beginning to affect your sleep (${dur})`);
  }
  if (known.hasFinancialIssue) {
    bulletPoints.push("Financial worries regarding rent and tuition are adding pressure");
  }
  if (known.hasFamilyPressure) {
    bulletPoints.push("Expectations from family are compounding the deadline stress");
  }

  const durationStr = known.duration ? `for ${known.duration.toLowerCase()}` : 'for around two weeks';
  const narrativeSummary = `You're feeling pressure from your academic workload, you're finding it difficult to concentrate, and it's beginning to affect your sleep. You've been dealing with this ${durationStr}.`;

  // Recommended Departments with Conversational Justifications (Section 15 & 16)
  const recommendedDepartments = [
    {
      id: 'counselling',
      department: 'Counselling & Mental Wellbeing',
      title: 'Counselling & Wellbeing',
      description: 'Support with stress, wellbeing and personal concerns.',
      reason: 'Because you’ve mentioned ongoing pressure and sleep difficulties.',
      lead: 'Dr. Sarah Jenkins',
      badge: 'Recommended'
    },
    {
      id: 'academic',
      department: 'Academic Support & Tutoring',
      title: 'Academic Support',
      description: 'Help with study pressure, workload and academic planning.',
      reason: 'Because the main source of pressure appears to be your upcoming exams.',
      lead: 'Marcus Vance',
      badge: 'Recommended'
    }
  ];

  if (known.hasFinancialIssue) {
    recommendedDepartments.push({
      id: 'financial',
      department: 'Financial Assistance & Emergency Grants',
      title: 'Financial Assistance',
      description: 'Emergency student grants, bursary assessments, and fee planning.',
      reason: 'Because you noted concerns about rent and tuition deadlines.',
      lead: 'Elena Rostova',
      badge: 'Recommended'
    });
  }

  return { bulletPoints, narrativeSummary, recommendedDepartments };
}

function handleSafetyCrisis(safetyEval, state, userText) {
  const crisisReply = "I'm really glad you told me.\n\nI want to take what you just said seriously.\n\nAre you in immediate danger of hurting yourself right now? You don't have to carry this alone. Immediate, confidential human support is available for you right now.";

  return {
    reply: crisisReply,
    stage: STAGES.SAFETY,
    intent: 'CRISIS_SUPPORT',
    themes: [{ name: 'crisis_support', label: 'Immediate Crisis Support', confidence: 0.99 }],
    urgency: 'RED',
    safetyAlert: safetyEval.safetyAlert,
    nextAction: 'SHOW_SAFETY_CRISIS',
    progress: 'Immediate Care Triage',
    engineMode: 'DEMO FALLBACK MODE'
  };
}

function getProgressForStage(stage) {
  switch (stage) {
    case STAGES.OPEN:
      return "Listening to what's on your mind...";
    case STAGES.UNDERSTAND:
      return "Listening and understanding your context...";
    case STAGES.CLARIFY:
      return "Clarifying what's been hardest for you...";
    case STAGES.ASSESS_IMPACT:
      return "Understanding how this is affecting your routine...";
    case STAGES.ASSESS_URGENCY:
      return "Assessing duration and impact...";
    case STAGES.CONFIRM:
      return "Reflecting what you've shared...";
    case STAGES.RECOMMEND:
      return "Formulating tailored support pathways...";
    case STAGES.SCHEDULE:
      return "Finding available consultation options...";
    case STAGES.CONNECT:
    case STAGES.JOURNEY:
      return "Connecting you with human support...";
    default:
      return "Understanding your context...";
  }
}

// -------------------------------------------------------------
// POST /api/chat Simulated Service Endpoint (Section 5)
// -------------------------------------------------------------

export async function postChatMessage({ conversationId, message }) {
  let state = getConversationState();
  if (!state || state.conversationId !== conversationId) {
    state = createInitialConversationState();
  }

  // 1. Continuous Zero-Delay Safety Layer Check
  const safetyEval = evaluateSafetyLayer(message);
  if (safetyEval.isSafetyCrisis) {
    const safetyResult = handleSafetyCrisis(safetyEval, state, message);
    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    state.messages.push(userMessage);

    const assistantMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: safetyResult.reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: safetyResult.stage,
      options: safetyResult.options,
      nextAction: safetyResult.nextAction,
      safetyAlert: safetyResult.safetyAlert
    };
    state.messages.push(assistantMessage);
    state.stage = STAGES.SAFETY;
    state.currentStage = STAGES.SAFETY;
    state.urgency = 'RED';

    saveConversationState(state);

    return {
      reply: safetyResult.reply,
      stage: safetyResult.stage,
      intent: safetyResult.intent,
      themes: safetyResult.themes,
      urgency: 'RED',
      nextAction: safetyResult.nextAction,
      options: safetyResult.options,
      safetyAlert: safetyResult.safetyAlert,
      progress: 'Immediate Care Triage',
      fullState: state
    };
  }

  // 2. Try Calling Backend API (/api/chat) for Real Gemini Generative AI + Python ML
  try {
    const { getApiBaseUrl } = await import('./apiConfig.js');
    const apiBase = getApiBaseUrl();
    if (!apiBase) {
      throw new Error('Deployed SETU server is not configured for this Android build.');
    }
    const response = await fetch(`${apiBase}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: state.conversationId, message })
    });

    if (response.ok) {
      const data = await response.json();

      const userMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      state.messages.push(userMessage);

      state.stage = data.stage || state.stage;
      state.currentStage = data.stage || state.currentStage;
      state.intent = data.intent || state.intent;
      state.detectedIntent = data.intent || state.detectedIntent;
      state.themes = data.themes || state.themes;
      state.detectedThemes = data.themes || state.detectedThemes;
      state.urgency = data.urgency || state.urgency;
      state.meaningfulTurns = (state.meaningfulTurns || 0) + 1;
      state.engineMode = data.engineMode || 'GEMINI_GENERATIVE_AI';

      if (data.aiMirrorPoints) state.aiMirrorPoints = data.aiMirrorPoints;
      if (data.provisionalSummary) {
        state.provisionalSummary = data.provisionalSummary;
        state.summary = data.provisionalSummary;
      }
      if (data.recommendedServices) state.recommendedServices = data.recommendedServices;

      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stage: data.stage,
        options: data.options,
        nextAction: data.nextAction,
        safetyAlert: data.safetyAlert
      };
      state.messages.push(assistantMessage);

      saveConversationState(state);

      return {
        reply: data.reply,
        stage: data.stage,
        intent: data.intent,
        themes: data.themes,
        urgency: data.urgency,
        nextAction: data.nextAction,
        options: data.options,
        safetyAlert: data.safetyAlert,
        aiMirrorPoints: state.aiMirrorPoints,
        provisionalSummary: state.provisionalSummary,
        recommendedServices: state.recommendedServices,
        progress: data.progress || "Understood what you're dealing with",
        fullState: state
      };
    }
  } catch (apiErr) {
    console.warn('[FRONTEND ENGINE] Backend /api/chat unreachable, falling back to local engine:', apiErr.message);
  }

  // 3. Graceful Local Fallback if API Server is Offline
  const userMessage = {
    id: `msg-${Date.now()}`,
    sender: 'user',
    text: message,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  state.messages.push(userMessage);

  const result = await processConversation(message, state);

  state.stage = result.stage;
  state.currentStage = result.stage;
  state.intent = result.intent;
  state.detectedIntent = result.intent;
  state.themes = result.themes || state.themes;
  state.detectedThemes = result.themes || state.detectedThemes;
  state.urgency = result.urgency;
  state.knownInformation = result.knownInformation || state.knownInformation;
  state.missingInformation = result.missingInformation || state.missingInformation;
  state.meaningfulTurns = (state.meaningfulTurns || 0) + 1;
  state.engineMode = result.engineMode || state.engineMode;

  if (result.aiMirrorPoints) state.aiMirrorPoints = result.aiMirrorPoints;
  if (result.provisionalSummary) {
    state.provisionalSummary = result.provisionalSummary;
    state.summary = result.provisionalSummary;
  }
  if (result.recommendedServices) state.recommendedServices = result.recommendedServices;

  const assistantMessage = {
    id: `msg-${Date.now() + 1}`,
    sender: 'assistant',
    text: result.reply,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stage: result.stage,
    options: result.options,
    nextAction: result.nextAction,
    safetyAlert: result.safetyAlert
  };
  state.messages.push(assistantMessage);

  saveConversationState(state);

  return {
    reply: result.reply,
    stage: result.stage,
    intent: result.intent,
    themes: result.themes,
    urgency: result.urgency,
    nextAction: result.nextAction,
    options: result.options,
    safetyAlert: result.safetyAlert,
    aiMirrorPoints: state.aiMirrorPoints,
    provisionalSummary: state.provisionalSummary,
    recommendedServices: state.recommendedServices,
    progress: result.progress,
    fullState: state
  };
}

// -------------------------------------------------------------
// AI MIRROR CONFIRMATION / CORRECTION (Section 13 & 14)
// -------------------------------------------------------------

export function confirmStudentMirror(confirmationType, customEdit = null) {
  const state = getConversationState();
  
  if (confirmationType === 'CONFIRMED') {
    state.stage = STAGES.RECOMMEND;
    state.currentStage = STAGES.RECOMMEND;
    state.confirmedSummary = customEdit || state.provisionalSummary;
    
    // Add bot message presenting recommended options
    const msg = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: "Based on what you've shared, there are a couple of support paths that could help.\n\nYou can choose one, or connect with both.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: STAGES.RECOMMEND
    };
    state.messages.push(msg);
  } else if (confirmationType === 'EDIT') {
    state.confirmedSummary = customEdit;
    state.stage = STAGES.RECOMMEND;
    state.currentStage = STAGES.RECOMMEND;
    
    const msg = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: "I've updated your summary with your adjustments. Here are the support teams ready to help:",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: STAGES.RECOMMEND
    };
    state.messages.push(msg);
  } else if (confirmationType === 'NOT_QUITE') {
    state.stage = STAGES.CLARIFY;
    state.currentStage = STAGES.CLARIFY;
    const msg = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: "What did I get wrong? Tell me in your own words, and I'll update my understanding.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: STAGES.CLARIFY
    };
    state.messages.push(msg);
  }

  saveConversationState(state);
  return state;
}

// -------------------------------------------------------------
// SELECT SUPPORT PATHWAYS & SCHEDULE (Section 15, 18, 19)
// -------------------------------------------------------------

export function selectSupportPathway(deptNames) {
  const state = getConversationState();
  state.selectedDepartments = Array.isArray(deptNames) ? deptNames : [deptNames];
  state.stage = STAGES.SCHEDULE;
  state.currentStage = STAGES.SCHEDULE;

  const primaryDept = state.selectedDepartments[0] || 'Counselling & Mental Wellbeing';

  const msg = {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: `Connecting with ${primaryDept} is a very strong first step.\n\nWould you like me to help you find someone to talk to?`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stage: STAGES.SCHEDULE,
    options: ['Yes, show available times', 'Explore resources first']
  };
  state.messages.push(msg);

  saveConversationState(state);
  return state;
}

export function filterAppointmentOptions(period = 'all') {
  if (period === 'today') {
    return AVAILABLE_SLOTS.filter(s => s.day === 'Today');
  } else if (period === 'tomorrow_afternoon') {
    return AVAILABLE_SLOTS.filter(s => s.day === 'Tomorrow' && s.period === 'afternoon');
  } else if (period === 'tomorrow') {
    return AVAILABLE_SLOTS.filter(s => s.day === 'Tomorrow');
  }
  return AVAILABLE_SLOTS;
}

/**
 * Books appointment directly in conversational flow and finalizes case (Section 19, 20, 24)
 */
export function bookConversationalAppointment(slotId) {
  const state = getConversationState();
  const slot = AVAILABLE_SLOTS.find(s => s.id === slotId) || AVAILABLE_SLOTS[3]; // default 3:30 PM tomorrow

  state.appointmentBooked = slot;
  state.stage = STAGES.CONNECT;
  state.currentStage = STAGES.CONNECT;

  // 1. Create real case in persistent shared store (Section 20)
  const userText = state.messages.filter(m => m.sender === 'user').map(m => m.text).join(' | ');
  const newCase = createCaseFromAnalysis({
    message: userText,
    nlpResult: {
      intent: state.detectedIntent || 'WATER_RESOURCES',
      isMultiDepartment: (state.selectedDepartments?.length || 1) > 1,
      urgency: state.urgency || 'HIGH',
      confidence: state.confidence || 0.94,
      themes: state.detectedThemes.map(t => ({ label: t.label || t.name, relevance: 'High', color: '#00F2FE' })),
      recommendedServices: (state.recommendedServices?.length > 0 ? state.recommendedServices : [
        { department: 'Water Resources & Fluoride Remediation', serviceTitle: 'Water Resources R&D Lab', role: 'HEI Innovation Lead' }
      ]),
      aiMirror: state.confirmedSummary || state.provisionalSummary || "Citizen community problem report submitted across Jharkhand innovation network."
    },
    consent: { shareSummary: true, shareRawMessage: false, shareResourceHistory: true },
    user: { id: state.studentId, name: state.studentName }
  });

  state.createdCaseId = newCase.id;

  // 1.1 Persist to backend database as an official societal challenge
  try {
    apiCreateChallenge({
      title: (state.confirmedSummary || userText).slice(0, 80),
      description: userText,
      district: state.district || 'Dumka',
      block: state.block || 'Jama',
      domain: 'Water Resources',
      submittedBy: state.studentName || 'Citizen Contributor',
      submitterRole: 'Community Resident'
    }).then(backendRes => {
      if (backendRes && backendRes.id) {
        state.createdCaseId = backendRes.id;
        saveConversationState(state);
      }
    });
  } catch (apiErr) {
    console.warn('[conversationEngine] Backend challenge creation fallback:', apiErr);
  }

  // 2. Attach scheduled consultation to case
  bookAppointment({
    caseId: newCase.id,
    counsellorName: slot.counsellor,
    dept: slot.dept,
    date: `${slot.day}, Oct 29`,
    time: slot.time,
    modality: slot.modality
  });

  // 3. Conversational confirmation + Beautiful Human Handoff (Section 24)
  state.handoffComplete = true;
  state.stage = STAGES.JOURNEY;
  state.currentStage = STAGES.JOURNEY;

  const confirmMsg = {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: `Consultation confirmed.\n\nYou will connect with ${slot.counsellor} (${slot.dept}) on ${slot.day} at ${slot.time}.\n\nYour societal challenge file #${newCase.id} has been registered in the Jharkhand State Database and routed to the university innovation desk.`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    stage: STAGES.JOURNEY,
    handoff: {
      caseId: newCase.id,
      specialist: slot.counsellor,
      department: slot.dept,
      time: `${slot.day} at ${slot.time}`
    }
  };
  state.messages.push(confirmMsg);

  saveConversationState(state);
  return { state, caseId: newCase.id, appointment: slot };
}
