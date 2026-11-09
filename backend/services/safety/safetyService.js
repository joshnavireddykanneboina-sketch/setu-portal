// Safety & Crisis Detection Service for SETU Platform
// Executes before standard LLM and ML processing to protect citizen and student wellbeing

const CRISIS_PATTERNS = [
  /\b(suicid|kill myself|end my life|want to die|wanna die|don't want to live|don't want to be alive|not want to live|self[- ]harm|cut myself|hang myself|take all my pills)\b/i,
  /\b(overdose|harm myself|end it all|can't go on living|nobody would miss me|better off dead|give up on life)\b/i
];

const ELEVATED_DISTRESS_PATTERNS = [
  /\b(panic attack|can't breathe|severe breakdown|crying non[- ]stop|starving myself|haven't eaten in days|cannot take this anymore)\b/i
];

export function evaluateSafety(text) {
  if (!text || typeof text !== 'string') {
    return {
      safetyStatus: 'NORMAL',
      isCrisis: false,
      urgencyOverride: null
    };
  }

  const clean = text.toLowerCase();

  // 1. Immediate Danger / Suicide Crisis Check
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        safetyStatus: 'IMMEDIATE_DANGER',
        isCrisis: true,
        urgencyOverride: 'RED',
        reply: "I hear you, and I want to take what you just shared very seriously.\n\nYou don't have to carry this alone. Immediate, confidential human support is available for you right now.",
        safetyAlert: {
          title: "Immediate Crisis Support Available 24/7",
          message: "You are not alone. Please reach out to confidential crisis specialists immediately.",
          emergencyContacts: [
            { name: "Tele-MANAS National Helpline", number: "14416 / 1800-891-4416", availability: "Free, Confidential, 24/7" },
            { name: "Jharkhand Emergency Response Support", number: "112", availability: "Immediate Toll-Free" },
            { name: "KIRAN Mental Health Rehabilitation", number: "1800-599-0019", availability: "24/7 Support" }
          ],
          actions: [
            { label: "Connect with On-Call Crisis Specialist Now", type: "urgent_human_handoff" },
            { label: "Call 24/7 Hotline Directly", type: "phone_call" }
          ]
        },
        action: 'HALT_NORMAL_ROUTING'
      };
    }
  }

  // 2. Elevated Distress Check
  for (const pattern of ELEVATED_DISTRESS_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        safetyStatus: 'SAFETY_SIGNAL',
        isCrisis: false,
        urgencyOverride: 'AMBER',
        note: 'Elevated emotional distress detected; prioritized queue allocation applied.'
      };
    }
  }

  return {
    safetyStatus: 'NORMAL',
    isCrisis: false,
    urgencyOverride: null
  };
}
