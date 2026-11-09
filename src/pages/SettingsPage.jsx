import React, { useState } from 'react';
import { Shield, Eye, Trash2, CheckCircle, Lock, RefreshCw, Key, ShieldCheck, Database, HardDriveDownload } from 'lucide-react';
import { resetConversation } from '../services/conversationEngine';

export default function SettingsPage({ onNavigate }) {
  const [historySaved, setHistorySaved] = useState(true);
  const [anonymizedStats, setAnonymizedStats] = useState(true);
  const [exifScrubbing, setExifScrubbing] = useState(true);
  const [deletedSuccess, setDeletedSuccess] = useState(false);

  const handleDeleteHistory = () => {
    if (confirm("Are you sure you want to permanently purge all cached community challenges, conversational intake history, and temporary GPS/media signals from this browser?")) {
      try {
        // 1. Clear all localStorage keys for SETU state
        localStorage.removeItem('SETU_CONVERSATION_STATE_V1');
        localStorage.removeItem('SETU_PLATFORM_STATE_V1');
        localStorage.removeItem('HERE_CONVERSATION_STATE_V1');
        localStorage.removeItem('HERE_PLATFORM_STATE_V1');
        // 2. Reset conversation engine to fresh state
        resetConversation();
        // 3. Clear IndexedDB offline storage (drafts + sync queue)
        if (typeof indexedDB !== 'undefined') {
          indexedDB.deleteDatabase('SETU_OFFLINE_DB');
        }
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Error clearing local storage:', e);
      }
      setDeletedSuccess(true);
      setTimeout(() => setDeletedSuccess(false), 3500);
    }
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#080C14', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 3rem)' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
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
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={14} color="#00F2FE" />
            <span>SETU Data Privacy & Sovereign Storage Architecture</span>
          </div>

          <h1 
            style={{
              fontSize: 'clamp(32px, 3.8vw, 48px)',
              fontWeight: 650,
              color: '#F8FAFC',
              fontFamily: 'var(--font-editorial)',
              letterSpacing: '-0.02em',
              marginBottom: '0.75rem',
            }}
          >
            Privacy Controls & Local Data
          </h1>
          <p style={{ fontSize: '15.5px', color: '#94A3B8' }}>
            Zero commercial ad trackers. You hold cryptographic control over your community reports, multimedia evidence metadata, and local intake signals.
          </p>
        </div>

        {deletedSuccess && (
          <div 
            style={{
              background: 'rgba(20, 48, 36, 0.85)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '12px',
              padding: '14px 18px',
              color: '#86efac',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '2rem',
            }}
          >
            <CheckCircle size={16} />
            <span>All local browser session caches, intake drafts, and signals successfully purged.</span>
          </div>
        )}

        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '36px', borderRadius: '24px', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: What SETU Stores */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#00F2FE" />
              What SETU Stores in the State Database
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '14px' }}>
              Only verified societal challenges, confirmed university laboratory allocation files, CSR grant funding pledges, and officially filed patents.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 500 }}>Retain Chat Intake Drafts Locally</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>Allows resuming ongoing problem description turns on this device</div>
              </div>
              <input 
                type="checkbox" 
                checked={historySaved} 
                onChange={(e) => setHistorySaved(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#00F2FE', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Section 2: Zero-EXIF & AI Privacy */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.75rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#8DCFA9" />
              Media Privacy & Automated EXIF Scrubbing
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '14px' }}>
              When citizens upload photos or location coordinates, camera serial numbers, personal device metadata, and precise biometric markers are scrubbed before reaching researchers.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 500 }}>Automatic Client-Side EXIF Scrubbing</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>Strips camera metadata, IMEI, and timestamp tags prior to server upload</div>
              </div>
              <input 
                type="checkbox" 
                checked={exifScrubbing} 
                onChange={(e) => setExifScrubbing(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#8DCFA9', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Section 3: Anonymous Pulse Analytics */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.75rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#EBA756" />
              State Innovation Pulse Aggregate Analytics
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '14px' }}>
              Contribute anonymized cluster statistics to the Department of Higher & Technical Education (e.g. rising fluoride spikes in Dumka or frost crop losses in Bero) without exposing citizen identities.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 500 }}>Statewide Thematic Heatmap Analytics</div>
                <div style={{ fontSize: '12.5px', color: '#64748B' }}>Helps university researchers prioritize high-urgency rural problems</div>
              </div>
              <input 
                type="checkbox" 
                checked={anonymizedStats} 
                onChange={(e) => setAnonymizedStats(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#EBA756', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Section 4: What You Control */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.75rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px' }}>
              Cryptographic Data Purge
            </h3>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '16px' }}>
              You may purge all active conversation drafts, temporary authentication signals, and cached records stored on this device at any time.
            </p>
            <button
              onClick={handleDeleteHistory}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              <Trash2 size={16} />
              <span>Purge Local Browser History & Reset Signals</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
