import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  Award, 
  ExternalLink,
  Users,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { apiGetChallenges } from '../services/apiClient';
import { getStore } from '../services/store';
import { t } from '../services/i18n';

export default function SupportGrid({ onNavigate, onSelectDepartment }) {
  const [challenges, setChallenges] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalChallenge, setActiveModalChallenge] = useState(null);
  const [, setLangTick] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setLangTick(t => t + 1);
    window.addEventListener('setu-lang-changed', handleLangChange);
    return () => window.removeEventListener('setu-lang-changed', handleLangChange);
  }, []);

  useEffect(() => {
    async function loadData() {
      const serverData = await apiGetChallenges();
      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        setChallenges(serverData);
      } else {
        const local = getStore().challenges || [];
        setChallenges(local);
      }
    }
    loadData();
  }, []);

  const domains = [
    'ALL',
    'Water Resources',
    'Agriculture',
    'Healthcare',
    'Clean Energy',
    'Urban Infrastructure',
    'Rural Livelihoods',
    'Accessibility',
    'Education'
  ];

  const districts = [
    'ALL',
    'Dumka',
    'Ranchi',
    'Dhanbad',
    'East Singhbhum',
    'Khunti',
    'Hazaribagh',
    'Bokaro',
    'Palamu'
  ];

  const filteredChallenges = challenges.filter(c => {
    if (selectedDomain !== 'ALL' && c.domain?.toLowerCase() !== selectedDomain.toLowerCase()) return false;
    if (selectedDistrict !== 'ALL' && c.district?.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      const matchDistrict = c.district?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDistrict) return false;
    }
    return true;
  });

  return (
    <section 
      style={{
        padding: '90px clamp(1.5rem, 5vw, 4.5rem)',
        backgroundColor: '#080C14',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Title Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              fontSize: '12px',
              color: '#00F2FE',
              width: 'fit-content',
            }}
          >
            <Sparkles size={13} color="#00F2FE" />
            <span>Statewide Societal Challenge Repository</span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 600, color: '#F8FAFC', fontFamily: 'var(--font-editorial)' }}>
            {t('explorerTitle')}
          </h2>
          <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '680px' }}>
            {t('explorerSub')}
          </p>
        </div>

        {/* Filter Controls */}
        <div 
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '16px',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} color="#00F2FE" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '9px 14px 9px 38px',
                color: '#F8FAFC',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Domain Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#94A3B8' }}>Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{
                background: '#0F172A',
                border: '1px solid rgba(0,242,254,0.3)',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#F8FAFC',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {domains.map(d => (
                <option key={d} value={d}>{d === 'ALL' ? 'All Thematic Domains' : d}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12.5px', color: '#94A3B8' }}>District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                background: '#0F172A',
                border: '1px solid rgba(0,242,254,0.3)',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#F8FAFC',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {districts.map(d => (
                <option key={d} value={d}>{d === 'ALL' ? 'All Jharkhand Districts' : d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Challenge Cards Gallery */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
          {filteredChallenges.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', background: 'rgba(15,23,42,0.5)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <AlertTriangle size={36} color="#EBA756" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', color: '#F8FAFC', marginBottom: '6px' }}>No matching challenges found</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8' }}>Try adjusting your domain, district, or search terms.</p>
            </div>
          ) : (
            filteredChallenges.map(item => {
              const completedMilestones = item.team?.milestones?.filter(m => m.completed).length || 0;
              const totalMilestones = item.team?.milestones?.length || 4;
              const progressPct = Math.round((completedMilestones / totalMilestones) * 100);

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveModalChallenge(item)}
                  style={{
                    background: 'rgba(19, 27, 46, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    backdropFilter: 'blur(16px)',
                    transition: 'all 250ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Image Preview */}
                  <div style={{ position: 'relative', height: '180px', width: '100%', backgroundColor: '#131B2E', overflow: 'hidden' }}>
                    <img 
                      src={item.evidenceMedia?.[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c572?auto=format&fit=crop&w=800&q=80'} 
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(19,27,46,0.95) 100%)' }} />
                    
                    <span 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(8, 12, 20, 0.85)',
                        color: '#00F2FE',
                        border: '1px solid rgba(0, 242, 254, 0.3)',
                        backdropFilter: 'blur(8px)',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                      }}
                    >
                      {item.domain}
                    </span>

                    <span 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: item.status === 'FIELD_DEPLOYED' ? 'rgba(141,207,169,0.9)' : 'rgba(235,167,86,0.9)',
                        color: '#080C14',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {item.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
                      <MapPin size={13} color="#00F2FE" />
                      <span>{item.district} District ({item.block || 'Block'})</span>
                    </div>

                    <h3 style={{ fontSize: '16.5px', fontWeight: 600, color: '#F8FAFC', lineHeight: 1.35, minHeight: '44px' }}>
                      {item.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>

                    {/* HEI & Industry Partners */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C7B8F5' }}>
                        <GraduationCap size={14} color="#C7B8F5" />
                        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.assignedUniversityName || 'Assigned HEI University'}
                        </span>
                      </div>
                      {item.industryPartnerName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EBA756' }}>
                          <Building2 size={14} color="#EBA756" />
                          <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.industryPartnerName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94A3B8', marginBottom: '4px' }}>
                        <span>Project Milestones</span>
                        <span style={{ color: '#00F2FE', fontWeight: 600 }}>{progressPct}% ({completedMilestones}/{totalMilestones})</span>
                      </div>
                      <div style={{ height: '5px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #00F2FE 0%, #38BDF8 100%)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {activeModalChallenge && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(8, 12, 20, 0.88)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveModalChallenge(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0F172A',
              borderRadius: '24px',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveModalChallenge(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ background: 'rgba(0,242,254,0.15)', color: '#00F2FE', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
                {activeModalChallenge.domain}
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>• ID #{activeModalChallenge.id}</span>
            </div>

            <h2 style={{ fontSize: '22px', color: '#F8FAFC', marginBottom: '14px', lineHeight: 1.3 }}>
              {activeModalChallenge.title}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', uppercase: true }}>Submitted By</div>
                <div style={{ fontSize: '13.5px', color: '#F8FAFC', fontWeight: 500 }}>{activeModalChallenge.submittedBy}</div>
                <div style={{ fontSize: '12px', color: '#00F2FE' }}>{activeModalChallenge.submitterRole}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', uppercase: true }}>District & Location</div>
                <div style={{ fontSize: '13.5px', color: '#F8FAFC', fontWeight: 500 }}>{activeModalChallenge.district}, {activeModalChallenge.block} Block</div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>Panchayat: {activeModalChallenge.panchayat}</div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#00F2FE', marginBottom: '6px' }}>Problem Description & Impact Scope</h4>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>{activeModalChallenge.description}</p>
            </div>

            {activeModalChallenge.team && (
              <div style={{ marginBottom: '20px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0,242,254,0.2)', padding: '16px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '14.5px', color: '#F8FAFC', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap size={16} color="#00F2FE" />
                  Assigned HEI Solution Team & Mentor
                </h4>
                <div style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong style={{ color: '#F8FAFC' }}>University:</strong> {activeModalChallenge.assignedUniversityName}</div>
                  <div><strong style={{ color: '#F8FAFC' }}>Faculty Mentor:</strong> {activeModalChallenge.team.facultyMentor || 'Under Assignment'}</div>
                  <div><strong style={{ color: '#F8FAFC' }}>Solution Title:</strong> {activeModalChallenge.team.solutionName || 'Multidisciplinary R&D'}</div>
                  {activeModalChallenge.team.patentFiled && (
                    <div style={{ color: '#8DCFA9', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} color="#8DCFA9" />
                      Patent Filed: {activeModalChallenge.team.patentNumber} ({activeModalChallenge.team.startupCreated})
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setActiveModalChallenge(null)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '9999px', padding: '10px 20px', color: '#F8FAFC', fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
