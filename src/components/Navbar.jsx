import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ChevronDown, 
  Sparkles, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Cpu, 
  Check, 
  CheckCircle2, 
  Clock,
  User,
  LogOut,
  Settings,
  Calendar,
  Compass,
  Zap,
  Building2,
  GraduationCap,
  Briefcase,
  BarChart3,
  Flame,
  Users
} from 'lucide-react';
import { 
  getStore, 
  subscribeStore, 
  acceptWaitlistOffer, 
  declineWaitlistOffer, 
  markNotificationRead 
} from '../services/store';
import { getCurrentUser, subscribeAuth, signOut } from '../services/authService';
import { setLanguage, getLanguage, t } from '../services/i18n';

export default function Navbar({ currentRoute = '/', onNavigate, onOpenSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState(getLanguage());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeState, setStoreState] = useState(getStore());
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [reducedMotion, setReducedMotion] = useState(false);

  const langRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    return subscribeStore((updated) => {
      setStoreState({ ...updated });
    });
  }, []);

  useEffect(() => {
    return subscribeAuth((user) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleReducedMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    if (next) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  const role = (currentUser?.role || storeState.currentRole || 'CITIZEN').toUpperCase();
  const notifications = storeState.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { label: 'Home', route: '/' },
    { label: 'Citizen Portal', route: '/citizen' },
    { label: 'Submit Issue', route: '/chat', highlightCyan: true },
    { label: 'Explore Issues', route: '/support' },
    { label: 'University Hub', route: '/journey' },
    { label: 'Industry & CSR', route: '/industry' },
    { label: 'State Analytics', route: '/admin', highlightAmber: true },
  ];

  const handleNavClick = (route) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setProfileDropdown(false);
    onNavigate('/login');
  };

  return (
    <header 
      className={`glass-navbar ${scrolled ? 'scrolled' : ''}`}
      style={{
        padding: scrolled ? '12px clamp(1.2rem, 4vw, 4rem)' : '18px clamp(1.2rem, 4vw, 4rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Brand Logo & Department Subtitle */}
      <div 
        onClick={() => handleNavClick('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0,242,254,0.2) 0%, rgba(56,189,248,0.05) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0,242,254,0.2)',
          }}
        >
          <Cpu size={20} color="#00F2FE" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#F8FAFC',
                fontFamily: 'var(--font-display)',
              }}
            >
              SETU
            </span>
            <span style={{ fontSize: '10px', background: 'rgba(0,242,254,0.15)', color: '#00F2FE', padding: '2px 7px', borderRadius: '4px', border: '1px solid rgba(0,242,254,0.3)', fontWeight: 600 }}>
              SIH 26043
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>
            Dept. of Higher & Technical Education, Govt. of Jharkhand
          </span>
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav 
        className="desktop-nav-links"
        style={{
          display: 'none',
          alignItems: 'center',
          gap: '1.8rem',
        }}
      >
        {navLinks.map((item) => {
          const isActive = currentRoute === item.route;
          let color = '#94A3B8';
          if (isActive) color = '#F8FAFC';
          else if (item.highlightCyan) color = '#00F2FE';
          else if (item.highlightAmber) color = '#EBA756';

          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.route)}
              style={{
                background: item.highlightCyan && !isActive ? 'rgba(0, 242, 254, 0.08)' : 'none',
                border: item.highlightCyan && !isActive ? '1px solid rgba(0, 242, 254, 0.25)' : 'none',
                outline: 'none',
                color,
                fontSize: '13.5px',
                fontWeight: isActive || item.highlightCyan ? 600 : 500,
                cursor: 'pointer',
                padding: item.highlightCyan ? '6px 14px' : '8px 4px',
                borderRadius: item.highlightCyan ? '20px' : '0px',
                position: 'relative',
                transition: 'all 200ms ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F8FAFC')}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = color;
              }}
            >
              {item.label}
              {isActive && !item.highlightCyan && (
                <span 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#00F2FE',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px #00F2FE',
                  }} 
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Responsive Visibility Styles */}
      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 1023px) {
          .desktop-nav-links {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .desktop-only-controls {
            display: none !important;
          }
        }
      `}</style>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick Search */}
        <button
          onClick={onOpenSearch}
          className="desktop-only-controls"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            padding: '7px 16px',
            color: '#94A3B8',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,242,254,0.4)';
            e.currentTarget.style.color = '#F8FAFC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <Search size={14} color="#00F2FE" />
          <span>Search Jharkhand challenges...</span>
          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>⌘K</span>
        </button>

        {/* Reduced Motion Toggle Button */}
        <button
          onClick={toggleReducedMotion}
          title={reducedMotion ? 'Enable smooth motion' : 'Enable reduced motion mode (Accessibility)'}
          style={{
            background: reducedMotion ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: reducedMotion ? '1px solid #00F2FE' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            padding: '7px 12px',
            color: reducedMotion ? '#00F2FE' : '#94A3B8',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Zap size={13} color={reducedMotion ? '#00F2FE' : '#94A3B8'} />
          <span className="desktop-only-controls">{reducedMotion ? 'Motion Off' : 'Reduced Motion'}</span>
        </button>

        {/* Language Selector */}
        <div style={{ position: 'relative' }} ref={langRef}>
          <button
            onClick={() => setLangDropdown(!langDropdown)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              padding: '6px 12px',
              color: '#F8FAFC',
              fontSize: '12.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <span>{selectedLang}</span>
            <ChevronDown size={13} color="#94A3B8" />
          </button>

          {langDropdown && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '140px',
                background: '#0F172A',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '14px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                padding: '6px',
                zIndex: 200,
              }}
            >
              {[
                { code: 'EN', name: 'English' },
                { code: 'HI', name: 'हिंदी (Hindi)' },
                { code: 'SAT', name: 'ᱥᱟᱱᱛᱟᱲᱤ (Santhali)' }
              ].map(l => (
                <div
                  key={l.code}
                  onClick={() => {
                    setSelectedLang(l.code);
                    setLanguage(l.code);
                    setLangDropdown(false);
                  }}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: selectedLang === l.code ? '#00F2FE' : '#94A3B8',
                    fontWeight: selectedLang === l.code ? 600 : 400,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>{l.name}</span>
                  {selectedLang === l.code && <Check size={13} color="#00F2FE" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setNotifDropdown(!notifDropdown)}
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#F8FAFC',
            }}
          >
            <Bell size={16} color="#F8FAFC" />
            {unreadCount > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: '#00F2FE',
                  color: '#080C14',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #080C14',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '340px',
                background: '#0F172A',
                border: '1px solid rgba(0,242,254,0.3)',
                borderRadius: '18px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                padding: '16px',
                zIndex: 200,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>Platform Updates</span>
                <span style={{ fontSize: '11px', color: '#00F2FE' }}>SETU Network</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>
                    No updates yet.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(0,242,254,0.06)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>{n.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Auth Button */}
        {currentUser ? (
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => setProfileDropdown(!profileDropdown)}
              style={{
                background: 'linear-gradient(135deg, rgba(0,242,254,0.2) 0%, rgba(56,189,248,0.1) 100%)',
                border: '1px solid rgba(0,242,254,0.4)',
                borderRadius: '9999px',
                padding: '5px 12px 5px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <div 
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: currentUser.avatarColor || '#00F2FE',
                  color: '#080C14',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentUser.avatarInitials || currentUser.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                {currentUser.name?.split(' ')[0]}
              </span>
              <ChevronDown size={13} color="#94A3B8" />
            </button>

            {profileDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '230px',
                  background: '#0F172A',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '16px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
                  padding: '10px',
                  zIndex: 200,
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#F8FAFC' }}>{currentUser.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#00F2FE' }}>{currentUser.role || 'Stakeholder'}</div>
                </div>

                <div 
                  onClick={() => { setProfileDropdown(false); onNavigate('/citizen'); }}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Users size={15} color="#00F2FE" />
                  <span>Citizen / PRI Portal</span>
                </div>
                <div 
                  onClick={() => { setProfileDropdown(false); onNavigate('/journey'); }}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <GraduationCap size={15} color="#38BDF8" />
                  <span>University Hub</span>
                </div>
                <div 
                  onClick={() => { setProfileDropdown(false); onNavigate('/industry'); }}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Building2 size={15} color="#EBA756" />
                  <span>Industry & CSR Portal</span>
                </div>
                <div 
                  onClick={() => { setProfileDropdown(false); onNavigate('/admin'); }}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <BarChart3 size={15} color="#8DCFA9" />
                  <span>State Analytics Cockpit</span>
                </div>

                <div 
                  onClick={() => { setProfileDropdown(false); onNavigate('/mentors'); }}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Users size={15} color="#8DCFA9" />
                  <span>HEI & CSR Mentors</span>
                </div>
                <div 
                  onClick={() => { setProfileDropdown(false); onNavigate('/profile'); }}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <User size={15} color="#00F2FE" />
                  <span>My Profile & District</span>
                </div>
                <div 
                  onClick={() => { setProfileDropdown(false); onNavigate('/settings'); }}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#94A3B8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <Settings size={15} color="#94A3B8" />
                  <span>Privacy & Storage Settings</span>
                </div>

                <div 
                  onClick={handleSignOut}
                  style={{ padding: '8px 10px', fontSize: '13px', color: '#F87171', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} color="#F87171" />
                  <span>Sign Out</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onNavigate('/login')}
            style={{
              background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 18px',
              color: '#080C14',
              fontSize: '13px',
              fontWeight: 650,
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0,242,254,0.3)',
            }}
          >
            Portal Login
          </button>
        )}

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          style={{
            background: 'none',
            border: 'none',
            color: '#F8FAFC',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            background: '#0E1420',
            borderBottom: '1px solid rgba(0,242,254,0.2)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 150,
          }}
        >
          {navLinks.map(item => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.route)}
              style={{
                background: 'none',
                border: 'none',
                textAlign: 'left',
                color: currentRoute === item.route ? '#00F2FE' : '#F8FAFC',
                fontSize: '16px',
                fontWeight: currentRoute === item.route ? 600 : 400,
                padding: '10px 0',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
