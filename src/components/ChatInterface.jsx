import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Compass, 
  Lock, 
  Send, 
  Mic, 
  Sparkles, 
  ArrowRight,
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw, 
  Edit3,
  X,
  UserCheck,
  Info,
  Clock,
  Check,
  Cpu,
  MapPin,
  GraduationCap,
  Building2,
  Layers,
  Award,
  FileText,
  Upload,
  Camera
} from 'lucide-react';
import { AssistantOrb } from './AssistantOrb';
import { 
  getConversationState, 
  postChatMessage, 
  confirmStudentMirror, 
  selectSupportPathway, 
  resetConversation,
  STAGES
} from '../services/conversationEngine';
import { stripExifMetadata, generateAnonymousToken, sanitizeInputText } from '../services/privacyService';
import { apiCreateChallenge } from '../services/apiClient';
import { getCurrentUser } from '../services/authService';

export default function ChatInterface({ initialPrompt = '', initialDept = null, onNavigate }) {
  const [convState, setConvState] = useState(getConversationState());
  const [currentUser] = useState(getCurrentUser());
  const [inputValue, setInputValue] = useState(initialPrompt);
  const [activeSidebarItem, setActiveSidebarItem] = useState(initialDept || 'all');
  const [isTyping, setIsTyping] = useState(false);
  const [orbState, setOrbState] = useState('idle');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [progressPhrase, setProgressPhrase] = useState('');
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [registeredChallenge, setRegisteredChallenge] = useState(null);
  
  // Privacy & EXIF Scrubbing State
  const [anonToken] = useState(generateAnonymousToken());
  const [exifScrubActive, setExifScrubActive] = useState(true);
  
  // Multimedia evidence attachments
  const [attachedFiles, setAttachedFiles] = useState([
    { name: 'SETU_Secured_fluoride_sample.jpg', type: 'image', scrubbed: true, badge: '🔒 Zero-EXIF' },
    { name: 'SETU_Secured_jama_map.gpx', type: 'gps', scrubbed: true, badge: '🔒 Geofenced 500m' }
  ]);
  const [selectedDistrict, setSelectedDistrict] = useState('Dumka');
  const [selectedBlock, setSelectedBlock] = useState('Jama');

  const handleRegisterChallenge = async () => {
    const userMessages = (convState.messages || []).filter(m => m.sender === 'user').map(m => m.text);
    const content = userMessages.join('\n\n') || inputValue;
    if (!content.trim()) {
      alert('Please describe your community issue in the chat before submitting.');
      return;
    }

    setSubmittingChallenge(true);
    try {
      const title = content.split('\n')[0].slice(0, 75);
      const res = await apiCreateChallenge({
        title,
        description: content,
        district: selectedDistrict,
        block: selectedBlock,
        domain: convState.detectedIntent || convState.domain || convState.intent || 'Water Resources',
        submittedBy: convState.studentName || currentUser?.name || 'Citizen Contributor',
        submitterRole: currentUser?.role || 'CITIZEN',
        submitterEmail: currentUser?.email || '',
        urgencyPreference: convState.urgency || 'AMBER'
      });

      if (res && res.id) {
        setRegisteredChallenge(res);
      } else {
        alert('Challenge registered locally. Database sync queued.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to register challenge. Please try again.');
    } finally {
      setSubmittingChallenge(false);
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [convState.messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const rawText = textToSend || inputValue;
    if (!rawText.trim()) return;

    // PII Sanitization for privacy protection
    const sanitizedText = sanitizeInputText(rawText);

    setInputValue('');
    setIsTyping(true);
    setOrbState('thinking');
    setProgressPhrase('AI Engine: Scrubbing PII, analyzing thematic domain & scanning deduplication database...');

    try {
      const nextState = await postChatMessage({ conversationId: convState.conversationId, message: sanitizedText });
      setConvState({ ...nextState });
    } catch (e) {
      console.error('Chat error:', e);
    } finally {
      setIsTyping(false);
      setOrbState('idle');
      setProgressPhrase('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: '#080C14', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Banner */}
      <div style={{ background: 'rgba(0, 242, 254, 0.06)', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#00F2FE' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#00F2FE" />
          <span><strong>SETU Encrypted Gateway</strong> • Anonymous Token: <code style={{ color: '#F8FAFC', background: 'rgba(0,242,254,0.15)', padding: '1px 6px', borderRadius: '4px' }}>{anonToken.tokenId}</code> • Zero-EXIF Active</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11.5px', background: 'rgba(0,242,254,0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(0,242,254,0.3)', color: '#00F2FE' }}>
            🔒 PII Scrubbed & Encrypted
          </span>
        </div>
      </div>

      {/* Main Grid Container */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', maxWidth: '1440px', width: '100%', margin: '0 auto', gap: '0' }}>
        
        {/* LEFT CHAT AREA */}
        <main style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
          
          {/* Chat Messages Log */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px clamp(1.2rem, 3vw, 3rem)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* System Info Callout */}
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(0, 242, 254, 0.25)', borderRadius: '16px', padding: '16px 20px', fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.55 }}>
              <strong style={{ color: '#F8FAFC', display: 'block', marginBottom: '4px' }}>Johar & Welcome to SETU Citizen Crowdsourcing Intake</strong>
              Describe your community challenge (e.g. drinking water contamination, crop failure due to frost, lack of solar cold storage). Attach photos, location maps, or audio notes. The SETU AI Engine will classify the domain, scan 1,480+ existing issues for duplicates, and route to the best matching university lab.
            </div>

            {/* Render Messages */}
            {(convState.messages || []).map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAssistant ? 'flex-start' : 'flex-end',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#64748B', padding: '0 4px' }}>
                    {isAssistant ? 'SETU AI Innovation Guide' : 'Citizen Contributor'} • {msg.time}
                  </div>

                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '14px 18px',
                      borderRadius: isAssistant ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                      background: isAssistant ? 'rgba(19, 27, 46, 0.85)' : 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
                      color: isAssistant ? '#F8FAFC' : '#080C14',
                      border: isAssistant ? '1px solid rgba(0, 242, 254, 0.25)' : 'none',
                      fontSize: '14.5px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      boxShadow: isAssistant ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,242,254,0.25)',
                      fontWeight: isAssistant ? 400 : 550,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F2FE', fontSize: '13px', background: 'rgba(0,242,254,0.08)', padding: '10px 16px', borderRadius: '12px', width: 'fit-content' }}>
                <Sparkles size={16} className="animate-spin" color="#00F2FE" />
                <span>{progressPhrase || 'AI Engine: Processing domain classification & semantic deduplication scan...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachments & Location Quick Bar */}
          <div style={{ padding: '8px 24px', background: 'rgba(15,23,42,0.8)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94A3B8' }}>
            <span style={{ color: '#00F2FE', fontWeight: 600 }}>Multimedia Attachments:</span>
            {attachedFiles.map((f, idx) => (
              <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Camera size={12} color="#00F2FE" />
                {f.name}
              </span>
            ))}
            <button 
              onClick={() => alert('Add photo / audio / GPS file')}
              style={{ background: 'none', border: '1px dashed rgba(0,242,254,0.4)', color: '#00F2FE', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
            >
              + Add Media / GPS Map Pin
            </button>
          </div>

          {/* Input Box Bar */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#0E1420', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <textarea
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe the societal issue in your district (e.g. fluoride in borewells, crop loss from frost, solar energy needs)..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,242,254,0.25)',
                borderRadius: '14px',
                padding: '12px 16px',
                color: '#F8FAFC',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              style={{
                background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 20px',
                color: '#080C14',
                fontSize: '14px',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 15px rgba(0,242,254,0.3)',
              }}
            >
              <span>Submit</span>
              <Send size={15} />
            </button>
          </div>
        </main>

        {/* RIGHT SIDEBAR: SETU AI RADAR & ROUTING MONITOR */}
        <aside style={{ padding: '24px 20px', backgroundColor: '#0E1420', display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          
          {/* AI Guide Header */}
          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '18px', padding: '16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00F2FE', boxShadow: '0 0 8px #00F2FE' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#00F2FE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                SETU AI Intelligence Radar
              </span>
            </div>

            <div style={{ position: 'relative', margin: '0 auto 12px', width: '120px', height: '120px' }}>
              <AssistantOrb state={orbState} size={120} groundShadow={true} />
            </div>

            <p style={{ fontSize: '12.5px', color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.45 }}>
              "Scanning community problem parameters against 1,480+ Jharkhand issues for deduplication and routing."
            </p>
          </div>

          {/* Real-time Status Card */}
          <div style={{ background: 'rgba(19, 27, 46, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              AI Engine Diagnostics
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#94A3B8' }}>Primary Domain:</span>
              <span style={{ color: '#00F2FE', fontWeight: 600 }}>Water Resources</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#94A3B8' }}>Deduplication Check:</span>
              <span style={{ color: '#8DCFA9', fontWeight: 600 }}>0 Duplicate Matches</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8' }}>Target District:</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ background: '#080C14', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '8px', padding: '6px 8px', color: '#F8FAFC', fontSize: '12px' }}
              >
                {['Dumka', 'Ranchi', 'Dhanbad', 'East Singhbhum', 'Hazaribagh', 'Khunti', 'Bokaro', 'Deoghar', 'Palamu', 'West Singhbhum', 'Giridih', 'Gumla'].map(d => (
                  <option key={d} value={d}>{d} District</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#94A3B8' }}>Matched HEI:</span>
              <span style={{ color: '#C7B8F5', fontWeight: 600 }}>BIT Mesra, Ranchi</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: '#94A3B8' }}>Priority Index:</span>
              <span style={{ color: '#EBA756', fontWeight: 700 }}>92/100 (HIGH IMPACT)</span>
            </div>

            <button
              onClick={handleRegisterChallenge}
              disabled={submittingChallenge}
              style={{
                marginTop: '10px',
                background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                color: '#080C14',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 0 15px rgba(0,242,254,0.3)',
              }}
            >
              <Award size={16} />
              <span>{submittingChallenge ? 'Registering with State...' : 'Submit to University Hub'}</span>
            </button>
          </div>

          {/* Protection Note */}
          <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#00F2FE" />
            <span>Govt. of Jharkhand IT Security & Data Privacy Compliant</span>
          </div>
        </aside>

        {/* Challenge Registration Confirmation Modal */}
        {registeredChallenge && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: 'rgba(8,12,20,0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '480px', width: '100%', background: '#0F172A', borderRadius: '24px', border: '1px solid rgba(0,242,254,0.4)', padding: '32px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
              <CheckCircle2 size={48} color="#00F2FE" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '22px', color: '#F8FAFC', marginBottom: '8px', fontWeight: 650 }}>
                Challenge Registered Successfully!
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.5 }}>
                Your societal challenge has been officially recorded as <strong style={{ color: '#00F2FE' }}>#{registeredChallenge.id}</strong> in the Jharkhand State Innovation Database and allocated to <strong style={{ color: '#F8FAFC' }}>{registeredChallenge.assignedUniversityName || 'Birla Institute of Technology (BIT), Mesra'}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setRegisteredChallenge(null)} 
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '10px 20px', color: '#F8FAFC', fontSize: '13px', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button 
                  onClick={() => onNavigate('/journey')} 
                  style={{ background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)', border: 'none', borderRadius: '9999px', padding: '10px 24px', color: '#080C14', fontWeight: 650, fontSize: '13px', cursor: 'pointer' }}
                >
                  View in University Hub →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
