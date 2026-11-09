import React from 'react';
import { ArrowRight, Layers, ShieldCheck, Sparkles, Building2, GraduationCap, Cpu, Award } from 'lucide-react';

export default function AboutPage({ onNavigate }) {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#080C14', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 3rem)' }}>
        {/* Header */}
        <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '9999px',
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              fontSize: '12.5px',
              color: '#00F2FE',
              marginBottom: '1.25rem',
            }}
          >
            Smart India Hackathon 2026 • PS ID 26043 • Team codemasts
          </div>
          <h1 
            style={{
              fontSize: 'clamp(34px, 4.5vw, 56px)',
              fontWeight: 650,
              color: '#F8FAFC',
              fontFamily: 'var(--font-editorial)',
              lineHeight: 1.15,
              maxWidth: '860px',
              margin: '0 auto 1.5rem',
            }}
          >
            Connecting Jharkhand’s Societal Challenges with University & Industry Innovation.
          </h1>
          <p style={{ fontSize: '17px', color: '#94A3B8', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            Official platform developed for the Department of Higher & Technical Education, Government of Jharkhand to crowdsource local societal issues and facilitate collaborative problem-solving across Higher Education Institutions (HEIs) and industry partners under NEP 2020.
          </p>
        </div>

        {/* 4-Pillar Convergence Card */}
        <div 
          style={{
            padding: '40px',
            borderRadius: '24px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            marginBottom: '4rem',
            backdropFilter: 'blur(16px)',
          }}
        >
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#00F2FE', marginBottom: '24px', textAlign: 'center' }}>
            The 4 Pillars of SETU Quadruple-Helix Ecosystem
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>1. Citizens & PRIs</div>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                Gram Panchayats, Urban Local Bodies, and citizens submit challenges with multimedia evidence & GPS coordinates.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#00F2FE', marginBottom: '6px' }}>2. AI Management</div>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                Categorization across 10 domains, deduplication scans, priority scoring, and university routing.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#C7B8F5', marginBottom: '6px' }}>3. HEIs & Faculty</div>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                Multidisciplinary student-faculty teams (BIT Mesra, NIT, BAU) engineer solutions & file patents.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#EBA756', marginBottom: '6px' }}>4. Industry & CSR</div>
              <p style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                Tata Steel CSR, CCL, SAIL, and MSMEs pledge funding, provide mentorship, and scale field deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Alignment with NEP 2020 */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '36px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 600, color: '#F8FAFC', marginBottom: '12px' }}>
            Aligned with National Education Policy (NEP) 2020
          </h3>
          <p style={{ fontSize: '14.5px', color: '#94A3B8', maxWidth: '700px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            NEP 2020 emphasizes experiential learning, multidisciplinary research, innovation hubs, industry collaboration, and active community engagement. SETU operationalizes these core directives.
          </p>
          <button
            onClick={() => onNavigate('/chat')}
            style={{
              background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px 28px',
              color: '#080C14',
              fontSize: '14px',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            Explore Platform Features
          </button>
        </div>
      </div>
    </div>
  );
}
