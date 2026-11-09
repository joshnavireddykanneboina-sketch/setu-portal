// Frontend API Client for SETU Jharkhand Societal Innovation Collaboration Portal
// Department of Higher & Technical Education, Government of Jharkhand (PS ID 26043)

import { getApiBaseUrl, nativeApiConfigError } from './apiConfig.js';

function apiUrl(suffix) {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(nativeApiConfigError());
  }
  return `${base}${suffix}`;
}

export function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('SETU_AUTH_TOKEN_V1');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const authStored = localStorage.getItem('SETU_AUTH_USER_V1') || localStorage.getItem('HERE_AUTH_USER_V1');
    if (authStored) {
      const u = JSON.parse(authStored);
      if (u?.email) {
        headers['x-user-email'] = u.email;
      }
    }
  } catch (e) {
    // ignore
  }
  return headers;
}

// -------------------------------------------------------------
// AUTHENTICATION CLIENT METHODS
// -------------------------------------------------------------

export async function apiLoginUser(email, password) {
  let res;
  try {
    res = await fetch(`${apiUrl('')}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  } catch (netErr) {
    if (netErr?.message?.includes('Android build')) throw netErr;
    throw new Error('Cannot reach the SETU server. Check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (parseErr) {
    // Non-JSON or empty response from proxy/server
  }

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 504
      ? 'Cannot reach the SETU server. Check your connection and try again.'
      : `Authentication failed (HTTP ${res.status}).`);
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiRegisterUser(userData) {
  let res;
  try {
    res = await fetch(`${apiUrl('')}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
  } catch (netErr) {
    if (netErr?.message?.includes('Android build')) throw netErr;
    throw new Error('Cannot reach the SETU server. Check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (parseErr) {
    // Non-JSON or empty response from proxy/server
  }

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || (res.status === 500 || res.status === 502 || res.status === 503 || res.status === 504
      ? 'Cannot reach the SETU server. Check your connection and try again.'
      : `Registration failed (HTTP ${res.status}).`);
    throw new Error(errorMsg);
  }
  return data;
}

export async function apiGetMe() {
  try {
    const res = await fetch(`${apiUrl('')}/auth/me`, {
      headers: getHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/auth/me fetch error:', e.message);
  }
  return null;
}

export async function apiUpdateProfile(profileData) {
  try {
    const res = await fetch(`${apiUrl('')}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    if (res.ok) return await res.json();
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Profile update failed.');
  } catch (e) {
    console.warn('[API CLIENT] /api/auth/profile PUT error:', e.message);
    return null;
  }
}

// -------------------------------------------------------------
// SOCIETAL CHALLENGES CLIENT METHODS
// -------------------------------------------------------------

export async function apiGetChallenges(query = '') {
  try {
    const res = await fetch(`${apiUrl('')}/challenges${query ? `?${query}` : ''}`, {
      headers: getHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch challenges from server.');
  } catch (e) {
    console.warn('[API CLIENT] apiGetChallenges error:', e.message);
    throw e;
  }
}

export async function apiGetChallenge(id) {
  try {
    const res = await fetch(`${apiUrl('')}/challenges/${id}`, {
      headers: getHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Challenge ${id} not found.`);
  } catch (e) {
    console.warn('[API CLIENT] apiGetChallenge error:', e.message);
    throw e;
  }
}

export async function apiCreateChallenge(challengeData, idempotencyKey = null) {
  const headers = getHeaders();
  const key = idempotencyKey || challengeData?.idempotencyKey;
  if (key) {
    headers['x-idempotency-key'] = key;
  }

  const res = await fetch(`${apiUrl('')}/challenges`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...challengeData, idempotencyKey: key })
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || data.error || 'Challenge submission rejected by server.');
    error.status = res.status;
    throw error;
  }
  return data;
}

export async function apiHEIDecision(id, { decision, reason, facultyMentor }) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/hei-decision`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ decision, reason, facultyMentor })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to record university decision.');
  }
  return data;
}

export async function apiFormTeam(id, teamData) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/form-team`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(teamData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to form multidisciplinary research team.');
  }
  return data;
}

