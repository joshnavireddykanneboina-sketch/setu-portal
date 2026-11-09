import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MapPin, 
  Sparkles, 
  Upload, 
  Camera, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  Search, 
  Layers, 
  Compass, 
  GraduationCap, 
  Building2, 
  ShieldAlert, 
  Check, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  WifiOff,
  Video,
  RotateCcw,
  Trash2,
  HardDrive,
  CloudUpload,
  Database
} from 'lucide-react';
import { 
  apiGetChallenges, 
  apiCreateChallenge,
  apiClassifyChallenge,
  apiDetectDuplicates,
  apiStructureProblem
} from '../services/apiClient';
import { getCurrentUser } from '../services/authService';
import { JHARKHAND_DISTRICTS, THEMATIC_DOMAINS } from '../data/jharkhandDistricts';
import { 
  saveDraft, 
  getDraft, 
  deleteDraft, 
  enqueueSubmission, 
  getAllQueueItems 
} from '../services/offlineStorage';
import { 
  subscribeSyncState, 
  triggerBackgroundSync, 
  getQueueMetrics 
} from '../services/syncManager';

export default function CitizenPortalPage({ onNavigate }) {
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'track' | 'my-challenges'
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [district, setDistrict] = useState(currentUser?.district || 'Dumka');
  const [block, setBlock] = useState(currentUser?.block || 'Jama');
  const [panchayat, setPanchayat] = useState(currentUser?.panchayat || '');
  const [domain, setDomain] = useState('auto');
  const [urgencyPreference, setUrgencyPreference] = useState('AMBER');
  const [description, setDescription] = useState('');
  const [estimatedBeneficiaries, setEstimatedBeneficiaries] = useState('5000');
  
  // GPS & Media states
  const [gpsConsent, setGpsConsent] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaList, setMediaList] = useState([
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c572?auto=format&fit=crop&w=800&q=80'
  ]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Offline-First Sync & Draft states
  const [offlineSubmission, setOfflineSubmission] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [syncState, setSyncState] = useState({ isOnline: true, isSyncing: false });
  const [savedDraftExists, setSavedDraftExists] = useState(false);

  // Device Hardware Camera states
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  // ML Intelligence & Semantic Deduplication states
  const [mlInsights, setMlInsights] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [detectedDuplicates, setDetectedDuplicates] = useState([]);
  const [dupLoading, setDupLoading] = useState(false);

  // Tracking tab states
  const [trackingIdSearch, setTrackingIdSearch] = useState('');
  const [searchedChallenge, setSearchedChallenge] = useState(null);
  const [searchNotFound, setSearchNotFound] = useState(false);

  // Fetch challenges
  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGetChallenges();
      if (Array.isArray(data)) {
        setChallenges(data);
      }
    } catch (err) {
      console.warn('[CitizenPortal] Failed to fetch live challenges:', err);
      setError('Unable to load challenge repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
    
    // Subscribe to Offline Sync Manager
    const unsub = subscribeSyncState((state) => {
      setSyncState({ ...state });
      loadQueueItems();
    });

    loadQueueItems();
    checkForSavedDraft();

    return unsub;
  }, []);

  const loadQueueItems = async () => {
    try {
      const items = await getAllQueueItems();
      setQueueItems(items || []);
    } catch (e) {
      console.warn('[OFFLINE] Error loading queue items:', e);
    }
  };

  const checkForSavedDraft = async () => {
    try {
      const d = await getDraft();
      if (d && (d.title || d.description)) {
        setSavedDraftExists(true);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleRestoreDraft = async () => {
    try {
      const d = await getDraft();
      if (d) {
        if (d.title) setTitle(d.title);
        if (d.description) setDescription(d.description);
        if (d.district) setDistrict(d.district);
        if (d.block) setBlock(d.block);
        if (d.panchayat) setPanchayat(d.panchayat);
        if (d.domain) setDomain(d.domain);
        if (d.urgencyPreference) setUrgencyPreference(d.urgencyPreference);
        if (d.estimatedBeneficiaries) setEstimatedBeneficiaries(String(d.estimatedBeneficiaries));
        setSavedDraftExists(false);
      }
    } catch (e) {
      console.warn('[OFFLINE] Error restoring draft:', e);
    }
  };

  const handleDiscardDraft = async () => {
    await deleteDraft();
    setSavedDraftExists(false);
  };

  // Auto-save draft as user edits
  useEffect(() => {
    if (title.trim() || description.trim()) {
      const timer = setTimeout(() => {
        saveDraft({
          title,
          description,
          district,
          block,
          panchayat,
          domain,
          urgencyPreference,
          estimatedBeneficiaries
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [title, description, district, block, panchayat, domain, urgencyPreference, estimatedBeneficiaries]);

  // Compress image file to JPEG dataURL (max 1200px)
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const maxDim = 1200;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle native file or camera upload
  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImageFile(files[i]);
      setMediaList(prev => [...prev, compressed]);
    }
    e.target.value = '';
  };

  // Live Viewfinder Camera
  const startLiveCamera = async (facing = cameraFacing) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Live camera viewfinder is not supported on this browser. Use the native photo button instead.');
        return;
      }
      setCameraModalOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      alert('Camera permission denied or camera in use. Please allow camera access in browser settings.');
      setCameraModalOpen(false);
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setCameraModalOpen(false);
  };

  const captureLiveSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setMediaList(prev => [...prev, dataUrl]);
    stopLiveCamera();
  };

  const toggleCameraFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }
    startLiveCamera(next);
  };

  // Update blocks when district changes
  const activeDistrictObj = JHARKHAND_DISTRICTS.find(d => d.name === district) || JHARKHAND_DISTRICTS[0];
  const blockList = activeDistrictObj ? activeDistrictObj.blocks : ['Central Block'];

  const handleDistrictChange = (newDist) => {
    setDistrict(newDist);
    const dObj = JHARKHAND_DISTRICTS.find(d => d.name === newDist);
    if (dObj && dObj.blocks.length > 0) {
      setBlock(dObj.blocks[0]);
    }
  };

  // GPS Coordinate capture with explicit user consent
  const handleToggleGPS = () => {
    if (!gpsConsent) {
      if ('geolocation' in navigator) {
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoordinates({
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
              accuracy: `${Math.round(pos.coords.accuracy)}m`,
              consentGiven: true
            });
            setGpsConsent(true);
            setGpsLoading(false);
          },
          (err) => {
            console.warn('[GPS] Consent denied or unavailable:', err.message);
            // Default to central Ranchi coordinates with simulated tag
            setCoordinates({
              lat: 23.3441,
              lng: 85.3096,
              simulated: true,
              consentGiven: true
            });
            setGpsConsent(true);
            setGpsLoading(false);
          },
          { timeout: 7000 }
        );
      } else {
        setCoordinates({ lat: 23.3441, lng: 85.3096, simulated: true, consentGiven: true });
        setGpsConsent(true);
      }
    } else {
      setGpsConsent(false);
      setCoordinates(null);
    }
  };

  // AI-Assisted Problem Structuring via Gemini / Deterministic Fallback
  const handleAIAssist = async () => {
    if (!title.trim() && !description.trim()) {
      alert('Please enter at least a challenge title or brief draft first.');
      return;
    }
    setAiGenerating(true);
    try {
      const rawQuery = description.trim() || title.trim();
      const structured = await apiStructureProblem({
        text: rawQuery,
        district
      });

      if (structured) {
        if (structured.structuredTitle) setTitle(structured.structuredTitle);
        if (structured.suggestedDomain) setDomain(structured.suggestedDomain);
        if (structured.estimatedBeneficiaries) setEstimatedBeneficiaries(String(structured.estimatedBeneficiaries));

        let formatted = structured.problemSummary || rawQuery;
        if (structured.rootCauseHypothesis) {
          formatted += `\n\n[Root Cause Hypothesis]: ${structured.rootCauseHypothesis}`;
        }
        if (structured.communityImpactStatement) {
          formatted += `\n\n[Community Impact]: ${structured.communityImpactStatement}`;
        }
        if (structured.actionableParameters && structured.actionableParameters.length > 0) {
          formatted += `\n\n[Actionable Engineering Parameters]: ${structured.actionableParameters.join(', ')}`;
        }
        setDescription(formatted);

        // Run ML classification and duplicate check with structured text
        await runMLAnalysis(formatted, structured.structuredTitle || title);
      }
    } catch (e) {
      console.warn('[AI ASSIST] Error invoking problem structuring:', e);
    } finally {
      setAiGenerating(false);
    }
  };

  // Run ML Classification & Semantic Deduplication
  const runMLAnalysis = async (customDesc, customTitle) => {
    const textToAnalyze = `${customTitle || title} ${customDesc || description}`.trim();
    if (textToAnalyze.length < 10) return;

    setMlLoading(true);
    setDupLoading(true);
    try {
      const [classRes, dupRes] = await Promise.all([
        apiClassifyChallenge(textToAnalyze),
        apiDetectDuplicates(textToAnalyze, 0.30)
      ]);

      if (classRes && classRes.primaryDomain) {
        setMlInsights(classRes);
        setDomain(classRes.primaryDomain);
        if (classRes.urgencyLevel) {
          setUrgencyPreference(classRes.urgencyLevel);
        }
      }

      if (dupRes && Array.isArray(dupRes.duplicates)) {
        setDetectedDuplicates(dupRes.duplicates);
      }
    } catch (err) {
      console.warn('[ML ANALYSIS] Error running ML inference:', err);
    } finally {
      setMlLoading(false);
      setDupLoading(false);
    }
  };

  // Add media URL
  const handleAddMedia = () => {
    if (mediaUrl.trim()) {
      setMediaList([...mediaList, mediaUrl.trim()]);
      setMediaUrl('');
    }
  };

  // Submit societal challenge with Offline-First & Idempotency Safeguards
  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setDuplicateWarning(null);
    setOfflineSubmission(null);

    const idempotencyKey = `SETU-IDEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const payload = {
      title: title.trim(),
      submittedBy: currentUser?.name || 'Citizen Contributor',
      submitterRole: currentUser?.role || 'Community Resident',
      submitterEmail: currentUser?.email || 'citizen@setu.jharkhand.gov.in',
      submitterPhone: currentUser?.phone || '+91-9431102938',
      district,
      block,
      panchayat: panchayat || `${block} Central Panchayat`,
      coordinates: coordinates || { lat: 23.3441, lng: 85.3096, consentGiven: false },
      domain: domain === 'auto' ? undefined : domain,
      description: description.trim(),
      urgencyPreference,
      evidenceMedia: mediaList,
      estimatedBeneficiaries: Number(estimatedBeneficiaries) || 5000,
      idempotencyKey
    };

    // 1. If currently offline, queue in IndexedDB immediately without failing
    if (!syncState.isOnline) {
      const queuedItem = await enqueueSubmission(payload, idempotencyKey);
      await deleteDraft();
      setSubmitting(false);
      setOfflineSubmission(queuedItem);
      await loadQueueItems();
      return;
    }

    // 2. Online submission attempt
    try {
      const result = await apiCreateChallenge(payload, idempotencyKey);
      setSubmitting(false);

      if (result) {
        setSubmissionSuccess(result);
        await deleteDraft();
        if (result.aiClassification?.isDuplicate) {
          setDuplicateWarning(`Note: A similar societal challenge (#${result.aiClassification.matchedDuplicateId}) was previously registered for ${district}. Both will be clustered for university R&D.`);
        }
        fetchChallenges();
        await loadQueueItems();
      }
    } catch (err) {
      // 3. Network connection drop during flight: gracefully enqueue locally!
      console.warn('[CitizenPortal] Network submission exception, fallback to offline queue:', err.message);
      const queuedItem = await enqueueSubmission(payload, idempotencyKey);
      await deleteDraft();
      setSubmitting(false);
      setOfflineSubmission(queuedItem);
      await loadQueueItems();
    }
  };

  // Tracking search
  const handleSearchTracking = (e) => {
    e.preventDefault();
    setSearchNotFound(false);
    const q = trackingIdSearch.trim().toLowerCase();
    if (!q) return;

    const match = challenges.find(c => 
      c.id.toLowerCase() === q || 
      c.title.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q.replace('#', ''))
    );

    if (match) {
      setSearchedChallenge(match);
      setSearchNotFound(false);
    } else {
      setSearchedChallenge(null);
      setSearchNotFound(true);
    }
  };

  const mySubmissions = challenges.filter(c => 
    c.submitterEmail?.toLowerCase() === currentUser?.email?.toLowerCase() ||
    c.submittedBy?.toLowerCase() === currentUser?.name?.toLowerCase()
  );

  return (
    <section style={{ padding: '90px clamp(1.5rem, 5vw, 4.5rem)', backgroundColor: '#080C14', minHeight: '100vh', color: '#F8FAFC' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
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
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                fontSize: '12px',
                color: '#00F2FE',
                marginBottom: '10px',
              }}
            >
              <Users size={14} color="#00F2FE" />
              <span>Citizen & Panchayati Raj Institutions (PRI) Portal • SIH 26043</span>
            </div>

            <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 600, color: '#F8FAFC', fontFamily: 'var(--font-editorial)' }}>
              Grassroots Societal Challenge Intake & Tracking
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '680px' }}>
              Report unsolved community problems across Jharkhand's 24 districts. Our AI automatically classifies domain urgency and assigns your issue directly to university engineering labs and CSR sponsors.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setActiveTab('submit')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                background: activeTab === 'submit' ? '#00F2FE' : 'transparent',
                color: activeTab === 'submit' ? '#080C14' : '#94A3B8',
                border: 'none',
                fontSize: '13px',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Send size={14} />
              <span>Submit Challenge</span>
            </button>

            <button
              onClick={() => setActiveTab('track')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                background: activeTab === 'track' ? '#00F2FE' : 'transparent',
                color: activeTab === 'track' ? '#080C14' : '#94A3B8',
                border: 'none',
                fontSize: '13px',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Search size={14} />
              <span>Track By ID</span>
            </button>

            <button
              onClick={() => setActiveTab('my-challenges')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                background: activeTab === 'my-challenges' ? '#00F2FE' : 'transparent',
                color: activeTab === 'my-challenges' ? '#080C14' : '#94A3B8',
                border: 'none',
                fontSize: '13px',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Clock size={14} />
              <span>My Submissions ({mySubmissions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('offline-queue')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                background: activeTab === 'offline-queue' ? '#00F2FE' : 'transparent',
                color: activeTab === 'offline-queue' ? '#080C14' : '#94A3B8',
                border: 'none',
                fontSize: '13px',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Database size={14} />
              <span>Offline Queue ({queueItems.length})</span>
            </button>
          </div>
        </div>

        {/* Unsaved Local Draft Banner */}
        {savedDraftExists && activeTab === 'submit' && (
          <div style={{ padding: '12px 18px', borderRadius: '14px', background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HardDrive size={18} color="#00F2FE" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 650, color: '#F8FAFC' }}>
                  Unsaved Local Draft Available
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  A previously auto-saved problem draft exists on this device.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleRestoreDraft}
                style={{ padding: '6px 14px', borderRadius: '8px', background: '#00F2FE', color: '#080C14', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Restore Draft
              </button>
              <button 
                type="button" 
                onClick={handleDiscardDraft}
                style={{ padding: '6px 12px', borderRadius: '8px', background: 'transparent', color: '#94A3B8', fontSize: '12px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: SUBMIT SOCIETAL CHALLENGE FORM                          */}
        {/* ============================================================== */}
        {activeTab === 'submit' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '2rem' }}>
            
            {/* Main Form */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '32px', 
                borderRadius: '24px', 
                background: 'rgba(22, 21, 30, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.08)' 
              }}
            >
              {offlineSubmission ? (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(235, 167, 86, 0.15)', border: '1px solid #EBA756', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <WifiOff size={32} color="#EBA756" />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 650, color: '#F8FAFC', marginBottom: '8px' }}>
                    Saved Locally in Device Offline Queue
                  </h3>
                  <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', background: 'rgba(235, 167, 86, 0.2)', border: '1px solid rgba(235, 167, 86, 0.4)', color: '#FCD34D', fontSize: '11.5px', fontWeight: 700, marginBottom: '14px' }}>
                    STATUS: WAITING FOR SYNCHRONIZATION
                  </div>
                  <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '460px', margin: '0 auto 18px', lineHeight: 1.6 }}>
                    Your device is currently disconnected from the internet. Your societal challenge has been preserved in local IndexedDB storage with idempotency key:
                  </p>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#0D111A', padding: '10px 18px', borderRadius: '12px', border: '1px solid #EBA756', marginBottom: '20px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#EBA756', letterSpacing: '0.04em' }}>
                      {offlineSubmission.idempotencyKey}
                    </span>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', maxWidth: '440px', margin: '0 auto 24px', textAlign: 'left', fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5 }}>
                    ⚠️ <strong>State Transparency Notice:</strong> This submission has <em>NOT</em> yet reached the state government database. It will automatically upload as soon as your device reconnects to Wi-Fi or mobile network.
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setActiveTab('offline-queue');
                        setOfflineSubmission(null);
                      }}
                      className="btn-primary"
                    >
                      Open Offline Sync Hub →
                    </button>
                    <button
                      onClick={() => {
                        setTitle('');
                        setDescription('');
                        setOfflineSubmission(null);
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '9999px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FAF8F5',
                        cursor: 'pointer',
                        fontSize: '13.5px'
                      }}
                    >
                      New Challenge
                    </button>
                  </div>
                </div>
              ) : submissionSuccess ? (
                <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.15)', border: '1px solid #00F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <CheckCircle2 size={36} color="#00F2FE" />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 650, color: '#F8FAFC', marginBottom: '8px' }}>
                    Challenge Successfully Recorded!
                  </h3>
                  <p style={{ fontSize: '14.5px', color: '#94A3B8', marginBottom: '18px' }}>
                    Your societal challenge has been assigned a permanent state tracking identifier:
                  </p>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#0D111A', padding: '10px 20px', borderRadius: '12px', border: '1px solid #00F2FE', marginBottom: '20px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#00F2FE', letterSpacing: '0.05em' }}>
                      {submissionSuccess.id}
                    </span>
                  </div>

                  {duplicateWarning && (
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(235, 167, 86, 0.15)', border: '1px solid rgba(235, 167, 86, 0.4)', color: '#FCD34D', fontSize: '13px', textAlign: 'left', marginBottom: '20px' }}>
                      <AlertTriangle size={15} style={{ display: 'inline', marginRight: '6px' }} />
                      {duplicateWarning}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '440px', margin: '0 auto 24px', textAlign: 'left' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>AI Thematic Domain</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F8FAFC' }}>{submissionSuccess.domain}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Allocated University</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#00F2FE' }}>{submissionSuccess.assignedUniversityName}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button
                      onClick={() => {
                        setSearchedChallenge(submissionSuccess);
                        setActiveTab('track');
                        setSubmissionSuccess(null);
                      }}
                      className="btn-primary"
                    >
                      Track Progress Pipeline →
                    </button>
                    <button
                      onClick={() => {
                        setTitle('');
                        setDescription('');
                        setSubmissionSuccess(null);
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '9999px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#FAF8F5',
                        cursor: 'pointer',
                        fontSize: '13.5px'
                      }}
                    >
                      Submit Another Challenge
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitChallenge}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#F8FAFC', marginBottom: '18px' }}>
                    Register Community Societal Issue
                  </h3>

                  {/* Challenge Title */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                      Challenge Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. High Fluoride in Drinking Well Water Causing Fluorosis in Jama Panchayat"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(12, 12, 16, 0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FAF8F5',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Administrative Jurisdiction (24 Districts) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                        District *
                      </label>
                      <select
                        value={district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#121218',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#FAF8F5',
                          fontSize: '13px'
                        }}
                      >
                        {JHARKHAND_DISTRICTS.map(d => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                        Block / Tehsil *
                      </label>
                      <select
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#121218',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#FAF8F5',
                          fontSize: '13px'
                        }}
                      >
                        {blockList.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                        Gram Panchayat / Village
                      </label>
                      <input
                        type="text"
                        value={panchayat}
                        onChange={(e) => setPanchayat(e.target.value)}
                        placeholder="e.g. Jama Gram Panchayat"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#121218',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#FAF8F5',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Domain & Urgency Classification */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                        Thematic Domain
                      </label>
                      <select
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#121218',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#FAF8F5',
                          fontSize: '13px'
                        }}
                      >
                        <option value="auto">✨ Auto-Detect via AI NLP</option>
                        {THEMATIC_DOMAINS.map(td => (
                          <option key={td} value={td}>{td}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                        Reported Urgency
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setUrgencyPreference('GREEN')}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            border: urgencyPreference === 'GREEN' ? '1px solid #8DCFA9' : '1px solid rgba(255,255,255,0.1)',
                            background: urgencyPreference === 'GREEN' ? 'rgba(141, 207, 169, 0.2)' : 'transparent',
                            color: '#8DCFA9',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          GREEN
                        </button>

                        <button
                          type="button"
                          onClick={() => setUrgencyPreference('AMBER')}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            border: urgencyPreference === 'AMBER' ? '1px solid #EBA756' : '1px solid rgba(255,255,255,0.1)',
                            background: urgencyPreference === 'AMBER' ? 'rgba(235, 167, 86, 0.2)' : 'transparent',
                            color: '#EBA756',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          AMBER
                        </button>

                        <button
                          type="button"
                          onClick={() => setUrgencyPreference('RED')}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            border: urgencyPreference === 'RED' ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            background: urgencyPreference === 'RED' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            color: '#F87171',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          RED
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description with AI Assistant Button */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 500, color: '#CBD5E1' }}>
                        Detailed Problem Description *
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => runMLAnalysis()}
                          disabled={mlLoading || (!title.trim() && !description.trim())}
                          style={{
                            background: 'rgba(141, 207, 169, 0.12)',
                            border: '1px solid rgba(141, 207, 169, 0.3)',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            color: '#8DCFA9',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <RefreshCw size={12} className={mlLoading ? 'animate-spin' : ''} />
                          <span>{mlLoading ? 'Analyzing...' : 'ML Scan'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAIAssist}
                          disabled={aiGenerating}
                          style={{
                            background: 'rgba(0, 242, 254, 0.12)',
                            border: '1px solid rgba(0, 242, 254, 0.3)',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            color: '#00F2FE',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Sparkles size={13} />
                          <span>{aiGenerating ? 'AI Structuring...' : 'Gemini AI Auto-Structure'}</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      required
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the real issue faced by local residents. Include what happens, who is affected, seasonal patterns, and previous attempts to solve it..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(12, 12, 16, 0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FAF8F5',
                        fontSize: '13.5px',
                        lineHeight: 1.6,
                        outline: 'none',
                        resize: 'vertical'
                      }}
                    />

                    {/* Live ML Subsystem Insights Panel */}
                    {mlInsights && (
                      <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={14} color="#00F2FE" />
                            <span style={{ fontSize: '12px', fontWeight: 650, color: '#00F2FE', letterSpacing: '0.04em' }}>
                              ML PREDICTIVE INFERENCE (8 DOMAINS)
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                            Confidence: {Math.round((mlInsights.confidenceScore || 0.85) * 100)}%
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Predicted Domain</div>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#F8FAFC' }}>
                              {mlInsights.primaryDomain}
                            </div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>Predicted Priority Tier</div>
                            <div style={{ 
                              fontSize: '12.5px', 
                              fontWeight: 700, 
                              color: mlInsights.urgencyLevel === 'RED' ? '#F87171' : (mlInsights.urgencyLevel === 'AMBER' ? '#EBA756' : '#8DCFA9') 
                            }}>
                              {mlInsights.urgencyLevel} PRIORITY
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5 }}>
                          <strong>Reason:</strong> {mlInsights.urgencyReason}
                        </div>

                        {/* Critical Public Safety Safeguard */}
                        {mlInsights.humanVerificationRequired && (
                          <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <AlertTriangle size={16} color="#F87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '11.5px', color: '#FECACA', lineHeight: 1.4 }}>
                              <strong>Public Safety Human Safeguard:</strong> Critical emergency indicators identified. State policy mandates that ML predictions never independently replace human review. A Jharkhand Nodal Officer review is triggered within 24 hours.
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Semantic Duplicate Warning */}
                    {detectedDuplicates.length > 0 && (
                      <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: 'rgba(235, 167, 86, 0.08)', border: '1px solid rgba(235, 167, 86, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <AlertTriangle size={15} color="#EBA756" />
                          <span style={{ fontSize: '12px', fontWeight: 650, color: '#EBA756' }}>
                            SEMANTIC DEDUPLICATION SCAN: SIMILAR CHALLENGES DETECTED ({detectedDuplicates.length})
                          </span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '10px' }}>
                          Similar societal challenges have already been registered in Jharkhand. Submissions will be linked for collaborative R&D:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {detectedDuplicates.slice(0, 2).map((dup, idx) => (
                            <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC' }}>
                                  #{dup.id} – {dup.title || 'Challenge'}
                                </div>
                                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                                  {dup.district} • {dup.domain} • HEI: {dup.assignedUniversity}
                                </div>
                              </div>
                              <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(235, 167, 86, 0.2)', color: '#EBA756', fontSize: '11px', fontWeight: 700 }}>
                                {dup.similarityPercentage} Match
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GPS Coordinates Capture with Consent Toggle */}
                  <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color={gpsConsent ? '#00F2FE' : '#94A3B8'} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#FAF8F5' }}>
                            Optional GPS Location Consent
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                            {gpsConsent && coordinates 
                              ? `Latitude: ${coordinates.lat}, Longitude: ${coordinates.lng}`
                              : 'Helps HEI student teams navigate directly to the field testing site'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleGPS}
                        disabled={gpsLoading}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: gpsConsent ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.08)',
                          border: gpsConsent ? '1px solid #00F2FE' : '1px solid rgba(255,255,255,0.15)',
                          color: gpsConsent ? '#00F2FE' : '#FAF8F5',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {gpsLoading ? 'Acquiring...' : (gpsConsent ? '✓ Location Tagged' : 'Grant GPS Consent')}
                      </button>
                    </div>
                  </div>

                  {/* Media Upload & Device Camera Hardware Integration */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12.5px', color: '#CBD5E1' }}>
                        Photographic & Document Evidence (Camera / Upload)
                      </label>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {mediaList.length} attachment(s)
                      </span>
                    </div>

                    {/* Hidden Native File Inputs for Hardware Access */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      id="cameraNativeInput" 
                      style={{ display: 'none' }} 
                      onChange={handlePhotoUpload} 
                    />
                    <input 
                      type="file" 
                      accept="image/*,.pdf,.doc,.docx" 
                      multiple 
                      id="fileDocInput" 
                      style={{ display: 'none' }} 
                      onChange={handlePhotoUpload} 
                    />

                    {/* Hardware Buttons for Mobile & Desktop */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <button
                        type="button"
                        onClick={() => document.getElementById('cameraNativeInput').click()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: 'rgba(0, 242, 254, 0.12)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: '#00F2FE',
                          fontSize: '12px',
                          fontWeight: 650,
                          cursor: 'pointer'
                        }}
                      >
                        <Camera size={14} />
                        <span>Snap Photo (Camera)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startLiveCamera('environment')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: 'rgba(141, 207, 169, 0.12)',
                          border: '1px solid rgba(141, 207, 169, 0.3)',
                          color: '#8DCFA9',
                          fontSize: '12px',
                          fontWeight: 650,
                          cursor: 'pointer'
                        }}
                      >
                        <Video size={14} />
                        <span>Live Viewfinder</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => document.getElementById('fileDocInput').click()}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#CBD5E1',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <Upload size={14} />
                        <span>Upload Files</span>
                      </button>
                    </div>

                    {/* URL Input Fallback */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="Or paste image URL (e.g. https://...)"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(12, 12, 16, 0.8)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#FAF8F5',
                          fontSize: '12.5px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddMedia}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#FAF8F5',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        + Add
                      </button>
                    </div>

                    {/* Media Thumbnails with remove button */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {mediaList.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '70px', height: '52px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img src={url} alt={`Evidence ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setMediaList(mediaList.filter((_, i) => i !== idx))}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              border: 'none',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Beneficiaries */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', color: '#CBD5E1', marginBottom: '6px' }}>
                      Estimated Community Beneficiaries
                    </label>
                    <input
                      type="number"
                      value={estimatedBeneficiaries}
                      onChange={(e) => setEstimatedBeneficiaries(e.target.value)}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14.5px' }}
                  >
                    <span>{submitting ? 'Submitting & Running AI Deduplication...' : 'Submit Societal Challenge to SETU'}</span>
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Information / Live State Pulse */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* How it Works Card */}
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(22, 21, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 650, color: '#F8FAFC', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#00F2FE" />
                  <span>The SETU Lifecycle for Citizens</span>
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.2)', color: '#00F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, fontWeight: 700 }}>1</div>
                    <span>Issue is analyzed via NLP for deduplication and urgency rating.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, fontWeight: 700 }}>2</div>
                    <span>Automatically routed to the closest specialized University (HEI).</span>
                  </li>
                  <li style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(235, 167, 86, 0.2)', color: '#EBA756', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, fontWeight: 700 }}>3</div>
                    <span>Industry CSR sponsors fund prototype grants and field test supplies.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#CBD5E1' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(141, 207, 169, 0.2)', color: '#8DCFA9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, fontWeight: 700 }}>4</div>
                    <span>Working technology is validated in your Panchayat with real beneficiaries.</span>
                  </li>
                </ul>
              </div>

              {/* Citizen Identity Badge */}
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', background: 'rgba(22, 21, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: '8px' }}>
                  Authenticated Citizen Contributor
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#00F2FE', color: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                    {currentUser?.name?.slice(0, 2).toUpperCase() || 'RM'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#FAF8F5' }}>
                      {currentUser?.name || 'Rameshwar Mahato'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {currentUser?.district || district} District • {currentUser?.role || 'CITIZEN'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: TRACK CHALLENGE BY ID                                   */}
        {/* ============================================================== */}
        {activeTab === 'track' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Search Box */}
            <div className="glass-panel" style={{ padding: '28px', borderRadius: '20px', background: 'rgba(22, 21, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <form onSubmit={handleSearchTracking} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={trackingIdSearch}
                  onChange={(e) => setTrackingIdSearch(e.target.value)}
                  placeholder="Enter tracking ID (e.g. SETU-JH-2026-8901, SETU-JH-2026-8902) or keywords..."
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: '#0D111A',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    color: '#FAF8F5',
                    fontSize: '14.5px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Search size={16} />
                  <span>Track Status</span>
                </button>
              </form>

              {searchNotFound && (
                <div style={{ marginTop: '14px', color: '#F87171', fontSize: '13px' }}>
                  No challenge found with tracking ID "{trackingIdSearch}". Check the ID or browse your submitted list.
                </div>
              )}
            </div>

            {/* Display Found Challenge or Default Selected */}
            {searchedChallenge ? (
              <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(22, 21, 30, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                
                {/* Title & Status Badge */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#00F2FE', background: 'rgba(0, 242, 254, 0.1)', padding: '3px 10px', borderRadius: '6px' }}>
                        {searchedChallenge.id}
                      </span>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                        Submitted {new Date(searchedChallenge.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 650, color: '#F8FAFC' }}>
                      {searchedChallenge.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 650,
                      background: searchedChallenge.aiClassification?.urgency === 'RED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(235, 167, 86, 0.2)',
                      color: searchedChallenge.aiClassification?.urgency === 'RED' ? '#F87171' : '#FCD34D',
                      border: '1px solid currentColor'
                    }}>
                      URGENCY: {searchedChallenge.aiClassification?.urgency || 'AMBER'}
                    </span>

                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 650,
                      background: 'rgba(0, 242, 254, 0.15)',
                      color: '#00F2FE',
                      border: '1px solid rgba(0, 242, 254, 0.3)'
                    }}>
                      {searchedChallenge.status}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>District / Block</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FAF8F5' }}>{searchedChallenge.district}, {searchedChallenge.block}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Assigned University</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#38BDF8' }}>{searchedChallenge.assignedUniversityName || 'Pending Allocation'}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Faculty Coordinator</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#FAF8F5' }}>{searchedChallenge.team?.facultyMentor || 'Assigned in review'}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>Industry CSR Partner</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#EBA756' }}>{searchedChallenge.industryPartnerName || 'Pledge Open'}</div>
                  </div>
                </div>

                {/* 6-Stage Progress Stepper */}
                <h4 style={{ fontSize: '15px', fontWeight: 650, color: '#F8FAFC', marginBottom: '16px' }}>
                  University R&D Milestone Pipeline
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {(searchedChallenge.team?.milestones || [
                    { title: 'AI Classification & Deduplication Validation', completed: true, date: 'Completed' },
                    { title: 'HEI University Allocation & Faculty Assignment', completed: true, date: 'In Progress' },
                    { title: 'Multidisciplinary Team Formation & Prototype Proposal', completed: false, date: 'Pending' },
                    { title: 'Industry CSR Mentorship & Prototyping Grant', completed: false, date: 'Pending' },
                    { title: 'Field Pilot Testing & Community Validation', completed: false, date: 'Pending' },
                    { title: 'IP Patent Filing & Commercial Deployment', completed: false, date: 'Pending' }
                  ]).map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', background: m.completed ? 'rgba(0, 242, 254, 0.06)' : 'rgba(255,255,255,0.02)', border: m.completed ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: m.completed ? '#00F2FE' : 'rgba(255,255,255,0.1)', color: m.completed ? '#080C14' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                          {m.completed ? '✓' : idx + 1}
                        </div>
                        <span style={{ fontSize: '13.5px', color: m.completed ? '#FAF8F5' : '#94A3B8', fontWeight: m.completed ? 600 : 400 }}>
                          {m.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: m.completed ? '#00F2FE' : '#64748B' }}>
                        {m.date || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Audit Trail Snippet */}
                {searchedChallenge.auditHistory && searchedChallenge.auditHistory.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: '10px' }}>
                      Status Audit Log
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {searchedChallenge.auditHistory.slice(-3).map((item, idx) => (
                        <div key={idx} style={{ fontSize: '12.5px', color: '#94A3B8', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                          <span style={{ color: '#00F2FE', fontWeight: 600 }}>{item.action}</span> by {item.actor} ({item.role}) — {item.details}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
                <Search size={36} color="#64748B" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '15px' }}>Enter your challenge ID above or pick from your submissions below to view live pipeline progress.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: MY SUBMISSIONS                                          */}
        {/* ============================================================== */}
        {activeTab === 'my-challenges' && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 650, color: '#F8FAFC', marginBottom: '16px' }}>
              My Registered Societal Challenges ({mySubmissions.length})
            </h3>

            {mySubmissions.length === 0 ? (
              <div className="glass-panel" style={{ padding: '50px 20px', textAlign: 'center', borderRadius: '20px', background: 'rgba(22, 21, 30, 0.8)' }}>
                <Clock size={36} color="#64748B" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '18px' }}>
                  You haven't submitted any challenges yet under {currentUser?.email || 'this session'}.
                </p>
                <button onClick={() => setActiveTab('submit')} className="btn-primary">
                  Submit your first challenge →
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {mySubmissions.map(item => (
                  <div 
                    key={item.id} 
                    className="glass-panel"
                    style={{ 
                      padding: '22px', 
                      borderRadius: '18px', 
                      background: 'rgba(22, 21, 30, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#00F2FE', background: 'rgba(0, 242, 254, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                          {item.id}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {item.district}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#FAF8F5', marginBottom: '8px', lineHeight: 1.4 }}>
                        {item.title}
                      </h4>

                      <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}>
                        {item.assignedUniversityName ? item.assignedUniversityName.split(',')[0] : 'University Review'}
                      </span>
                      <button
                        onClick={() => {
                          setSearchedChallenge(item);
                          setActiveTab('track');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#00F2FE',
                          fontSize: '12.5px',
                          fontWeight: 650,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>View Status</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: OFFLINE QUEUE & SYNCHRONIZATION HUB                    */}
        {/* ============================================================== */}
        {activeTab === 'offline-queue' && (
          <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
            <div 
              className="glass-panel" 
              style={{ 
                padding: '28px', 
                borderRadius: '24px', 
                background: 'rgba(22, 21, 30, 0.85)', 
                border: '1px solid rgba(255, 255, 255, 0.08)' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Database size={18} color="#00F2FE" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 650, color: '#F8FAFC' }}>
                      Offline Synchronization Queue
                    </h3>
                  </div>
                  <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '540px', lineHeight: 1.5 }}>
                    Submissions stored on this local device. Designed for rural connectivity: queued challenges automatically transmit to the state database upon network recovery.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      await triggerBackgroundSync();
                      await loadQueueItems();
                      await fetchChallenges();
                    }}
                    disabled={syncState.isSyncing || !syncState.isOnline}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: syncState.isOnline ? '#00F2FE' : 'rgba(255,255,255,0.08)',
                      color: syncState.isOnline ? '#080C14' : '#64748B',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      border: 'none',
                      cursor: syncState.isOnline ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={13} className={syncState.isSyncing ? 'animate-spin' : ''} />
                    <span>{syncState.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              {queueItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
                  <CheckCircle2 size={44} color="#8DCFA9" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '16.5px', fontWeight: 600, color: '#F8FAFC', marginBottom: '6px' }}>
                    Local Queue is Clear
                  </h4>
                  <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto' }}>
                    All societal challenges created on this device have been successfully uploaded to the central Jharkhand registry.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {queueItems.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#F8FAFC', marginBottom: '4px' }}>
                            {item.payload.title}
                          </h4>
                          <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                            {item.payload.district} • {item.payload.block} • {item.payload.domain || 'General'}
                          </div>
                        </div>
                        
                        <span 
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            background: item.status === 'WAITING_FOR_SYNC' 
                              ? 'rgba(235, 167, 86, 0.18)' 
                              : (item.status === 'SYNCING' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(239, 68, 68, 0.18)'),
                            color: item.status === 'WAITING_FOR_SYNC' 
                              ? '#EBA756' 
                              : (item.status === 'SYNCING' ? '#38BDF8' : '#F87171')
                          }}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.5 }}>
                        {item.payload.description?.slice(0, 160)}...
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: '6px' }}>
                        <span>Idempotency Key: <code>{item.idempotencyKey}</code></span>
                        <span>Queued: {new Date(item.createdAt).toLocaleTimeString()} ({item.retryCount || 0} attempts)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Camera Viewfinder Modal */}
        {cameraModalOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0,0,0,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div style={{ width: '100%', maxWidth: '540px', background: '#121218', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0, 242, 254, 0.4)', position: 'relative' }}>
              <div style={{ padding: '12px 16px', background: '#080C14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={16} color="#00F2FE" />
                  <span style={{ fontSize: '13px', fontWeight: 650, color: '#F8FAFC' }}>
                    Live Camera Viewfinder
                  </span>
                </div>
                <button 
                  onClick={stopLiveCamera}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%', height: '360px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video 
                  ref={videoRef} 
                  playsInline 
                  autoPlay 
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div style={{ padding: '16px', background: '#080C14', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#CBD5E1',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Flip Camera</span>
                </button>

                <button
                  type="button"
                  onClick={captureLiveSnapshot}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
                    border: '4px solid #fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(0, 242, 254, 0.5)'
                  }}
                  title="Capture Evidence Photo"
                >
                  <Camera size={26} color="#080C14" />
                </button>

                <button
                  type="button"
                  onClick={stopLiveCamera}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#F87171',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
