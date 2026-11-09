// LLM API Client for SETU Platform
// Safely executes calls to upstream LLM providers (e.g., Gemini, OpenAI) using backend .env keys

import { config } from '../../config.js';

export async function callUpstreamLLM({ messages, systemPrompt, jsonMode = false }) {
  const apiKey = config.llm.apiKey;
  if (!apiKey) {
    return null; // Signals provider to use local conversational engine
  }

  const provider = config.llm.provider.toLowerCase();

  if (provider === 'gemini') {
    return callGemini(apiKey, config.llm.model, messages, systemPrompt, jsonMode);
  }

  if (provider === 'openai') {
    return callOpenAI(apiKey, config.llm.model, messages, systemPrompt, jsonMode);
  }

  return null;
}

async function callGemini(apiKey, model, messages, systemPrompt, jsonMode) {
  const candidateModels = [
    model || 'gemini-flash-lite-latest',
    'gemini-flash-lite-latest',
    'gemini-flash-latest'
  ];

  // Normalize contents to ensure alternating user/model roles and start with user
  const rawContents = messages.map(m => ({
    role: (m.sender === 'user' || m.role === 'user') ? 'user' : 'model',
    parts: [{ text: (m.text || m.content || '').trim() }]
  })).filter(m => m.parts[0].text.length > 0);

  const contents = [];
  for (const c of rawContents) {
    if (contents.length === 0 && c.role !== 'user') {
      // First turn for Gemini must be from user
      continue;
    }
    if (contents.length > 0 && contents[contents.length - 1].role === c.role) {
      // Merge consecutive same-role parts
      contents[contents.length - 1].parts[0].text += `\n${c.parts[0].text}`;
    } else {
      contents.push(c);
    }
  }

  // If no user messages present, add a placeholder
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  const body = {
    system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
    contents,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: jsonMode ? 'application/json' : 'text/plain'
    }
  };

  let lastError = null;
  const tried = new Set();

  for (const targetModel of candidateModels) {
    if (tried.has(targetModel)) continue;
    tried.add(targetModel);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } else {
        const errorText = await res.text();
        lastError = new Error(`Gemini API [${targetModel}] error ${res.status}: ${errorText}`);
        console.warn(`[GEMINI CLIENT] Model ${targetModel} returned status ${res.status}, trying fallback...`);
      }
    } catch (e) {
      lastError = e;
      console.warn(`[GEMINI CLIENT] Model ${targetModel} network exception:`, e.message);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to generate content');
}

async function callOpenAI(apiKey, model, messages, systemPrompt, jsonMode) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const formattedMessages = [];
  if (systemPrompt) {
    formattedMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const m of messages) {
    formattedMessages.push({
      role: m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant',
      content: m.text || m.content
    });
  }

  const body = {
    model: model || 'gpt-4o-mini',
    messages: formattedMessages,
    temperature: 0.3,
    response_format: jsonMode ? { type: 'json_object' } : undefined
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error [${res.status}]: ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