export async function apiUpdateResearchPlan(id, planData) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/research-plan`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(planData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update research plan.');
  }
  return data;
}

export async function apiSubmitFieldReport(id, reportData) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/field-report`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reportData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to submit field test report.');
  }
  return data;
}

export async function apiRecordPatent(id, patentData) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/patent`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(patentData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to record innovation IP.');
  }
  return data;
}

export async function apiFundChallenge(id, fundData) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/fund`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(fundData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'CSR funding pledge could not be processed.');
  }
  return data;
}

export async function apiReassignHEI(id, reassignData) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/reassign-hei`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reassignData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to reassign university.');
  }
  return data;
}

export async function apiUpdateMilestones(id, milestones) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}/milestones`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ milestones })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update project milestones.');
  }
  return data;
}

export async function apiUpdateChallenge(id, updateData) {
  const res = await fetch(`${apiUrl('')}/challenges/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updateData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to update challenge details.');
  }
  return data;
}

// -------------------------------------------------------------
// GOVERNANCE & ANALYTICS CLIENT METHODS
// -------------------------------------------------------------

export async function apiGetAdminAnalytics() {
  const res = await fetch(`${apiUrl('')}/admin/analytics`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to load government analytics.');
  }
  return data;
}

export async function apiGetDistricts() {
  const res = await fetch(`${apiUrl('')}/admin/districts`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to fetch Jharkhand districts.');
  }
  return data;
}

export function apiExportCSVUrl() {
  return `${apiUrl('')}/admin/export-csv`;
}

// -------------------------------------------------------------
// CHAT, SAFETY & ML CLIENT METHODS
// -------------------------------------------------------------

export async function apiPostChat({ conversationId, message }) {
  try {
    const res = await fetch(`${apiUrl('')}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ conversationId, message })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[API CLIENT] /api/chat error, using local assistant:', err.message);
  }
  return null;
}

export async function apiCheckSafety(message) {
  try {
    const res = await fetch(`${apiUrl('')}/safety/check`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return null;
}

export async function apiClassifyML(text) {
  try {
    const res = await fetch(`${apiUrl('')}/ml/classify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/ml/classify error:', e.message);
  }
  return null;
}

export const apiClassifyChallenge = apiClassifyML;

export async function apiDetectDuplicates(query, threshold = 0.35) {
  try {
    const res = await fetch(`${apiUrl('')}/ml/detect-duplicates`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, threshold })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/ml/detect-duplicates error:', e.message);
  }
  return { duplicates: [], engine: 'In-Process Fallback' };
}

export async function apiGetHEIRouting({ domain, district, urgency = 'GREEN', beneficiaries = 5000, description = '' }) {
  try {
    const res = await fetch(`${apiUrl('')}/ml/route-hei`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ domain, district, urgency, beneficiaries, description })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/ml/route-hei error:', e.message);
  }
  return null;
}

export async function apiStructureProblem({ text, district, metadata = {} }) {
  try {
    const res = await fetch(`${apiUrl('')}/ml/structure-problem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, district, metadata })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/ml/structure-problem error:', e.message);
  }
  return null;
}

export async function apiGenerateClarifications({ text, domain, district }) {
  try {
    const res = await fetch(`${apiUrl('')}/ml/clarification-questions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, domain, district })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/ml/clarification-questions error:', e.message);
  }
  return null;
}

export async function apiSuggestResearch({ domain, description }) {
  try {
    const res = await fetch(`${apiUrl('')}/ml/suggest-research`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ domain, description })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/ml/suggest-research error:', e.message);
  }
  return null;
}

export async function apiExplainClassification({ text, domain, urgency, confidence }) {
  try {
    const res = await fetch(`${apiUrl('')}/ml/explain`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text, domain, urgency, confidence })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[API CLIENT] /api/ml/explain error:', e.message);
  }
  return null;
}

// Deprecated alias for backwards compatibility
export const apiAssignHEI = apiReassignHEI;
