import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Coins, 
  Users, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  GraduationCap, 
  ShieldCheck,
  Plus,
  DollarSign,
  Briefcase,
  Filter,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Send,
  FileCheck2
} from 'lucide-react';
import { apiGetChallenges, apiFundChallenge } from '../services/apiClient';
import { getCurrentUser } from '../services/authService';
import { JHARKHAND_DISTRICTS, THEMATIC_DOMAINS } from '../data/jharkhandDistricts';

export default function IndustryPortalPage({ onNavigate }) {
  const currentUser = getCurrentUser();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'portfolio'

  // Funding Modal states
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [fundingAmount, setFundingAmount] = useState('500000');
  const [industryMentor, setIndustryMentor] = useState(currentUser?.name || 'Amitabh Choudhury (CSR Lead)');
  const [transactionRef, setTransactionRef] = useState('');
  const [fundingLoading, setFundingLoading] = useState(false);
  const [fundingError, setFundingError] = useState(null);
  const [fundingSuccess, setFundingSuccess] = useState(null);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetChallenges();
      if (Array.isArray(data)) {
        setChallenges(data);
      }
    } catch (err) {
      console.warn('[IndustryPortal] Error loading challenges:', err);
      setError('Unable to load challenge portfolio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenPledge = (challenge) => {
    setSelectedChallenge(challenge);
    setFundingError(null);
    setFundingSuccess(null);
    setTransactionRef(`CSR-REF-${Date.now().toString().slice(-6)}`);
  };

  const handlePledgeFunding = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    setFundingLoading(true);
    setFundingError(null);

    try {
      const partnerName = currentUser?.organization || currentUser?.name || 'Tata Steel CSR Division';
      const partnerId = currentUser?.id || 'IND-01';

      const res = await apiFundChallenge(selectedChallenge.id, {
        industryPartnerId: partnerId,
        industryPartnerName: partnerName,
        grantAmount: Number(fundingAmount),
        industryMentor,
        transactionRef
      });

      setFundingLoading(false);
      setFundingSuccess(res.message || 'CSR Prototyping Grant successfully pledged!');
      await fetchChallenges();

      setTimeout(() => {
        setFundingSuccess(null);
        setSelectedChallenge(null);
      }, 2500);
    } catch (err) {
      setFundingLoading(false);
      // Handles duplicate transaction prevention (409) or validation failure
      setFundingError(err.message || 'Failed to process CSR pledge.');
    }
  };

  // Filtered challenges
  const filteredChallenges = challenges.filter(c => {
    if (selectedDomain !== 'all' && c.domain?.toLowerCase() !== selectedDomain.toLowerCase()) return false;
    if (selectedDistrict !== 'all' && c.district?.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    return true;
  });

  // Sponsored challenges
  const currentPartnerName = (currentUser?.organization || currentUser?.name || 'Tata Steel').toLowerCase();
  const sponsoredChallenges = challenges.filter(c => 
    c.industryPartnerName?.toLowerCase().includes('tata') ||
    (c.industryPartnerName && c.industryPartnerName.toLowerCase().includes(currentPartnerName)) ||
    (c.fundingTransactions && c.fundingTransactions.length > 0)
  );

  const totalCSRCommitted = sponsoredChallenges.reduce((sum, c) => sum + (c.team?.grantApproved || 0), 0) || 8500000;

  return (
    <section style={{ padding: '90px clamp(1.5rem, 5vw, 4.5rem)', backgroundColor: '#080C14', minHeight: '100vh', color: '#F8FAFC' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
          <div>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(235, 167, 86, 0.12)',
                border: '1px solid rgba(235, 167, 86, 0.3)',
                fontSize: '12px',
                color: '#EBA756',
                marginBottom: '10px',
              }}
            >
              <Building2 size={14} color="#EBA756" />
              <span>Industry & Corporate Social Responsibility (CSR) Portal • SIH 26043</span>
            </div>

            <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 600, color: '#F8FAFC', fontFamily: 'var(--font-editorial)' }}>
              Co-Development, CSR Grants & Industry Mentorship Hub
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '680px' }}>
              Connect corporate funding and senior engineering mentors with student-faculty labs solving grassroots water, agriculture, and tribal challenges across Jharkhand.
            </p>
          </div>

          {/* CSR Partner Organization Badge */}
          <div style={{ background: 'rgba(235, 167, 86, 0.08)', border: '1px solid rgba(235, 167, 86, 0.3)', padding: '10px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building2 size={22} color="#EBA756" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                {currentUser?.organization || 'Tata Steel CSR & Sustainability Division'}
              </div>
              <div style={{ fontSize: '11px', color: '#EBA756' }}>
                CSR Mandate: Rural Technology & Livelihoods
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('explore')}
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              background: activeTab === 'explore' ? '#EBA756' : 'transparent',
              color: activeTab === 'explore' ? '#080C14' : '#94A3B8',
              border: 'none',
              fontSize: '13px',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            <span>Explore Societal Challenges ({challenges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            style={{
              padding: '8px 20px',
              borderRadius: '9999px',
              background: activeTab === 'portfolio' ? '#EBA756' : 'transparent',
              color: activeTab === 'portfolio' ? '#080C14' : '#94A3B8',
              border: 'none',
              fontSize: '13px',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Coins size={14} />
            <span>CSR Commitment Portfolio ({sponsoredChallenges.length})</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: EXPLORE CHALLENGES & PLEDGE GRANTS                      */}
        {/* ============================================================== */}
        {activeTab === 'explore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#94A3B8' }}>
                <Filter size={14} />
                <span>Filter Projects:</span>
              </div>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#121218',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FAF8F5',
                  fontSize: '12.5px'
                }}
              >
                <option value="all">All Domains</option>
                {THEMATIC_DOMAINS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#121218',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FAF8F5',
                  fontSize: '12.5px'
                }}
              >
                <option value="all">All 24 Districts</option>
                {JHARKHAND_DISTRICTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>

              <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto' }}>
                Found {filteredChallenges.length} societal projects seeking R&D funding
              </span>
            </div>

            {/* Challenges Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
              {filteredChallenges.map(item => {
                const isSponsored = item.industryPartnerName && item.team?.grantApproved > 0;
                return (
                  <div
                    key={item.id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      borderRadius: '20px',
                      background: 'rgba(22, 21, 30, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      {/* Domain and Urgency Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 650, color: '#EBA756', background: 'rgba(235, 167, 86, 0.12)', padding: '3px 10px', borderRadius: '6px' }}>
                          {item.domain}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {item.district} ({item.block})
                        </span>
                      </div>

                      <h3 style={{ fontSize: '17px', fontWeight: 650, color: '#F8FAFC', lineHeight: 1.4, marginBottom: '10px' }}>
                        {item.title}
                      </h3>

                      <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>

                      {/* University Allocation Status */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '12.5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: 600, marginBottom: '4px' }}>
                          <GraduationCap size={15} />
                          <span>{item.assignedUniversityName ? item.assignedUniversityName.split(',')[0] : 'University Assigned'}</span>
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '11.5px' }}>
                          Faculty Coordinator: {item.team?.facultyMentor || 'Pending R&D assignment'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA & Grant Info */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>CSR Prototyping Grant</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#FAF8F5' }}>
                          ₹{(item.team?.grantApproved || 0).toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenPledge(item)}
                        style={{
                          background: 'linear-gradient(135deg, #EBA756 0%, #D97706 100%)',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '9px 18px',
                          color: '#080C14',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Coins size={14} />
                        <span>Pledge Grant</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CSR COMMITMENT PORTFOLIO                                */}
        {/* ============================================================== */}
        {activeTab === 'portfolio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Portfolio Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(22, 21, 30, 0.8)' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Total Committed CSR Funds</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#EBA756' }}>
                  ₹{(totalCSRCommitted).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11px', color: '#8DCFA9', marginTop: '4px' }}>Active Prototyping Allocations</div>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(22, 21, 30, 0.8)' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Supported University Projects</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#38BDF8' }}>
                  {sponsoredChallenges.length || 6} Projects
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Across BIT Mesra, BAU, IIT-ISM & NIT</div>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(22, 21, 30, 0.8)' }}>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Estimated Beneficiaries Reached</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#00F2FE' }}>
                  78,500+
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Village Panchayat verified</div>
              </div>
            </div>

            {/* Sponsored Projects Table */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(22, 21, 30, 0.8)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#F8FAFC', marginBottom: '16px' }}>
                Sponsored University Innovation Deliverables
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sponsoredChallenges.map(c => (
                  <div key={c.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', gap: '12px' }}>
                    <div style={{ maxWidth: '600px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#00F2FE' }}>{c.id}</span>
                        <span style={{ fontSize: '11px', color: '#EBA756', background: 'rgba(235, 167, 86, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{c.domain}</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{c.district}</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FAF8F5', marginBottom: '4px' }}>
                        {c.title}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                        HEI: <strong style={{ color: '#38BDF8' }}>{c.assignedUniversityName}</strong> • Industry Mentor: <strong style={{ color: '#EBA756' }}>{c.team?.industryMentor || 'Assigned'}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#EBA756' }}>
                        ₹{(c.team?.grantApproved || 300000).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#8DCFA9', marginTop: '2px' }}>
                        Stage: {c.team?.prototypeStage || 'LAB_PROTOTYPE'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODAL: PLEDGE CSR FUNDING & MENTOR ASSIGNMENT                 */}
      {/* ============================================================== */}
      {selectedChallenge && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            backgroundColor: 'rgba(7, 7, 10, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedChallenge(null)}
        >
          <div 
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(235, 167, 86, 0.3)',
              padding: '28px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Coins size={18} color="#EBA756" />
              <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#FAF8F5' }}>
                Pledge CSR Prototyping Grant
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.5 }}>
              Project: <strong style={{ color: '#F8FAFC' }}>{selectedChallenge.title}</strong>
            </p>

            {fundingError && (
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={15} flexShrink={0} />
                <span>{fundingError}</span>
              </div>
            )}

            {fundingSuccess ? (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(141, 207, 169, 0.12)', border: '1px solid rgba(141, 207, 169, 0.3)', color: '#8DCFA9', fontSize: '13px', textAlign: 'center' }}>
                ✓ {fundingSuccess}
              </div>
            ) : (
              <form onSubmit={handlePledgeFunding}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                    Grant Amount (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="10000"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(12, 12, 16, 0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                    ₹{Number(fundingAmount).toLocaleString('en-IN')} for university lab materials and field trial supplies
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                    Assigned Corporate Mentor
                  </label>
                  <input
                    type="text"
                    required
                    value={industryMentor}
                    onChange={(e) => setIndustryMentor(e.target.value)}
                    placeholder="e.g. Amitabh Choudhury (Tata Steel Sustainability Lead)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(12, 12, 16, 0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                    Corporate Reference / CSR PO Ref Number
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="CSR-PO-2026-XXXX"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(12, 12, 16, 0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedChallenge(null)}
                    style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fundingLoading}
                    className="btn-primary"
                    style={{ padding: '9px 22px', fontSize: '13px' }}
                  >
                    {fundingLoading ? 'Processing & Validating...' : 'Confirm CSR Pledge'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
