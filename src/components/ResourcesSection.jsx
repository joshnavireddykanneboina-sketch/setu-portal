import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  FileText, 
  ChevronRight, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Building2,
  Award,
  Cpu,
  MapPin,
  Layers
} from 'lucide-react';

export default function ResourcesSection({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeResource, setActiveResource] = useState(null);

  const filters = [
    'All',
    'NEP 2020 Guidelines',
    'HEI R&D Grants',
    'Patent & IP Filing',
    'PRI & Citizen Guide',
    'CSR Sponsorship'
  ];

  const resources = [
    {
      id: 1,
      title: 'NEP 2020 Experiential Learning & Academic Credit Framework',
      category: 'NEP 2020 Guidelines',
      type: 'Policy Playbook',
      duration: '5 min read',
      icon: GraduationCap,
      accentColor: '#00F2FE',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      summary: 'Guidelines for Jharkhand Higher Education Institutions (HEIs) to award academic R&D credits to students working on verified societal challenges.',
      content: 'Under NEP 2020 directives, students participating in SETU multidisciplinary solution teams earn core academic credits. Faculty advisors receive institutional innovation points for mentoring real-world community technology projects.',
    },
    {
      id: 2,
      title: 'HEI R&D Lab & Prototyping Grant Manual',
      category: 'HEI R&D Grants',
      type: 'Grant Guide',
      duration: '7 min read',
      icon: Layers,
      accentColor: '#C7B8F5',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      summary: 'How university research labs can apply for up to ₹15 Lakhs in prototyping grants, lab equipment access, and field testing budgets.',
      content: 'Higher Education Institutions assigned to high-priority societal challenges can request lab prototyping grants directly through the SETU portal. Grants are co-funded by the Department of Higher & Technical Education and corporate CSR partners.',
    },
    {
      id: 3,
      title: 'University Patent & Intellectual Property (IP) Filing Playbook',
      category: 'Patent & IP Filing',
      type: 'Legal Playbook',
      duration: '6 min read',
      icon: Award,
      accentColor: '#8DCFA9',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      summary: 'Step-by-step legal procedure for student-faculty teams to register Indian patents and launch university spinoff startups.',
      content: 'SETU provides expedited patent filing support for innovations developed through the portal. Co-ownership rights remain with the student-faculty team and the university incubation cell.',
    },
    {
      id: 4,
      title: 'PRI & Village Community Problem Reporting Toolkit',
      category: 'PRI & Citizen Guide',
      type: 'Community Guide',
      duration: '4 min read',
      icon: MapPin,
      accentColor: '#EBA756',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c572?auto=format&fit=crop&w=600&q=80',
      summary: 'Best practices for Panchayati Raj Institutions (PRIs) and citizens to submit societal challenges with photos, video proof & GPS locations.',
      content: 'To ensure rapid AI classification, submit clear photographs of the problem site, record a 60-second voice note in Hindi or Santhali explaining the population impact, and drop an exact GPS map pin.',
    },
    {
      id: 5,
      title: 'Corporate CSR Partnership & Co-Development Charter',
      category: 'CSR Sponsorship',
      type: 'Industry Charter',
      duration: '8 min read',
      icon: Building2,
      accentColor: '#38BDF8',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      summary: 'How Tata Steel CSR, CCL, SAIL, and local MSMEs co-fund, mentor, and sponsor field pilot testing across Jharkhand districts.',
      content: 'Corporate entities gain direct access to validated HEI engineering prototypes, tax-exempt CSR allocation channels, and measurable social impact dashboards verified by the Government of Jharkhand.',
    },
  ];

  const filteredResources = resources.filter(res => {
    const matchesFilter = activeFilter === 'All' || res.category === activeFilter;
    const matchesQuery = !searchQuery.trim() || 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      res.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <section 
      style={{
        padding: '90px clamp(1.5rem, 5vw, 4.5rem)',
        backgroundColor: '#080C14',
        minHeight: '100vh',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
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
            <span>Policy Playbooks & Innovation Resources</span>
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
            SETU Guidelines, NEP 2020 Frameworks <br />
            <span style={{ color: '#00F2FE', fontStyle: 'italic', fontWeight: 400 }}>& Patent Filing Playbooks.</span>
          </h2>

          <p style={{ fontSize: '15.5px', color: '#94A3B8', lineHeight: 1.6 }}>
            Authoritative documentation for citizens, university faculty, student leads, and industry CSR partners collaborating on the SETU portal.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', background: 'rgba(15,23,42,0.7)', padding: '16px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Category Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  background: activeFilter === filter ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: activeFilter === filter ? '1px solid #00F2FE' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '9999px',
                  padding: '7px 16px',
                  color: activeFilter === filter ? '#00F2FE' : '#94A3B8',
                  fontSize: '13px',
                  fontWeight: activeFilter === filter ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} color="#00F2FE" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playbooks & guides..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '8px 12px 8px 36px',
                color: '#F8FAFC',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Resources Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
          {filteredResources.map(res => {
            const IconComponent = res.icon;
            return (
              <div
                key={res.id}
                onClick={() => setActiveResource(res)}
                style={{
                  background: 'rgba(19, 27, 46, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '22px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  backdropFilter: 'blur(16px)',
                  transition: 'all 250ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,242,254,0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'relative', height: '160px', width: '100%', backgroundColor: '#131B2E', overflow: 'hidden' }}>
                  <img src={res.image} alt={res.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(19,27,46,0.95) 100%)' }} />
                  
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(8,12,20,0.85)', color: res.accentColor, border: `1px solid ${res.accentColor}40`, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '9999px' }}>
                    {res.category}
                  </span>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: res.accentColor }}>
                    <IconComponent size={15} color={res.accentColor} />
                    <span>{res.type} • {res.duration}</span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#F8FAFC', lineHeight: 1.35 }}>
                    {res.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.55 }}>
                    {res.summary}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#00F2FE' }}>
                    <span>Read Guide</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Detail Modal */}
      {activeResource && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(8,12,20,0.88)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setActiveResource(null)}
        >
          <div 
            style={{ maxWidth: '640px', width: '100%', background: '#0F172A', borderRadius: '24px', border: '1px solid rgba(0,242,254,0.3)', padding: '28px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setActiveResource(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <span style={{ fontSize: '12px', color: '#00F2FE', background: 'rgba(0,242,254,0.1)', padding: '3px 10px', borderRadius: '9999px', fontWeight: 600 }}>
              {activeResource.category}
            </span>
            <h3 style={{ fontSize: '20px', color: '#F8FAFC', marginTop: '10px', marginBottom: '14px', lineHeight: 1.3 }}>
              {activeResource.title}
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.65, marginBottom: '20px' }}>
              {activeResource.content}
            </p>
            <button onClick={() => setActiveResource(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '9999px', padding: '8px 20px', color: '#F8FAFC', fontSize: '13px', cursor: 'pointer' }}>
              Close Guide
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
