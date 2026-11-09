import React from 'react';
import { 
  Users, 
  Cpu, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function HowItWorksSection({ onNavigate }) {
  const steps = [
    {
      step: '01',
      title: 'Citizen & PRI Crowdsourcing',
      role: 'Citizens, Panchayati Raj & Local Bodies',
      desc: 'Submit local societal issues through an intuitive web & mobile interface with multimedia evidence (photos, videos/audio, GPS map tags, and documents).',
      icon: Users,
      color: '#00F2FE',
      bg: 'rgba(0, 242, 254, 0.1)',
      badge: 'Multilingual (HI/EN/SAT)'
    },
    {
      step: '02',
      title: 'AI Classification & Deduplication',
      role: 'SETU Intelligence Engine',
      desc: 'Automatically categorizes problems across 10 thematic domains, performs semantic similarity scans to prevent duplicate work, and computes priority scores.',
      icon: Cpu,
      color: '#38BDF8',
      bg: 'rgba(56, 189, 248, 0.1)',
      badge: 'Semantic Matching'
    },
    {
      step: '03',
      title: 'HEI Matching & Team Formation',
      role: 'Higher Education Institutions',
      desc: 'Routes validated problems to relevant universities (BIT Mesra, NIT, IIT-ISM, BAU). Multidisciplinary student & faculty teams form to engineer solutions.',
      icon: GraduationCap,
      color: '#C7B8F5',
      bg: 'rgba(199, 184, 245, 0.1)',
      badge: 'Multidisciplinary R&D'
    },
    {
      step: '04',
      title: 'Industry CSR & Mentorship',
      role: 'Industry & CSR Partners',
      desc: 'Industries (Tata Steel CSR, CCL, SAIL, MSMEs) review high-priority prototypes, pledge grants, assign technical mentors, and support pilot manufacturing.',
      icon: Building2,
      color: '#EBA756',
      bg: 'rgba(235, 167, 86, 0.1)',
      badge: 'CSR & Prototyping Grants'
    },
    {
      step: '05',
      title: 'Field Deployment & Patents',
      role: 'Statewide Impact',
      desc: 'Prototypes undergo village field testing, community validation, intellectual property (patent) filing, startup incubation, and state government reporting.',
      icon: CheckCircle2,
      color: '#8DCFA9',
      bg: 'rgba(141, 207, 169, 0.1)',
      badge: 'Measurable Social Outcome'
    }
  ];

  return (
    <section 
      style={{
        padding: '100px clamp(1.5rem, 5vw, 4.5rem)',
        backgroundColor: '#0E1420',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div 
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3.5rem',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '9999px',
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              fontSize: '12px',
              color: '#00F2FE',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            <Sparkles size={13} color="#00F2FE" />
            <span>Demand-Driven Innovation Workflow</span>
          </div>

          <h2 
            style={{
              fontSize: 'clamp(32px, 3.5vw, 48px)',
              lineHeight: 1.15,
              fontWeight: 600,
              color: '#F8FAFC',
              fontFamily: 'var(--font-editorial)',
              marginBottom: '14px',
            }}
          >
            From Ground-Level Challenges to <br />
            <span style={{ color: '#00F2FE', fontStyle: 'italic', fontWeight: 400 }}>Statewide Scalable Impact.</span>
          </h2>

          <p style={{ fontSize: '15.5px', color: '#94A3B8', lineHeight: 1.6 }}>
            SETU creates a structured, transparent bridge between citizens, higher education research capacity, industry financial resources, and government governance.
          </p>
        </div>

        {/* 5-Step Connected Flow Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            position: 'relative',
          }}
        >
          {steps.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.step}
                style={{
                  background: 'rgba(19, 27, 46, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 250ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: item.bg,
                      border: `1px solid ${item.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComp size={20} color={item.color} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: item.color, background: item.bg, padding: '3px 8px', borderRadius: '6px' }}>
                    {item.step}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: item.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.badge}
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#F8FAFC', lineHeight: 1.3 }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.55, flex: 1 }}>
                  {item.desc}
                </p>

                <div style={{ fontSize: '11.5px', color: '#64748B', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  Stakeholder: <strong style={{ color: '#F8FAFC' }}>{item.role}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          <button
            onClick={() => onNavigate('/chat')}
            style={{
              background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
              border: 'none',
              borderRadius: '9999px',
              padding: '13px 28px',
              color: '#080C14',
              fontSize: '14.5px',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)',
            }}
          >
            <span>Submit a Challenge Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
