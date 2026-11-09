import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HowItWorksSection from './components/HowItWorksSection';
import SupportGrid from './components/SupportGrid';
import ChatInterface from './components/ChatInterface';
import MyJourneyView from './components/MyJourneyView';
import StoriesSection from './components/StoriesSection';
import ResourcesSection from './components/ResourcesSection';
import CounsellingPage from './pages/CounsellingPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import HelpPage from './pages/HelpPage';
import PrivacyPage from './pages/PrivacyPage';
import CitizenPortalPage from './pages/CitizenPortalPage';
import IndustryPortalPage from './pages/IndustryPortalPage';
import AdminPortalPage from './pages/AdminPortalPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import NotFoundPage from './pages/NotFoundPage';
import FooterCTA from './components/FooterCTA';
import MobileBottomNav from './components/MobileBottomNav';
import MobileTopHeader from './components/MobileTopHeader';
import { Search, X, Sparkles, PhoneCall, ShieldAlert } from 'lucide-react';
import { getCurrentUser, subscribeAuth } from './services/authService';

export default function App() {
  const [route, setRoute] = useState(window.location.pathname || '/');
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');
  const [chatInitialDept, setChatInitialDept] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    return subscribeAuth((u) => {
      setCurrentUser(u);
    });
  }, []);

  // Handle browser back/forward buttons (web) and Android hardware back button (native).
  // nativeShell.js calls window.__SETU_ON_BACK__() when the Android back button is pressed.
  // On the home route '/' we let the OS exit the app (handled by nativeShell calling App.exitApp).
  useEffect(() => {
    const onPopState = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);

    // Android hardware back button — go back one step in history, or close search/modals.
    window.__SETU_ON_BACK__ = () => {
      if (searchModalOpen) {
        setSearchModalOpen(false);
        return;
      }
      if (window.history.length > 1 && window.location.pathname !== '/') {
        window.history.back();
      }
      // If we are at '/', nativeShell falls through to App.exitApp().
    };

    return () => {
      window.removeEventListener('popstate', onPopState);
      delete window.__SETU_ON_BACK__;
    };
  }, [searchModalOpen]);

  const navigate = (newRoute) => {
    window.history.pushState({}, '', newRoute);
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChatWithPrompt = (promptText) => {
    setChatInitialPrompt(promptText);
    navigate('/chat');
  };

  const handleSelectDepartment = (deptName) => {
    setChatInitialDept(deptName);
    navigate('/chat');
  };

  const searchableItems = [
    { title: 'Citizen & PRI Community Portal', desc: 'Submit community issues, capture GPS, track status across 24 Jharkhand districts', route: '/citizen' },
    { title: 'Submit Societal Challenge', desc: 'Submit local community issues with photos, video, audio & GPS', route: '/chat' },
    { title: 'Explore Jharkhand Challenges', desc: 'Water resources, agriculture, healthcare, clean energy issues', route: '/support' },
    { title: 'University R&D Collaboration Hub', desc: 'BIT Mesra, NIT, BAU, IIT-ISM student & faculty project teams', route: '/journey' },
    { title: 'Industry & CSR Partnership Portal', desc: 'Tata Steel CSR, CCL, SAIL Bokaro co-development & grants', route: '/industry' },
    { title: 'State Governance Analytics Cockpit', desc: 'Dept. of Higher & Technical Education real-time metrics', route: '/admin' },
    { title: 'Data Governance & Privacy Guidelines', desc: 'How SETU secures citizen and institutional innovation data', route: '/privacy' },
  ];

  const filteredSearch = searchQuery.trim()
    ? searchableItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchableItems.slice(0, 4);

  // Render appropriate view based on route
  const renderCurrentRoute = () => {
    switch (route) {
      case '/':
        return <HomePage onNavigate={navigate} onStartChat={handleStartChatWithPrompt} />;
      
      case '/how-it-works':
        return (
          <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-darker)' }}>
            <HowItWorksSection onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </div>
        );

      case '/support':
        return (
          <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
            <SupportGrid onNavigate={navigate} onSelectDepartment={handleSelectDepartment} />
            <FooterCTA onNavigate={navigate} />
          </div>
        );

      case '/citizen':
        if (!currentUser) return <LoginPage onNavigate={navigate} />;
        return (
          <>
            <CitizenPortalPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/chat':
        if (!currentUser) return <LoginPage onNavigate={navigate} />;
        return (
          <ChatInterface 
            initialPrompt={chatInitialPrompt} 
            initialDept={chatInitialDept}
            onNavigate={navigate} 
          />
        );

      case '/student':
        if (!currentUser) return <LoginPage onNavigate={navigate} />;
        if (currentUser.role === 'CITIZEN') {
          return (
            <>
              <CitizenPortalPage onNavigate={navigate} />
              <FooterCTA onNavigate={navigate} />
            </>
          );
        }
        if (currentUser.role === 'INDUSTRY') {
          return (
            <>
              <IndustryPortalPage onNavigate={navigate} />
              <FooterCTA onNavigate={navigate} />
            </>
          );
        }
        if (currentUser.role === 'ADMIN' || currentUser.role === 'GOVERNMENT') {
          return (
            <>
              <AdminPortalPage onNavigate={navigate} />
              <FooterCTA onNavigate={navigate} />
            </>
          );
        }
        return (
          <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
            <MyJourneyView onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </div>
        );

      case '/stories':
        return (
          <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-darker)' }}>
            <StoriesSection onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </div>
        );

      case '/resources':
        return (
          <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
            <ResourcesSection onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </div>
        );

      case '/mentors':
      case '/counselling':
        return (
          <>
            <CounsellingPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/schedule':
      case '/appointments':
        if (!currentUser) return <LoginPage onNavigate={navigate} />;
        return (
          <>
            <AppointmentsPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/journey':
        if (!currentUser) return <LoginPage onNavigate={navigate} />;
        return (
          <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--bg-deep)' }}>
            <MyJourneyView onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </div>
        );

      case '/profile':
        if (!currentUser) return <LoginPage onNavigate={navigate} />;
        return (
          <>
            <ProfilePage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/settings':
        if (!currentUser) return <LoginPage onNavigate={navigate} />;
        return (
          <>
            <SettingsPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/about':
        return (
          <>
            <AboutPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/help':
        return (
          <>
            <HelpPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/privacy':
        return (
          <>
            <PrivacyPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/industry':
      case '/counsellor':
        if (!currentUser) {
          return <LoginPage onNavigate={navigate} />;
        }
        if (currentUser.role !== 'INDUSTRY' && currentUser.role !== 'COUNSELLOR') {
          return (
            <div style={{ paddingTop: '140px', minHeight: '80vh', textAlign: 'center', padding: '140px 20px 60px' }}>
              <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(28,27,38,0.85)', padding: '40px 30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <ShieldAlert size={36} color="#EBA756" style={{ marginBottom: '14px' }} />
                <h2 style={{ fontSize: '24px', color: '#FAF8F5', marginBottom: '12px' }}>Industry Partner Access</h2>
                <p style={{ fontSize: '14px', color: '#B8B3AA', lineHeight: 1.6, marginBottom: '24px' }}>
                  The Industry & CSR Partnership Portal is restricted to registered industry and CSR partners. You are signed in as <strong style={{ color: '#FAF8F5' }}>{currentUser.name}</strong> ({currentUser.role}).
                </p>
                <button onClick={() => navigate(currentUser.role === 'ADMIN' ? '/admin' : '/journey')} className="btn-primary">
                  Go to your authorized portal →
                </button>
              </div>
            </div>
          );
        }
        return (
          <>
            <IndustryPortalPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/admin':
      case '/admin/routing':
        if (!currentUser) {
          return <LoginPage onNavigate={navigate} />;
        }
        if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GOVERNMENT') {
          return (
            <div style={{ paddingTop: '140px', minHeight: '80vh', textAlign: 'center', padding: '140px 20px 60px' }}>
              <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(28,27,38,0.85)', padding: '40px 30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <ShieldAlert size={36} color="#EBA756" style={{ marginBottom: '14px' }} />
                <h2 style={{ fontSize: '24px', color: '#FAF8F5', marginBottom: '12px' }}>Administrative Access Restricted</h2>
                <p style={{ fontSize: '14px', color: '#B8B3AA', lineHeight: 1.6, marginBottom: '24px' }}>
                  The State Innovation Operations Cockpit is restricted to Department of Higher & Technical Education leadership. You are signed in as <strong style={{ color: '#FAF8F5' }}>{currentUser.name}</strong> ({currentUser.role}).
                </p>
                <button onClick={() => navigate(currentUser.role === 'INDUSTRY' ? '/industry' : '/journey')} className="btn-primary">
                  Go to your authorized portal →
                </button>
              </div>
            </div>
          );
        }
        return (
          <>
            <AdminPortalPage onNavigate={navigate} />
            <FooterCTA onNavigate={navigate} />
          </>
        );

      case '/login':
        return <LoginPage onNavigate={navigate} />;

      case '/signup':
        return <SignupPage onNavigate={navigate} />;

      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="setu-app-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
      {/* Mobile Top Header (<= 768px) */}
      <MobileTopHeader 
        onNavigate={navigate} 
        onOpenSearch={() => setSearchModalOpen(true)} 
      />

      {/* Desktop Navigation Bar (> 768px) */}
      <div className="desktop-navbar">
        <Navbar 
          currentRoute={route} 
          onNavigate={navigate} 
          onOpenSearch={() => setSearchModalOpen(true)}
        />
      </div>

      {/* Main View */}
      <main>
        {renderCurrentRoute()}
      </main>

      {/* Mobile Bottom Navigation (<= 768px) */}
      <MobileBottomNav 
        currentRoute={route} 
        onNavigate={navigate} 
      />

      {/* Global Quick Search Modal */}
      {searchModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(7, 7, 10, 0.88)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '120px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
          onClick={() => setSearchModalOpen(false)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '620px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                gap: '12px',
              }}
            >
              <Search size={18} color="#8EDCF2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 12 departments, resources, or services..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#F5F4F2',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                }}
              />
              <button 
                onClick={() => setSearchModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#9BA4B5', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div style={{ padding: '12px 14px', maxHeight: '360px', overflowY: 'auto' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px' }}>
                Quick Matches
              </div>
              {filteredSearch.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchModalOpen(false);
                    navigate(item.route);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#F5F4F2' }}>{item.title}</div>
                  <div style={{ fontSize: '12.5px', color: '#9BA4B5' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '10px 18px', background: 'rgba(5, 8, 15, 0.5)', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
              <span>Press ESC to close</span>
              <span>12 Departments Unified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
