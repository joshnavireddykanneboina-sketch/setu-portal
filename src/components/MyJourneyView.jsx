import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Building2, 
  Plus, 
  FileCheck2, 
  Cpu, 
  ChevronRight,
  Send,
  Layers,
  FlaskConical,
  BookOpen,
  Filter,
  Check,
  X,
  AlertTriangle,
  Upload,
  Calendar,
  FileText
} from 'lucide-react';
import { getStore, subscribeStore } from '../services/store';
import { 
  apiGetChallenges, 
  apiUpdateMilestones,
  apiHEIDecision,
  apiFormTeam,
  apiUpdateResearchPlan,
  apiSubmitFieldReport,
  apiRecordPatent,
  apiSuggestResearch
} from '../services/apiClient';
import { getCurrentUser } from '../services/authService';
import { JHARKHAND_DISTRICTS, THEMATIC_DOMAINS } from '../data/jharkhandDistricts';

export default function MyJourneyView({ onNavigate }) {
  const currentUser = getCurrentUser();
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  // Modals
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState('ACCEPT'); // 'ACCEPT' | 'REJECT'
  const [rejectionReason, setRejectionReason] = useState('');
  const [facultyCoordinatorInput, setFacultyCoordinatorInput] = useState(currentUser?.name || 'Dr. Rajeshwar Prasad');

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [studentLeadInput, setStudentLeadInput] = useState('Ankit Kumar (B.Tech 4th Yr)');
  const [teamMembersInput, setTeamMembersInput] = useState('Ankit Kumar, Priya Soren, Rahul Verma, Sneha Singh');
  const [departmentsInput, setDepartmentsInput] = useState('Civil & Environmental Engineering, Remote Sensing');
  const [solutionNameInput, setSolutionNameInput] = useState('');

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [prototypeStageInput, setPrototypeStageInput] = useState('LAB_PROTOTYPE');
  const [researchPlanInput, setResearchPlanInput] = useState('');
  const [expectedPilotDateInput, setExpectedPilotDateInput] = useState('2026-12-15');

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitleInput, setReportTitleInput] = useState('');
  const [beneficiariesInput, setBeneficiariesInput] = useState('250');
  const [reportMetricsInput, setReportMetricsInput] = useState('');

  const [showPatentModal, setShowPatentModal] = useState(false);
  const [patentNumberInput, setPatentNumberInput] = useState('IN-PAT-2026-');
  const [startupNameInput, setStartupNameInput] = useState('');

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // AI Research Directions state
  const [aiResearch, setAiResearch] = useState(null);
  const [aiResearchLoading, setAiResearchLoading] = useState(false);

  const handleFetchResearchDirections = async () => {
    if (!activeChallenge) return;
    setAiResearchLoading(true);
    try {
      const data = await apiSuggestResearch({
        domain: activeChallenge.domain,
        description: activeChallenge.description
      });
      if (data) setAiResearch(data);
    } catch (e) {
      console.warn('Failed to load AI research directions:', e);
    } finally {
      setAiResearchLoading(false);
    }
  };

  // Load challenges from backend
  const loadChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetChallenges();
      if (Array.isArray(data) && data.length > 0) {
        setChallenges(data);
        if (!activeChallenge) {
          setActiveChallenge(data[0]);
        } else {
          const refreshed = data.find(c => c.id === activeChallenge.id);
          if (refreshed) setActiveChallenge(refreshed);
        }
      }
    } catch (err) {
      console.warn('[UniversityPortal] Error loading challenges:', err);
      setError('Unable to fetch university project assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  // Filtered challenges list
  const filteredChallenges = challenges.filter(c => {
    if (selectedDomain !== 'all' && c.domain?.toLowerCase() !== selectedDomain.toLowerCase()) return false;
    if (selectedDistrict !== 'all' && c.district?.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (selectedUrgency !== 'all' && c.aiClassification?.urgency?.toUpperCase() !== selectedUrgency.toUpperCase()) return false;
    return true;
  });

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneIdx) => {
    if (!activeChallenge || !activeChallenge.team) return;
    const updatedMilestones = activeChallenge.team.milestones.map((m, idx) => {
      if (idx === milestoneIdx) {
        return { ...m, completed: !m.completed, date: new Date().toISOString().split('T')[0] };
      }
      return m;
    });

    const updated = {
      ...activeChallenge,
      team: {
        ...activeChallenge.team,
        milestones: updatedMilestones
      }
    };

    setActiveChallenge(updated);
    setChallenges(challenges.map(c => c.id === updated.id ? updated : c));

    try {
      await apiUpdateMilestones(activeChallenge.id, updatedMilestones);
    } catch (e) {
      console.warn('[UniversityPortal] Failed to persist milestone update:', e);
    }
  };

  // Add new milestone
  const handleAddMilestone = async () => {
    if (!newMilestoneText.trim() || !activeChallenge) return;
    const newM = {
      title: newMilestoneText.trim(),
      completed: false,
      date: 'Pending'
    };

    const updatedMilestones = [...(activeChallenge.team?.milestones || []), newM];
    const updated = {
      ...activeChallenge,
      team: {
        ...activeChallenge.team,
        milestones: updatedMilestones
      }
    };

    setActiveChallenge(updated);
    setChallenges(challenges.map(c => c.id === updated.id ? updated : c));
    setNewMilestoneText('');

    try {
      await apiUpdateMilestones(activeChallenge.id, updatedMilestones);
    } catch (e) {
      console.warn('[UniversityPortal] Failed to persist new milestone:', e);
    }
  };

  // Submit HEI accept or reject
  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;
    setActionLoading(true);

    try {
      const res = await apiHEIDecision(activeChallenge.id, {
        decision: decisionType,
        reason: rejectionReason,
        facultyMentor: facultyCoordinatorInput
      });

      setShowDecisionModal(false);
      await loadChallenges();
      alert(res.message || 'University assignment updated.');
    } catch (err) {
      alert(err.message || 'Failed to submit university decision.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Team Formation
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;
    setActionLoading(true);

    try {
      const members = teamMembersInput.split(',').map(m => m.trim()).filter(Boolean);
      const departments = departmentsInput.split(',').map(d => d.trim()).filter(Boolean);

      const res = await apiFormTeam(activeChallenge.id, {
        facultyMentor: facultyCoordinatorInput,
        studentLead: studentLeadInput,
        members,
        departments,
        solutionName: solutionNameInput || `Research Initiative for ${activeChallenge.title.slice(0, 35)}`
      });

      setShowTeamModal(false);
      await loadChallenges();
      alert(res.message || 'Multidisciplinary team constituted.');
    } catch (err) {
      alert(err.message || 'Failed to form research team.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Research Plan & Prototype Stage
  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;
    setActionLoading(true);

    try {
      const res = await apiUpdateResearchPlan(activeChallenge.id, {
        prototypeStage: prototypeStageInput,
        researchPlan: researchPlanInput,
        expectedPilotDate: expectedPilotDateInput
      });

      setShowPlanModal(false);
      await loadChallenges();
      alert(res.message || 'Research roadmap updated.');
    } catch (err) {
      alert(err.message || 'Failed to update research plan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Field Testing Report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;
    setActionLoading(true);

    try {
      const res = await apiSubmitFieldReport(activeChallenge.id, {
        reportTitle: reportTitleInput,
        beneficiariesSurveyed: Number(beneficiariesInput) || 200,
        outcomeMetrics: reportMetricsInput || 'Field testing verified with community PRI signature.',
        testLocation: `${activeChallenge.block}, ${activeChallenge.district}`
      });

      setShowReportModal(false);
      await loadChallenges();
      alert(res.message || 'Field report archived.');
    } catch (err) {
      alert(err.message || 'Failed to upload field report.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit IP Patent & Startup
  const handlePatentSubmit = async (e) => {
    e.preventDefault();
    if (!activeChallenge) return;
    setActionLoading(true);

    try {
      const res = await apiRecordPatent(activeChallenge.id, {
        patentNumber: patentNumberInput,
        patentTitle: activeChallenge.team?.solutionName || activeChallenge.title,
        startupCreated: startupNameInput
      });

      setShowPatentModal(false);
      await loadChallenges();
      alert(res.message || 'Intellectual Property and spinoff startup archived.');
    } catch (err) {
      alert(err.message || 'Failed to record patent/startup.');
    } finally {
      setActionLoading(false);
    }
  };

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
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontSize: '12px',
                color: '#38BDF8',
                marginBottom: '10px',
              }}
            >
              <GraduationCap size={14} color="#38BDF8" />
              <span>Higher Education Institution (HEI) Portal • SIH 26043</span>
            </div>

            <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 600, color: '#F8FAFC', fontFamily: 'var(--font-editorial)' }}>
              University R&D, Prototype Incubation & Multidisciplinary Labs
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '680px' }}>
              Form multidisciplinary student project teams, assign faculty mentors, develop lab prototypes, upload village field trial reports, and archive patents for Jharkhand's societal challenges.
            </p>
          </div>

          {/* Institutional Badge */}
          <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GraduationCap size={22} color="#38BDF8" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>
                {currentUser?.institution || 'Birla Institute of Technology (BIT), Mesra'}
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                {currentUser?.department || 'Centre of Excellence in Societal Innovation'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#94A3B8', marginRight: '6px' }}>
            <Filter size={14} />
            <span>Filter Assignments:</span>
          </div>

          {/* Domain Filter */}
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

          {/* District Filter */}
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

          {/* Urgency Filter */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#121218',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FAF8F5',
              fontSize: '12.5px'
            }}
          >
            <option value="all">All Urgency Ratings</option>
            <option value="RED">RED (High Urgency)</option>
            <option value="AMBER">AMBER (Medium)</option>
            <option value="GREEN">GREEN (Standard)</option>
          </select>

          <span style={{ fontSize: '12px', color: '#64748B', marginLeft: 'auto' }}>
            Showing {filteredChallenges.length} of {challenges.length} active societal projects
          </span>
        </div>

        {/* Workspace Layout: Left Master List + Right Project Workbench */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Master List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredChallenges.length === 0 ? (
              <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', borderRadius: '16px', background: 'rgba(22, 21, 30, 0.8)' }}>
                <p style={{ fontSize: '13px', color: '#94A3B8' }}>No challenges match the active filters.</p>
              </div>
            ) : (
              filteredChallenges.map(item => {
                const isSelected = activeChallenge?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveChallenge(item)}
                    style={{
                      background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'rgba(22, 21, 30, 0.8)',
                      border: isSelected ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                      boxShadow: isSelected ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {item.domain}
                      </span>
                      <span style={{ 
                        fontSize: '10.5px', 
                        fontWeight: 700,
                        color: item.aiClassification?.urgency === 'RED' ? '#F87171' : (item.aiClassification?.urgency === 'AMBER' ? '#FCD34D' : '#8DCFA9'),
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.aiClassification?.urgency || 'AMBER'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC', lineHeight: 1.4, marginBottom: '8px' }}>
                      {item.title}
                    </h4>

                    <div style={{ fontSize: '11.5px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.district} ({item.block})</span>
                      <span style={{ color: '#38BDF8', fontWeight: 600 }}>{item.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Workbench Detail */}
          {activeChallenge ? (
            <div 
              className="glass-panel"
              style={{
                background: 'rgba(22, 21, 30, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* Header & Quick Action Buttons */}
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      {activeChallenge.id}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                      Stage: <strong style={{ color: '#00F2FE' }}>{activeChallenge.team?.prototypeStage || 'CONCEPT'}</strong>
                    </span>
                  </div>

                  {/* University Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setDecisionType('ACCEPT');
                        setShowDecisionModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(141, 207, 169, 0.15)',
                        border: '1px solid #8DCFA9',
                        color: '#8DCFA9',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Accept / Reassign
                    </button>

                    <button
                      onClick={() => {
                        setDecisionType('REJECT');
                        setShowDecisionModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#F87171',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Reject Assignment
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '22px', fontWeight: 650, color: '#F8FAFC', lineHeight: 1.35, marginBottom: '6px' }}>
                  {activeChallenge.title}
                </h3>

                <p style={{ fontSize: '13.5px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '12px' }}>
                  {activeChallenge.description}
                </p>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12.5px', color: '#94A3B8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#38BDF8" />
                    {activeChallenge.district}, {activeChallenge.block} ({activeChallenge.panchayat})
                  </span>
                  <span>Submitter: <strong>{activeChallenge.submittedBy}</strong> ({activeChallenge.submitterRole})</span>
                </div>

                {/* ML Urgency Rationale & Human Safeguard Alert */}
                {activeChallenge.aiClassification?.urgencyReason && (
                  <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 650, color: '#38BDF8', letterSpacing: '0.04em' }}>
                        ML ROUTING & RISK CLASSIFICATION
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Match Score: {activeChallenge.routingScore || 88}/100
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5 }}>
                      {activeChallenge.routingRationale || activeChallenge.aiClassification.urgencyReason}
                    </div>
                    {activeChallenge.aiClassification?.humanVerificationRequired && (
                      <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FECACA', fontSize: '11px' }}>
                        ⚠️ <strong>Critical 24-hr Human Verification:</strong> This challenge is flagged with RED public safety indicators. Triage has been fast-tracked for faculty coordinator review.
                      </div>
                    )}
                  </div>
                )}

                {/* AI Research Directions Generator */}
                <div style={{ marginTop: '14px', padding: '14px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="#38BDF8" />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>
                          AI Research Directions & Field Methodologies
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          Tailored prototype ideas & department recommendations for student teams
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleFetchResearchDirections}
                      disabled={aiResearchLoading}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#38BDF8',
                        fontSize: '11.5px',
                        fontWeight: 650,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Sparkles size={12} className={aiResearchLoading ? 'animate-spin' : ''} />
                      <span>{aiResearchLoading ? 'Generating...' : (aiResearch ? 'Regenerate' : 'Suggest R&D Ideas')}</span>
                    </button>
                  </div>

                  {aiResearch && aiResearch.researchDirections && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {aiResearch.researchDirections.map((dir, idx) => (
                        <div key={idx} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: 650, color: '#38BDF8', marginBottom: '4px' }}>
                            {idx + 1}. {dir.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#E2E8F0', marginBottom: '6px', lineHeight: 1.5 }}>
                            <strong>Prototype Concept:</strong> {dir.prototypeConcept}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '6px' }}>
                            <strong>Validation Methodology:</strong> {dir.methodology}
                          </div>
                          {dir.suitableDepartments && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {dir.suitableDepartments.map((dept, dIdx) => (
                                <span key={dIdx} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)', color: '#BAE6FD', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                  {dept}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Multidisciplinary Team Hub */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '15px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} />
                    <span>Multidisciplinary Project Team</span>
                  </h4>
                  <button
                    onClick={() => setShowTeamModal(true)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38BDF8',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Configure Team Members
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', fontSize: '13px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Faculty Coordinator</span>
                    <strong style={{ color: '#F8FAFC' }}>{activeChallenge.team?.facultyMentor || 'Pending Assignment'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Student Team Lead</span>
                    <strong style={{ color: '#F8FAFC' }}>{activeChallenge.team?.studentLead || 'Pending Constitution'}</strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>CSR Prototyping Grant</span>
                    <strong style={{ color: '#EBA756' }}>₹{(activeChallenge.team?.grantApproved || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <strong>Student Researchers:</strong> {activeChallenge.team?.members?.join(', ') || 'Team constitution in progress'}
                </div>
              </div>

              {/* Action Toolbar: Research Plan, Field Test Report, Patent */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  onClick={() => setShowPlanModal(true)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FlaskConical size={14} color="#00F2FE" />
                  <span>Update Research Roadmap</span>
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FileCheck2 size={14} color="#8DCFA9" />
                  <span>Upload Field Trial Report</span>
                </button>

                <button
                  onClick={() => setShowPatentModal(true)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Award size={14} color="#EBA756" />
                  <span>Record Patent / Startup</span>
                </button>
              </div>

              {/* Milestones Stepper */}
              <div>
                <h4 style={{ fontSize: '15px', color: '#F8FAFC', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FlaskConical size={16} color="#38BDF8" />
                  <span>Project Lifecycle Milestones (Click to toggle completion)</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {(activeChallenge.team?.milestones || []).map((m, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleMilestone(idx)}
                      style={{
                        background: m.completed ? 'rgba(141, 207, 169, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        border: m.completed ? '1px solid rgba(141, 207, 169, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={18} color={m.completed ? '#8DCFA9' : '#64748B'} />
                        <span style={{ fontSize: '13.5px', color: m.completed ? '#F8FAFC' : '#94A3B8', textDecoration: m.completed ? 'line-through' : 'none' }}>
                          {m.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: m.completed ? '#8DCFA9' : '#64748B' }}>
                        {m.completed ? `Done on ${m.date}` : 'In Progress'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Milestone Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newMilestoneText}
                    onChange={(e) => setNewMilestoneText(e.target.value)}
                    placeholder="Add custom university deliverable or lab testing milestone..."
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      color: '#F8FAFC',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={handleAddMilestone}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px' }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* IP / Patent Badge if filed */}
              {activeChallenge.team?.patentFiled && (
                <div style={{ background: 'rgba(141, 207, 169, 0.1)', border: '1px solid rgba(141, 207, 169, 0.3)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Award size={28} color="#8DCFA9" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#8DCFA9' }}>Intellectual Property & Spinoff Startup Created</div>
                    <div style={{ fontSize: '12.5px', color: '#F8FAFC' }}>
                      Patent Application: <strong>{activeChallenge.team.patentNumber}</strong> • Incubated Spinoff Company: <strong>{activeChallenge.team.startupCreated || 'SETU Innovations Lab'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Field Reports List */}
              {activeChallenge.team?.fieldReports && activeChallenge.team.fieldReports.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h5 style={{ fontSize: '13px', color: '#8DCFA9', fontWeight: 600, marginBottom: '8px' }}>
                    Archived Field Testing Reports
                  </h5>
                  {activeChallenge.team.fieldReports.map(rpt => (
                    <div key={rpt.id} style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '6px' }}>
                      • <strong>{rpt.reportTitle}</strong> ({rpt.date}) — {rpt.beneficiariesSurveyed} residents surveyed in {rpt.testLocation}. Outcome: {rpt.outcomeMetrics}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL 1: HEI DECISION (ACCEPT / REJECT)                         */}
      {/* ============================================================== */}
      {showDecisionModal && (
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
          onClick={() => setShowDecisionModal(false)}
        >
          <div 
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#FAF8F5', marginBottom: '8px' }}>
              {decisionType === 'ACCEPT' ? 'Accept Project Assignment' : 'Reject & Re-Queue Assignment'}
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.5 }}>
              {decisionType === 'ACCEPT' 
                ? 'Commit your institution R&D lab to build a prototype and assign a faculty coordinator.'
                : 'Rejection requires a mandatory reason. The challenge will return to government administration for reallocation.'}
            </p>

            <form onSubmit={handleDecisionSubmit}>
              {decisionType === 'ACCEPT' ? (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                    Faculty Nodal Coordinator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyCoordinatorInput}
                    onChange={(e) => setFacultyCoordinatorInput(e.target.value)}
                    placeholder="e.g. Dr. Rajeshwar Prasad (Civil Engg)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(12, 12, 16, 0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13.5px'
                    }}
                  />
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                    Mandatory Rejection Reason *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="State reason: e.g. Lack of specialized lab facilities for this domain; recommend reallocating to BIT Mesra or BAU."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(12, 12, 16, 0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FAF8F5',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {actionLoading ? 'Processing...' : (decisionType === 'ACCEPT' ? 'Confirm Acceptance' : 'Submit Rejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: FORM MULTIDISCIPLINARY TEAM                           */}
      {/* ============================================================== */}
      {showTeamModal && (
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
          onClick={() => setShowTeamModal(false)}
        >
          <div 
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#FAF8F5', marginBottom: '8px' }}>
              Constitute Multidisciplinary Research Team
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.5 }}>
              Under NEP 2020 guidelines, teams should blend engineering, sciences, and rural socio-economic departments.
            </p>

            <form onSubmit={handleTeamSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Student Team Lead *
                </label>
                <input
                  type="text"
                  required
                  value={studentLeadInput}
                  onChange={(e) => setStudentLeadInput(e.target.value)}
                  placeholder="e.g. Ankit Kumar (B.Tech 4th Yr)"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Student Members (Comma Separated)
                </label>
                <input
                  type="text"
                  value={teamMembersInput}
                  onChange={(e) => setTeamMembersInput(e.target.value)}
                  placeholder="e.g. Priya Soren, Rahul Verma, Sneha Singh"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Departments Represented
                </label>
                <input
                  type="text"
                  value={departmentsInput}
                  onChange={(e) => setDepartmentsInput(e.target.value)}
                  placeholder="e.g. Civil Engineering, Rural Management, Chemistry"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Proposed Prototype Solution Title
                </label>
                <input
                  type="text"
                  value={solutionNameInput}
                  onChange={(e) => setSolutionNameInput(e.target.value)}
                  placeholder="e.g. Zeolite Adsorption Filtration Unit for High Fluoride Water"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
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
                  onClick={() => setShowTeamModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {actionLoading ? 'Assembling...' : 'Save Team Constitution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: UPDATE RESEARCH ROADMAP & PROTOTYPE STAGE             */}
      {/* ============================================================== */}
      {showPlanModal && (
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
          onClick={() => setShowPlanModal(false)}
        >
          <div 
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#FAF8F5', marginBottom: '8px' }}>
              Update Research Roadmap & Prototype Stage
            </h3>

            <form onSubmit={handlePlanSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Current Prototype Stage *
                </label>
                <select
                  value={prototypeStageInput}
                  onChange={(e) => setPrototypeStageInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: '#121218',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                >
                  <option value="CONCEPT">CONCEPT (Literature & Feasibility)</option>
                  <option value="LAB_PROTOTYPE">LAB_PROTOTYPE (Bench-scale Working Model)</option>
                  <option value="FIELD_TESTING">FIELD_TESTING (Panchayat Village Trials)</option>
                  <option value="DEPLOYED">DEPLOYED (Commercialized / Beneficiary Transfer)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Expected Field Pilot Date
                </label>
                <input
                  type="date"
                  value={expectedPilotDateInput}
                  onChange={(e) => setExpectedPilotDateInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: '#121218',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Research Deliverables & Technical Milestones
                </label>
                <textarea
                  rows={4}
                  value={researchPlanInput}
                  onChange={(e) => setResearchPlanInput(e.target.value)}
                  placeholder="Outline prototype technical specs, bill of materials, testing metrics, and field deployment targets..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
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
                  onClick={() => setShowPlanModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {actionLoading ? 'Saving...' : 'Update Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: UPLOAD FIELD TESTING REPORT                           */}
      {/* ============================================================== */}
      {showReportModal && (
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
          onClick={() => setShowReportModal(false)}
        >
          <div 
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#FAF8F5', marginBottom: '8px' }}>
              Archive Village Field Testing Report
            </h3>

            <form onSubmit={handleReportSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Field Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={reportTitleInput}
                  onChange={(e) => setReportTitleInput(e.target.value)}
                  placeholder="e.g. 30-Day Village Water Filtration Trial Validation"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Beneficiaries Surveyed / Tested
                </label>
                <input
                  type="number"
                  value={beneficiariesInput}
                  onChange={(e) => setBeneficiariesInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Outcome Metrics & Community PRI Feedback
                </label>
                <textarea
                  rows={3}
                  value={reportMetricsInput}
                  onChange={(e) => setReportMetricsInput(e.target.value)}
                  placeholder="e.g. Fluoride levels reduced from 4.8 ppm to 0.8 ppm (safe for drinking). Verified by Mukhiya of Jama Panchayat."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
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
                  onClick={() => setShowReportModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {actionLoading ? 'Uploading...' : 'Archive Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: RECORD INTELLECTUAL PROPERTY (PATENT / STARTUP)       */}
      {/* ============================================================== */}
      {showPatentModal && (
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
          onClick={() => setShowPatentModal(false)}
        >
          <div 
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#16151E',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 650, color: '#FAF8F5', marginBottom: '8px' }}>
              Record Intellectual Property & Startup Spinoff
            </h3>

            <form onSubmit={handlePatentSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Patent Application Number / IP Filing Ref
                </label>
                <input
                  type="text"
                  value={patentNumberInput}
                  onChange={(e) => setPatentNumberInput(e.target.value)}
                  placeholder="e.g. IN-PAT-2026-94812"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: 'rgba(12, 12, 16, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FAF8F5',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#CBD5E1', marginBottom: '4px' }}>
                  Incubated Startup / Spinoff Company Name
                </label>
                <input
                  type="text"
                  value={startupNameInput}
                  onChange={(e) => setStartupNameInput(e.target.value)}
                  placeholder="e.g. AquaSetu PureTech Pvt. Ltd."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
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
                  onClick={() => setShowPatentModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {actionLoading ? 'Recording...' : 'Save Innovation IP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
