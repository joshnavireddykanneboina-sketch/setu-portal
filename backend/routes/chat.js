// Chat and Conversational Engine Routes for SETU Platform
import express from 'express';
import { evaluateSafety } from '../services/safety/safetyService.js';
import { classifySupportCase } from '../services/ml/mlClient.js';
// NOTE: conversationEngine.js is a frontend Vite module (uses import.meta.env).
// The backend drives its own stateless conversation logic via the LLM/ML services
// directly, and only the frontend engine runs in the browser.
// We stub the import to avoid the import.meta.env crash at Node startup.
const processConversation = null;
const getConversationState = () => ({
  conversationId: null, messages: [], stage: 'OPEN', urgency: 'GREEN',
  intent: null, themes: [], meaningfulTurns: 0
});
const saveConversationState = () => {};

const router = express.Router();

// POST /api/chat
router.post('/', async (req, res) => {
  const { conversationId, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // 1. Safety Check Layer (Section 11)
    const safetyCheck = evaluateSafety(message);
    if (safetyCheck.isCrisis) {
      return res.json({
        reply: safetyCheck.reply,
        stage: 'SAFETY',
        intent: 'CRISIS_SUPPORT',
        themes: [{ label: 'Immediate Crisis Support', relevance: 'Urgent', color: '#F87171' }],
        urgency: 'RED',
        safetyAlert: safetyCheck.safetyAlert,
        nextAction: 'SHOW_SAFETY_CRISIS',
        progress: 'Immediate Care Triage'
      });
    }

    // 2. Load Conversation State (stateless per-request — state lives in the browser)
    let state = getConversationState();
    if (!state || (conversationId && state.conversationId !== conversationId)) {
      state.conversationId = conversationId || `CONV-${Date.now()}`;
    }

    // Record user message
    state.messages.push({
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // 3. Run ML Classification
    const mlAnalysis = await classifySupportCase(message);

    // Build a minimal result from ML output
    const result = {
      reply: null,
      stage: 'UNDERSTAND',
      intent: mlAnalysis.primaryIntent || 'community_challenge',
      themes: mlAnalysis.themes || [],
      urgency: mlAnalysis.urgencyLevel || 'GREEN',
      options: null,
      nextAction: null,
      progress: 'Analyzing your challenge...',
      knownInformation: {}
    };

    // 4. Enrich with Upstream Gemini Generative AI if available
    let finalReply = null;
    let engineMode = 'ML_ENGINE';

    try {
      const { generateResponse } = await import('../services/llm/provider.js');
      const { CONVERSATIONAL_SYSTEM_PROMPT } = await import('../services/llm/prompts.js');

      const promptInstruction = `${CONVERSATIONAL_SYSTEM_PROMPT}

Current conversational phase: ${result.stage}
Detected domain: ${result.intent || 'community challenge'}
ML Urgency: ${result.urgency}

Instructions:
1. Acknowledge the citizen's specific challenge with genuine empathy and clarity.
2. Ask one focused follow-up question to better understand the community impact.
3. Keep your response concise (2-3 sentences), warm, and helpful.
4. NEVER diagnose. NEVER give legal or medical advice.`;

      const historyForLLM = (state.messages || []).map(m => ({ sender: m.sender, text: m.text }));

      const llmResult = await generateResponse({ messages: historyForLLM, systemPrompt: promptInstruction });
      if (llmResult && llmResult.success && llmResult.text) {
        finalReply = llmResult.text.trim();
        engineMode = 'GEMINI_GENERATIVE_AI';
      }
    } catch (llmErr) {
      console.warn('[BACKEND CHAT] Gemini LLM generation fallback:', llmErr.message);
    }

    // Fallback reply if LLM unavailable
    if (!finalReply) {
      finalReply = `Thank you for sharing this challenge from ${mlAnalysis.district || 'your district'}. Your report has been classified as a ${result.intent || 'community issue'} (${result.urgency} urgency). Please describe the impact on your community so we can route it to the right university lab.`;
    }

    // Merge state
    state.stage = result.stage;
    state.currentStage = result.stage;
    state.intent = result.intent || mlAnalysis.primaryIntent;
    state.detectedIntent = state.intent;
    state.themes = result.themes || state.themes;
    state.detectedThemes = state.themes;
    state.urgency = result.urgency || mlAnalysis.urgencyLevel;
    state.engineMode = engineMode;

    // Record assistant message
    state.messages.push({
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      text: finalReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: result.stage,
      options: result.options,
      nextAction: result.nextAction
    });

    saveConversationState(state);

    return res.json({
      reply: finalReply,
      stage: result.stage,
      intent: state.intent,
      themes: state.themes,
      urgency: state.urgency,
      options: result.options,
      nextAction: result.nextAction,
      progress: result.progress,
      aiMirrorPoints: state.aiMirrorPoints,
      provisionalSummary: state.provisionalSummary,
      recommendedServices: state.recommendedServices,
      engineMode,
      mlClassification: mlAnalysis
    });
  } catch (err) {
    console.error('[API CHAT ERROR]', err);
    res.status(500).json({ error: 'Chat processing failed', details: err.message });
  }
});

export default router;
