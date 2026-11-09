// Authentication Routes for SETU Platform
// Supports registration, secure password hashing, token issue, and session retrieval
import express from 'express';
import { findOne, insert, update } from '../../database/db.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/authUtils.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/login - Secure login with password verification & token generation
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = findOne('users', u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        error: 'Invalid Credentials',
        message: 'Email or password does not match registered SETU platform records.'
      });
    }

    // Automatic hash upgrade if password was stored as plain text
    if (!user.passwordHash.includes(':')) {
      try {
        const secureHash = hashPassword(password);
        update('users', user.id, { passwordHash: secureHash });
      } catch (e) {
        console.warn('[AUTH] Could not upgrade legacy password hash:', e.message);
      }
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    const token = generateToken(safeUser);

    return res.json({
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('[AUTH ERROR] Login failed:', err);
    return res.status(500).json({
      error: 'Login failed',
      message: err.message || 'An error occurred during authentication.'
    });
  }
});

// POST /api/auth/register - Register new stakeholder (Citizen, University, Industry, Government)
router.post('/register', (req, res) => {
  try {
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
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = findOne('users', u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email is already registered on SETU.' });
    }

    const validRoles = ['CITIZEN', 'UNIVERSITY', 'INDUSTRY', 'ADMIN', 'GOVERNMENT'];
    const assignedRole = validRoles.includes((role || '').toUpperCase()) ? role.toUpperCase() : 'CITIZEN';

    const rolePrefix = {
      CITIZEN: 'CITIZEN',
      UNIVERSITY: 'UNIV',
      INDUSTRY: 'INDUSTRY',
      ADMIN: 'GOVT',
      GOVERNMENT: 'GOVT'
    }[assignedRole] || 'USER';

    const newId = `${rolePrefix}-${Date.now().toString().slice(-6)}`;
    const passwordHash = hashPassword(password);

    const cleanName = (name || '').trim();
    const initials = cleanName.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SU';
    const roleColors = {
      CITIZEN: '#00F2FE',
      UNIVERSITY: '#8DCFA9',
      INDUSTRY: '#EBA756',
      ADMIN: '#C7B8F5',
      GOVERNMENT: '#C7B8F5'
    };

    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      district: district || 'Ranchi',
      block: block || 'Central Block',
      panchayat: panchayat || '',
      phone: phone || '+91-9431000000',
      institution: institution || (assignedRole === 'UNIVERSITY' ? 'Birla Institute of Technology (BIT), Mesra' : ''),
      department: department || '',
      title: title || (assignedRole === 'UNIVERSITY' ? 'Faculty Researcher' : 'Community Representative'),
      organization: organization || (assignedRole === 'INDUSTRY' ? 'Tata Steel CSR Division' : ''),
      specializations: Array.isArray(specializations) ? specializations : [],
      avatarInitials: initials,
      avatarColor: roleColors[assignedRole] || '#00F2FE',
      createdAt: new Date().toISOString()
    };

    insert('users', newUser);

    // If registering an institution or industry, also register in universities/industries if not present
    if (assignedRole === 'UNIVERSITY' && institution) {
      const existingUni = findOne('universities', u => u.name && u.name.toLowerCase() === institution.toLowerCase());
      if (!existingUni) {
        insert('universities', {
          id: `HEI-${Date.now().toString().slice(-4)}`,
          name: institution,
          district: district || 'Ranchi',
          specializations: specializations.length ? specializations : ['Rural Innovation', 'Engineering Solutions'],
          activeProjects: 0,
          facultyCount: 15,
          incubationCenter: `${institution} Incubation Cell`
        });
      }
    }

    const safeUser = { ...newUser };
    delete safeUser.passwordHash;

    const token = generateToken(safeUser);

    return res.status(201).json({
      message: 'Stakeholder account registered successfully.',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('[AUTH ERROR] Registration failed:', err);
    return res.status(500).json({
      error: 'Registration failed',
      message: err.message || 'An error occurred during stakeholder registration.'
    });
  }
});

// GET /api/auth/me - Retrieve current verified user session
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// PUT /api/auth/profile - Update stakeholder profile preferences
router.put('/profile', requireAuth, (req, res) => {
  const allowedUpdates = {};
  const fields = ['name', 'phone', 'district', 'block', 'panchayat', 'institution', 'department', 'title', 'organization', 'specializations'];
  
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      allowedUpdates[f] = req.body[f];
    }
  }

  const updated = update('users', req.user.id, allowedUpdates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found in database' });
  }

  const safeUser = { ...updated };
  delete safeUser.passwordHash;

  return res.json({
    message: 'Profile updated successfully',
    user: safeUser
  });
});

// POST /api/auth/logout - Logout endpoint
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
