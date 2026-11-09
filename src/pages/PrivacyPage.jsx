import React from 'react';
import { ShieldCheck, Lock, FileCheck, EyeOff, Server, ArrowRight } from 'lucide-react';

export default function PrivacyPage({ onNavigate }) {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#05080F', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 3rem)' }}>
        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '9999px',
              background: 'rgba(15, 25, 40, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '12.5px',
              color: '#8EDCF2',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={14} />
            <span>Confidentiality & Compliance</span>
          </div>
          <h1 
            style={{
              fontSize: 'clamp(32px, 3.8vw, 52px)',
              fontWeight: 650,
              color: '#F5F4F2',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
            }}
          >
            Privacy by architecture.
          </h1>
          <p style={{ fontSize: '16px', color: '#9BA4B5' }}>
            Tangible guarantees, not marketing slogans. What we collect, how it’s protected, and why you stay in control.
          </p>
        </div>

        {/* 3 Pillared Pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3.5rem' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Lock size={22} color="#00F2FE" />
              <h3 style={{ fontSize: '19px', fontWeight: 600, color: '#F8FAFC' }}>1. Encrypted State Data Storage</h3>
            </div>
            <p style={{ fontSize: '14.5px', color: '#94A3B8', lineHeight: 1.65 }}>
              All societal challenge submissions, GPS coordinates, and media evidence are housed within state encrypted database schemas. No personal citizen data is ever shared with unverified parties.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <EyeOff size={22} color="#38BDF8" />
              <h3 style={{ fontSize: '19px', fontWeight: 600, color: '#F8FAFC' }}>2. Transparent HEI Allocation</h3>
            </div>
            <p style={{ fontSize: '14.5px', color: '#94A3B8', lineHeight: 1.65 }}>
              When challenges are routed to university research labs, AI-synthesized problem summaries ensure student innovation teams receive exact technical parameters without exposing citizen identity.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <FileCheck size={22} color="#EBA756" />
              <h3 style={{ fontSize: '19px', fontWeight: 600, color: '#F8FAFC' }}>3. Government IT & Data Security Compliance</h3>
            </div>
            <p style={{ fontSize: '14.5px', color: '#94A3B8', lineHeight: 1.65 }}>
              All communications and data pipelines adhere to Government of India IT Security frameworks, data privacy rules, and institutional R&D governance policies.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => onNavigate('/settings')} className="btn-secondary" style={{ padding: '12px 24px' }}>
            Manage Your Privacy Controls →
          </button>
        </div>
      </div>
    </div>
  );
}
