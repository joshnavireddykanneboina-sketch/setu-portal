import React from 'react';
import { ArrowRight, ShieldCheck, Heart, Sparkles, Building2, Cpu, GraduationCap } from 'lucide-react';

export default function FooterCTA({ onNavigate }) {
  return (
    <footer 
      style={{
        position: 'relative',
        backgroundColor: '#080C14',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Cyan Glow Background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1200px',
          height: '300px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 242, 254, 0.1) 0%, rgba(56, 189, 248, 0.04) 50%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      <div 
        style={{
          position: 'relative',
          padding: 'clamp(4rem, 7vw, 6rem) clamp(1.5rem, 5vw, 4rem)',
          maxWidth: '1320px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(0, 242, 254, 0.08)',
            color: '#00F2FE',
            fontSize: '12.5px',
            fontWeight: 500,
            marginBottom: '1.2rem',
            border: '1px solid rgba(0, 242, 254, 0.25)',
          }}
        >
          <Cpu size={14} color="#00F2FE" />
          <span>Government of Jharkhand • Department of Higher & Technical Education</span>
        </div>

        <h2 
          style={{
            fontSize: 'clamp(32px, 4.5vw, 56px)',
            lineHeight: 1.15,
            color: '#F8FAFC',
            fontFamily: 'var(--font-editorial)',
            maxWidth: '850px',
            marginBottom: '1.2rem',
          }}
        >
          Transforming Community Challenges into <br />
          <span style={{ color: '#00F2FE', fontStyle: 'italic' }}>Real-World Technological Solutions.</span>
        </h2>

        <p 
          style={{
            fontSize: 'clamp(15px, 1.1vw, 17px)',
            lineHeight: 1.6,
            color: '#94A3B8',
            maxWidth: '650px',
            marginBottom: '2.2rem',
          }}
        >
          Empowering citizens, Panchayati Raj Institutions, universities, and industry partners to collaborate for demand-driven innovation under NEP 2020.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', alignItems: 'center', marginBottom: '3.5rem' }}>
          <button
            onClick={() => onNavigate('/chat')}
            style={{
              background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '13px 30px',
              color: '#080C14',
              fontSize: '14.5px',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 25px rgba(0,242,254,0.3)',
            }}
          >
            <span>Submit a Societal Challenge</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={() => onNavigate('/support')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              padding: '13px 24px',
              color: '#F8FAFC',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Explore Live Projects
          </button>
        </div>

        {/* Footer Navigation Bar & Copyright */}
        <div 
          style={{
            width: '100%',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '13px',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.1em' }}>SETU</span>
            <span>• Smart India Hackathon 2026 • Problem Statement ID 26043 (Team codemasts)</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <span onClick={() => onNavigate('/')} style={{ cursor: 'pointer' }}>Home</span>
            <span onClick={() => onNavigate('/support')} style={{ cursor: 'pointer' }}>Explore Challenges</span>
            <span onClick={() => onNavigate('/journey')} style={{ cursor: 'pointer' }}>University Hub</span>
            <span onClick={() => onNavigate('/mentors')} style={{ cursor: 'pointer' }}>Mentors</span>
            <span onClick={() => onNavigate('/admin')} style={{ cursor: 'pointer' }}>State Analytics</span>
            <span onClick={() => onNavigate('/privacy')} style={{ cursor: 'pointer' }}>Privacy</span>
            <span onClick={() => onNavigate('/about')} style={{ cursor: 'pointer' }}>About PS 26043</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
