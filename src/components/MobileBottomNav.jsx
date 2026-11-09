// Mobile Bottom Navigation Bar for SETU Platform
// Renders native-app-like bottom navigation on mobile/tablet viewports (<= 768px)
// Supports: Home, Explore, Submit Problem, My Projects, Profile

import React from 'react';
import { 
  Home, 
  Compass, 
  PlusCircle, 
  Layers, 
  User, 
  Sparkles 
} from 'lucide-react';

export default function MobileBottomNav({ currentRoute = '/', onNavigate }) {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      route: '/'
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: Compass,
      route: '/support'
    },
    {
      id: 'submit',
      label: 'Submit',
      icon: PlusCircle,
      route: '/citizen',
      isAction: true // Highlighted center CTA
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Layers,
      route: '/journey'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      route: '/profile'
    }
  ];

  const isItemActive = (item) => {
    if (item.route === '/') return currentRoute === '/';
    if (item.id === 'submit') return currentRoute === '/citizen';
    if (item.id === 'projects') return currentRoute === '/journey' || currentRoute === '/student';
    return currentRoute.startsWith(item.route);
  };

  return (
    <nav 
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        backgroundColor: 'rgba(8, 12, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 12px calc(8px + env(safe-area-inset-bottom, 8px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.5)'
      }}
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item);

        if (item.isAction) {
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.route)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0 8px',
                position: 'relative',
                top: '-12px'
              }}
              aria-label="Submit Societal Problem"
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0, 242, 254, 0.4), 0 0 12px rgba(0, 242, 254, 0.2)',
                  border: '3px solid #080C14',
                  transition: 'transform 0.15s ease'
                }}
              >
                <PlusCircle size={26} color="#080C14" strokeWidth={2.4} />
              </div>
              <span 
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: active ? '#00F2FE' : '#94A3B8',
                  marginTop: '2px',
                  letterSpacing: '0.02em'
                }}
              >
                Submit
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.route)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              minWidth: '56px',
              borderRadius: '12px',
              transition: 'background-color 0.15s ease',
              color: active ? '#00F2FE' : '#94A3B8'
            }}
            aria-current={active ? 'page' : undefined}
          >
            <div style={{ position: 'relative' }}>
              <Icon 
                size={20} 
                strokeWidth={active ? 2.4 : 1.8} 
                color={active ? '#00F2FE' : '#94A3B8'} 
              />
              {active && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#00F2FE',
                    boxShadow: '0 0 6px #00F2FE'
                  }}
                />
              )}
            </div>
            <span 
              style={{
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                marginTop: '4px',
                color: active ? '#00F2FE' : '#94A3B8',
                letterSpacing: '0.01em'
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
