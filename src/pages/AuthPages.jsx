import React, { useState } from 'react';
import { 
  Mail, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Sparkles, 
  User, 
  GraduationCap, 
  Building2, 
  MapPin, 
  Phone,
  Layers
} from 'lucide-react';
import { AssistantOrb } from '../components/AssistantOrb';
import { signIn, signUp, sendPasswordReset, DEMO_ACCOUNTS } from '../services/authService';
import { JHARKHAND_DISTRICTS, THEMATIC_DOMAINS } from '../data/jharkhandDistricts';

export function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn(email, password);
      setLoading(false);
      if (res.success && res.user) {
        // Automatic Role-Based Redirect
        if (res.user.role === 'INDUSTRY' || res.user.role === 'COUNSELLOR') {
          onNavigate('/industry');
        } else if (res.user.role === 'ADMIN' || res.user.role === 'GOVERNMENT') {
          onNavigate('/admin');
        } else if (res.user.role === 'CITIZEN') {
          onNavigate('/citizen');
        } else {
          onNavigate('/journey');
        }
      } else {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleFillDemo = (demoEmail) => {
    const account = DEMO_ACCOUNTS[demoEmail];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setError('');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    const res = await sendPasswordReset(resetEmail);
    setResetLoading(false);
    setResetSuccess(res.message);
  };

  return (
    <div 
      style={{ 
        paddingTop: '110px', 
        minHeight: '100vh', 
        backgroundColor: '#07070A', 
        paddingBottom: '80px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Glow */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.08) 0%, rgba(235, 167, 86, 0.03) 45%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '460px', width: '100%', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <AssistantOrb size={60} state="idle" />
          </div>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#B8B3AA',
              fontSize: '12px',
              marginBottom: '10px'
            }}
          >
            <ShieldCheck size={14} color="#00F2FE" />
            <span>Government of Jharkhand Nodal Portal</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 650, color: '#F8FAFC', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Sign in to SETU Portal
          </h1>
          <p style={{ fontSize: '14.5px', color: '#94A3B8', lineHeight: 1.5 }}>
            Connecting citizens, Panchayati Raj Institutions, universities, and industry CSR partners.
          </p>
        </div>

        {/* Authentication Card */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '34px 30px', 
            borderRadius: '24px',
            background: 'rgba(22, 21, 30, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}
        >
          {error && (
            <div 
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Address */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                Official / Registered Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@jharkhand.gov.in / name@institution.edu"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '14px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FAF8F5',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 200ms ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(0, 242, 254, 0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <Mail size={16} color="#78746C" style={{ position: 'absolute', top: '15px', left: '15px' }} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#CBD5E1' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#00F2FE',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '14px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FAF8F5',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 200ms ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(0, 242, 254, 0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <Key size={16} color="#78746C" style={{ position: 'absolute', top: '15px', left: '15px' }} />
              </div>
            </div>

            {/* Sign In Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px',
                fontSize: '14.5px',
                fontWeight: 650,
                marginBottom: '1.25rem' 
              }}
            >
              <span>{loading ? 'Verifying with State Registry...' : 'Sign in to SETU'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Create Account Link */}
          <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>
              First time on SETU?{' '}
            </span>
            <button
              onClick={() => onNavigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#00F2FE',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Register your institution or community →
            </button>
          </div>

          {/* Quick Prototype Role Switcher */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: '8px', textAlign: 'center' }}>
              Instant Demo Access (Seeded Records)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleFillDemo('citizen@setu.jharkhand.gov.in')}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  background: 'rgba(0, 242, 254, 0.1)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  outline: 'none',
                  color: '#00F2FE',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                title="Rameshwar Mahato · Citizen Demo (citizen@setu.jharkhand.gov.in)"
              >
                Citizen
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('university@setu.jharkhand.gov.in')}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  outline: 'none',
                  color: '#38BDF8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                title="Dr. Rajeshwar Prasad · BIT Mesra Demo (university@setu.jharkhand.gov.in)"
              >
                University
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('industry@setu.jharkhand.gov.in')}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  background: 'rgba(235, 167, 86, 0.1)',
                  border: '1px solid rgba(235, 167, 86, 0.3)',
                  outline: 'none',
                  color: '#EBA756',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                title="Amitabh Choudhury · Tata Steel CSR Demo (industry@setu.jharkhand.gov.in)"
              >
                Industry
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('admin@setu.jharkhand.gov.in')}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  background: 'rgba(141, 207, 169, 0.1)',
                  border: '1px solid rgba(141, 207, 169, 0.3)',
                  outline: 'none',
                  color: '#8DCFA9',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                title="Dr. Subhashish Roy, IAS · State Admin (admin@setu.jharkhand.gov.in)"
              >
                Admin
              </button>
            </div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8', textAlign: 'center', marginTop: '8px' }}>
              Demo Password: <code style={{ color: '#00F2FE' }}>setu123</code>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 250,
            backgroundColor: 'rgba(7, 7, 10, 0.88)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowForgotModal(false)}
        >
          <div 
            style={{
              maxWidth: '440px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '30px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 650, color: '#FAF8F5', marginBottom: '8px' }}>
              Reset SETU Account Password
            </h3>
            <p style={{ fontSize: '13.5px', color: '#B8B3AA', lineHeight: 1.5, marginBottom: '20px' }}>
              Enter your registered official email to receive private reset instructions.
            </p>

            {resetSuccess ? (
              <div>
                <div 
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(141, 207, 169, 0.12)',
                    border: '1px solid rgba(141, 207, 169, 0.3)',
                    color: '#8DCFA9',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}
                >
                  ✓ {resetSuccess}
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Return to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="citizen@setu.jharkhand.gov.in"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(12, 12, 16, 0.8)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#FAF8F5',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={{ background: 'transparent', border: 'none', color: '#B8B3AA', cursor: 'pointer', fontSize: '13.5px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="btn-primary"
                    style={{ fontSize: '13.5px', padding: '9px 18px' }}
                  >
                    <span>{resetLoading ? 'Sending...' : 'Send reset link'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SignupPage({ onNavigate }) {
  const [role, setRole] = useState('CITIZEN'); // 'CITIZEN' | 'UNIVERSITY' | 'INDUSTRY'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Citizen specific fields
  const [selectedDistrict, setSelectedDistrict] = useState('Ranchi');
  const [selectedBlock, setSelectedBlock] = useState('Kanke');
  const [panchayat, setPanchayat] = useState('');

  // University specific fields
  const [institution, setInstitution] = useState('Birla Institute of Technology (BIT), Mesra');
  const [department, setDepartment] = useState('Department of Water Resources & Civil Engineering');
  const [title, setTitle] = useState('Faculty Coordinator / Researcher');
  const [specialization, setSpecialization] = useState('Water Resources');

  // Industry specific fields
  const [organization, setOrganization] = useState('');
  const [csrFocus, setCsrFocus] = useState('Rural Livelihoods');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update blocks when district changes
  const activeDistrictObj = JHARKHAND_DISTRICTS.find(d => d.name === selectedDistrict) || JHARKHAND_DISTRICTS[0];
  const blockList = activeDistrictObj ? activeDistrictObj.blocks : ['Central Block'];

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    const dObj = JHARKHAND_DISTRICTS.find(d => d.name === dist);
    if (dObj && dObj.blocks.length > 0) {
      setSelectedBlock(dObj.blocks[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: fullName,
        email,
        password,
        role,
        district: selectedDistrict,
        block: selectedBlock,
        panchayat: panchayat || `${selectedBlock} Panchayat`,
        phone: phone || '+91-9431000000',
        institution: role === 'UNIVERSITY' ? institution : '',
        department: role === 'UNIVERSITY' ? department : '',
        title: role === 'UNIVERSITY' ? title : '',
        organization: role === 'INDUSTRY' ? organization : '',
        specializations: role === 'UNIVERSITY' ? [specialization] : (role === 'INDUSTRY' ? [csrFocus] : [])
      };

      const res = await signUp(payload);
      setLoading(false);

      if (res.success && res.user) {
        if (role === 'CITIZEN') {
          onNavigate('/citizen');
        } else if (role === 'INDUSTRY') {
          onNavigate('/industry');
        } else {
          onNavigate('/journey');
        }
      } else {
        setError(res.error || 'Failed to create stakeholder account.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration error. Please try again.');
    }
  };

  return (
    <div 
      style={{ 
        paddingTop: '110px', 
        minHeight: '100vh', 
        backgroundColor: '#07070A', 
        paddingBottom: '80px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Radial Accent */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.08) 0%, rgba(141, 207, 169, 0.03) 45%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '580px', width: '100%', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <AssistantOrb size={60} state="idle" />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 650, color: '#FAF8F5', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Create SETU Innovation Account
          </h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.5 }}>
            Join Jharkhand's 4-stakeholder ecosystem connecting citizens, universities, and industry.
          </p>
        </div>

        {/* Stakeholder Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setRole('CITIZEN')}
            style={{
              padding: '10px 8px',
              borderRadius: '12px',
              background: role === 'CITIZEN' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.04)',
              border: role === 'CITIZEN' ? '1px solid #00F2FE' : '1px solid rgba(255,255,255,0.08)',
              color: role === 'CITIZEN' ? '#00F2FE' : '#94A3B8',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <User size={16} />
            <span>Citizen / PRI</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('UNIVERSITY')}
            style={{
              padding: '10px 8px',
              borderRadius: '12px',
              background: role === 'UNIVERSITY' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.04)',
              border: role === 'UNIVERSITY' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
              color: role === 'UNIVERSITY' ? '#38BDF8' : '#94A3B8',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <GraduationCap size={16} />
            <span>University / HEI</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('INDUSTRY')}
            style={{
              padding: '10px 8px',
              borderRadius: '12px',
              background: role === 'INDUSTRY' ? 'rgba(235, 167, 86, 0.15)' : 'rgba(255,255,255,0.04)',
              border: role === 'INDUSTRY' ? '1px solid #EBA756' : '1px solid rgba(255,255,255,0.08)',
              color: role === 'INDUSTRY' ? '#EBA756' : '#94A3B8',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Building2 size={16} />
            <span>Industry / CSR</span>
          </button>
        </div>

        {/* Signup Form Card */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '30px 26px', 
            borderRadius: '24px',
            background: 'rgba(22, 21, 30, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
          }}
        >
          {error && (
            <div 
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} flexShrink={0} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rameshwar Mahato"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FAF8F5',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91-9431100000"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FAF8F5',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                {role === 'UNIVERSITY' ? 'University / Academic Email *' : (role === 'INDUSTRY' ? 'Corporate / Work Email *' : 'Email Address *')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@jharkhand.gov.in / name@institution.edu"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: 'rgba(12, 12, 16, 0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#FAF8F5',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Passwords */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FAF8F5',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#FAF8F5',
                    fontSize: '13.5px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'CITIZEN' && (
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.15)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '12px', fontWeight: 650, color: '#00F2FE', marginBottom: '10px' }}>
                  Jharkhand Community Administrative Jurisdiction
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>District (24 Districts)</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: '#121218',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FAF8F5',
                        fontSize: '13px'
                      }}
                    >
                      {JHARKHAND_DISTRICTS.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>Block / Tehsil</label>
                    <select
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: '#121218',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FAF8F5',
                        fontSize: '13px'
                      }}
                    >
                      {blockList.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>Gram Panchayat / Ward</label>
                  <input
                    type="text"
                    value={panchayat}
                    onChange={(e) => setPanchayat(e.target.value)}
                    placeholder="e.g. Jama Gram Panchayat"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      background: '#121218',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
            )}

            {role === 'UNIVERSITY' && (
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.15)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '12px', fontWeight: 650, color: '#38BDF8', marginBottom: '10px' }}>
                  Higher Education Institution (HEI) Profile
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>Institution Name</label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      background: '#121218',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13px'
                    }}
                  >
                    <option value="Birla Institute of Technology (BIT), Mesra">Birla Institute of Technology (BIT), Mesra</option>
                    <option value="IIT (ISM) Dhanbad">IIT (ISM) Dhanbad</option>
                    <option value="Birsa Agricultural University (BAU), Ranchi">Birsa Agricultural University (BAU), Ranchi</option>
                    <option value="NIT Jamshedpur">NIT Jamshedpur</option>
                    <option value="Sido Kanhu Murmu University (SKMU), Dumka">Sido Kanhu Murmu University (SKMU), Dumka</option>
                    <option value="Ranchi University">Ranchi University</option>
                    <option value="Vinoba Bhave University, Hazaribagh">Vinoba Bhave University, Hazaribagh</option>
                    <option value="Kolhan University, Chaibasa">Kolhan University, Chaibasa</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Civil Engineering"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: '#121218',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FAF8F5',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>Thematic Specialization</label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        background: '#121218',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FAF8F5',
                        fontSize: '13px'
                      }}
                    >
                      {THEMATIC_DOMAINS.map(td => (
                        <option key={td} value={td}>{td}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {role === 'INDUSTRY' && (
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(235, 167, 86, 0.05)', border: '1px solid rgba(235, 167, 86, 0.15)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '12px', fontWeight: 650, color: '#EBA756', marginBottom: '10px' }}>
                  Corporate / CSR Partner Registration
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>Company / CSR Foundation Name *</label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Tata Steel Foundation / CCL CSR Division"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      background: '#121218',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', color: '#CBD5E1', marginBottom: '4px' }}>Priority CSR Mandate</label>
                  <select
                    value={csrFocus}
                    onChange={(e) => setCsrFocus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      background: '#121218',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13px'
                    }}
                  >
                    {THEMATIC_DOMAINS.map(td => (
                      <option key={td} value={td}>{td}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                padding: '12px',
                fontSize: '14.5px',
                fontWeight: 650,
                marginBottom: '1.25rem' 
              }}
            >
              <span>{loading ? 'Registering with State Registry...' : `Register as ${role === 'CITIZEN' ? 'Citizen / Community' : (role === 'UNIVERSITY' ? 'University Researcher' : 'Industry Partner')}`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Already have an account */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>
              Already registered?{' '}
            </span>
            <button
              onClick={() => onNavigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#00F2FE',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign in to your portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
