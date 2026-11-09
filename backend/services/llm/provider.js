// LLM Provider Abstraction for SETU Platform
// Enables zero-friction switching between LLM providers and the local conversational engine

import { callUpstreamLLM } from './client.js';
import { CONVERSATIONAL_SYSTEM_PROMPT } from './prompts.js';

export async function generateResponse({
  messages,
  systemPrompt = CONVERSATIONAL_SYSTEM_PROMPT,
  jsonMode = false
}) {
  try {
    const upstreamResult = await callUpstreamLLM({ messages, systemPrompt, jsonMode });
    if (upstreamResult) {
      return {
        text: upstreamResult,
        source: 'UPSTREAM_LLM',
        success: true
      };
    }
  } catch (err) {
    console.warn('[LLM PROVIDER] Upstream LLM call failed or key absent, engaging local conversation engine:', err.message);
  }

  // Graceful fallback signal
  return {
    text: null,
    source: 'LOCAL_CONVERSATION_ENGINE',
    success: false
  };
}
