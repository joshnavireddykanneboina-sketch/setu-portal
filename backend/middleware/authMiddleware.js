// Authentication & Authorization Middleware for SETU Platform
// Validates JWT-style HMAC tokens, enforces Role-Based Access Control (RBAC)
import { findOne } from '../../database/db.js';
import { verifyToken } from '../utils/authUtils.js';

/**
 * Authenticates request via Authorization Bearer token or x-user-email
 */
export function requireAuth(req, res, next) {
  let user = null;

  // 1. Try Bearer Token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    if (payload && payload.id) {
      user = findOne('users', u => u.id === payload.id);
    }
  }

  // 2. In development only: accept x-user-email as a trusted fallback so
  //    the dev Vite proxy session still works without a real signed token.
  //    This fallback is DISABLED in production to prevent header-spoofing attacks.
  if (!user && req.headers['x-user-email'] && process.env.NODE_ENV !== 'production') {
    const email = req.headers['x-user-email'].toLowerCase().trim();
    user = findOne('users', u => u.email.toLowerCase() === email);
  }

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in to access this SETU portal service.'
    });
  }

  const safeUser = { ...user };
  delete safeUser.passwordHash;
  req.user = safeUser;
  next();
}

/**
 * Optional authentication - attaches req.user if token is present, does not fail if anonymous
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);
    if (payload && payload.id) {
      const user = findOne('users', u => u.id === payload.id);
      if (user) {
        const safeUser = { ...user };
        delete safeUser.passwordHash;
        req.user = safeUser;
      }
    }
  } else if (req.headers['x-user-email'] && process.env.NODE_ENV !== 'production') {
    const email = req.headers['x-user-email'].toLowerCase().trim();
    const user = findOne('users', u => u.email.toLowerCase() === email);
    if (user) {
      const safeUser = { ...user };
      delete safeUser.passwordHash;
      req.user = safeUser;
    }
  }
  next();
}

/**
 * Enforces Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles (e.g. 'CITIZEN', 'UNIVERSITY', 'INDUSTRY', 'ADMIN', 'GOVERNMENT')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required prior to role verification.'
      });
    }

    // Treat ADMIN and GOVERNMENT as equivalent administrative tiers
    const userRole = req.user.role?.toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
    
    const hasRole = normalizedAllowed.includes(userRole) ||
      (normalizedAllowed.includes('ADMIN') && userRole === 'GOVERNMENT') ||
      (normalizedAllowed.includes('GOVERNMENT') && userRole === 'ADMIN');

    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Your role (${req.user.role}) is not authorized for this section. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
