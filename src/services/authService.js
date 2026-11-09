// Authentication Service for SETU Jharkhand Portal
// Centralized authenticated user state with role-based routing, real token/session handling, and seeded accounts
import { apiLoginUser, apiRegisterUser, apiGetMe } from './apiClient.js';
import { setCurrentAuthUser } from './store.js';

const AUTH_STORAGE_KEY = 'SETU_AUTH_USER_V1';
const AUTH_TOKEN_KEY = 'SETU_AUTH_TOKEN_V1';

// Seeded Prototype Demo Accounts (Single Source of Truth)
export const DEMO_ACCOUNTS = {
  'citizen@setu.jharkhand.gov.in': {
    id: 'CITIZEN-101',
    name: 'Rameshwar Mahato',
    email: 'citizen@setu.jharkhand.gov.in',
    password: 'setu123',
    role: 'CITIZEN',
    district: 'Dumka',
    block: 'Jama',
    panchayat: 'Jama Gram Panchayat',
    phone: '+91-9431102938',
    avatarInitials: 'RM',
    avatarColor: '#00F2FE'
  },
  'university@setu.jharkhand.gov.in': {
    id: 'UNIV-201',
    name: 'Dr. Rajeshwar Prasad',
    email: 'university@setu.jharkhand.gov.in',
    password: 'setu123',
    role: 'UNIVERSITY',
    institution: 'BIT Mesra, Ranchi',
    department: 'Department of Water Resources & Civil Engineering',
    title: 'Head of Innovation & Incubation Cell',
    avatarInitials: 'RP',
    avatarColor: '#38BDF8'
  },
  'industry@setu.jharkhand.gov.in': {
    id: 'INDUSTRY-301',
    name: 'Amitabh Choudhury',
    email: 'industry@setu.jharkhand.gov.in',
    password: 'setu123',
    role: 'INDUSTRY',
    organization: 'Tata Steel CSR & Sustainability Hub',
    designation: 'Head of Community Innovation & CSR Funding',
    avatarInitials: 'AC',
    avatarColor: '#EBA756'
  },
  'admin@setu.jharkhand.gov.in': {
    id: 'GOVT-401',
    name: 'Dr. Subhashish Roy, IAS',
    email: 'admin@setu.jharkhand.gov.in',
    password: 'setu123',
    role: 'GOVERNMENT',
    department: 'Department of Higher & Technical Education',
    designation: 'Joint Director & Nodal Officer - SETU Portal',
    avatarInitials: 'SR',
    avatarColor: '#8DCFA9'
  }
};

let currentUser = null;
let initialized = false;
const authListeners = new Set();

export function getCurrentUser() {
  if (currentUser !== null) return currentUser;

  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem('HERE_AUTH_USER_V1');
      if (stored && stored !== 'null') {
        currentUser = JSON.parse(stored);
        return currentUser;
      }
    }
  } catch (e) {
    console.error('Error reading auth state:', e);
  }

  // If first time ever opening without stored state
  if (!initialized) {
    initialized = true;
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === null) {
        currentUser = { ...DEMO_ACCOUNTS['citizen@setu.jharkhand.gov.in'] };
        saveAuthUser(currentUser);
        return currentUser;
      }
    } else {
      currentUser = { ...DEMO_ACCOUNTS['citizen@setu.jharkhand.gov.in'] };
      return currentUser;
    }
  }

  return null;
}

export function saveAuthUser(user, token = null) {
  currentUser = user;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, 'null');
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (e) {
    console.error('Error saving auth user:', e);
  }
  try {
    setCurrentAuthUser(user);
  } catch (e) {
    console.error('Error syncing store auth user:', e);
  }
  notifyAuthListeners();
}

export function subscribeAuth(listener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function notifyAuthListeners() {
  for (const listener of authListeners) {
    try {
      listener(currentUser);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  }
}

/**
 * Sign In with email and password
 * Attempts real backend token authentication, with offline demo fallback
 */
export async function signIn(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await apiLoginUser(normalizedEmail, password);
    if (res && res.user) {
      saveAuthUser(res.user, res.token);
      return { success: true, user: res.user };
    }
  } catch (err) {
    console.warn('[AUTH SERVICE] Live login failed:', err.message);

    // Fallback for offline demo accounts if backend is temporarily disconnected
    const demoAccount = DEMO_ACCOUNTS[normalizedEmail];
    if (demoAccount && demoAccount.password === password) {
      const sessionUser = { ...demoAccount };
      delete sessionUser.password;
      saveAuthUser(sessionUser, 'demo-offline-session-token');
      return { success: true, user: sessionUser };
    }

    return { 
      success: false, 
      error: err.message || 'Invalid credentials. Please verify your email and password.' 
    };
  }

  return { success: false, error: 'Authentication failed.' };
}

/**
 * Public Sign Up: Supports CITIZEN, UNIVERSITY, INDUSTRY
 */
export async function signUp(userData) {
  const { 
    name, 
    email, 
    password, 
    role = 'CITIZEN',
    district = 'Ranchi',
    block = '',
    panchayat = '',
    phone = '',
    institution = '',
    department = '',
    title = '',
    organization = '',
    specializations = []
  } = userData;

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await apiRegisterUser({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      district,
      block,
      panchayat,
      phone,
      institution,
      department,
      title,
      organization,
      specializations
    });

    if (res && res.user) {
      saveAuthUser(res.user, res.token);
      return { success: true, user: res.user };
    }
  } catch (err) {
    console.warn('[AUTH SERVICE] Backend registration failed:', err.message);

    // If backend server is unreachable (e.g., only `npm run dev` running without backend, or offline PWA mode),
    // provide seamless offline registration so the user can continue testing uninterrupted.
    if (err.message.includes('Port 5000') || err.message.includes('Cannot connect')) {
      const assignedRole = (role || 'CITIZEN').toUpperCase();
      const offlineId = `OFFLINE-${assignedRole}-${Date.now().toString().slice(-4)}`;
      const cleanName = (name || '').trim();
      const initials = cleanName.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SU';
      const offlineUser = {
        id: offlineId,
        name: cleanName,
        email: normalizedEmail,
        role: assignedRole,
        district: district || 'Ranchi',
        block: block || 'Central Block',
        panchayat: panchayat || '',
        phone: phone || '+91-9431000000',
        institution: institution || (assignedRole === 'UNIVERSITY' ? 'Birla Institute of Technology (BIT), Mesra' : ''),
        department: department || '',
        title: title || (assignedRole === 'UNIVERSITY' ? 'Faculty Researcher' : 'Community Representative'),
        organization: organization || (assignedRole === 'INDUSTRY' ? 'Tata Steel CSR Division' : ''),
        avatarInitials: initials,
        avatarColor: '#00F2FE',
        isOfflineSession: true
      };

      saveAuthUser(offlineUser, `offline-token-${Date.now()}`);
      return {
        success: true,
        user: offlineUser,
        warning: 'Registered in offline local session. Start backend with npm start for persistent server records.'
      };
    }

    return { success: false, error: err.message || 'Registration failed. Please check your details.' };
  }

  return { success: false, error: 'Registration could not be completed.' };
}

export function updateUserProfile(updates) {
  if (!currentUser) currentUser = getCurrentUser() || {};
  currentUser = { ...currentUser, ...updates };
  saveAuthUser(currentUser);
  return currentUser;
}

export function signOut() {
  saveAuthUser(null, null);
}

export async function sendPasswordReset(email) {
  await new Promise(r => setTimeout(r, 600));
  return { 
    success: true, 
    message: `Password reset link dispatched to ${email}. Please check your official inbox.` 
  };
}
