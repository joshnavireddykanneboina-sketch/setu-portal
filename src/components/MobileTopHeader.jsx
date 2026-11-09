// Mobile Top Header for SETU Platform
// Renders responsive mobile header (<= 768px) with state branding, live offline/sync status, and PWA install button

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  Sparkles, 
  Layers, 
  Search,
  Bell
} from 'lucide-react';
import { subscribeSyncState, triggerBackgroundSync, getQueueMetrics } from '../services/syncManager';

export default function MobileTopHeader({ onNavigate, onOpenSearch }) {
  const [syncState, setSyncState] = useState({ isOnline: true, isSyncing: false });
  const [queueMetrics, setQueueMetrics] = useState({ total: 0, pending: 0, failed: 0 });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showSyncDetails, setShowSyncDetails] = useState(false);

  useEffect(() => {
    const unsub = subscribeSyncState((state) => {
      setSyncState({ ...state });
      getQueueMetrics().then(setQueueMetrics);
    });

    getQueueMetrics().then(setQueueMetrics);
    return unsub;
  }, []);

  // Listen for PWA Install prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[SETU PWA] User install choice:', outcome);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleManualSync = async () => {
    if (!syncState.isOnline) {
      alert('Your device is currently offline. Connect to Wi-Fi or mobile data to sync queued challenges.');
      return;
    }
    await triggerBackgroundSync();
    getQueueMetrics().then(setQueueMetrics);
  };

  return (
    <>
      <header 
        className="mobile-top-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 850,
          backgroundColor: 'rgba(8, 12, 20, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px'
        }}
      >
        {/* Brand Emblem */}
        <div 
          onClick={() => onNavigate('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(56, 189, 248, 0.05) 100%)',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#00F2FE' }}>से</span>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.04em', lineHeight: 1.1 }}>
              SETU <span style={{ fontSize: '10px', color: '#00F2FE', fontWeight: 600 }}>JH</span>
            </div>
            <div style={{ fontSize: '9px', color: '#94A3B8' }}>
              Govt. of Jharkhand
            </div>
          </div>
        </div>

        {/* Right Action Icons: Online/Offline Pill & PWA Install */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 9px',
                borderRadius: '8px',
                background: 'rgba(0, 242, 254, 0.15)',
                border: '1px solid rgba(0, 242, 254, 0.35)',
                color: '#00F2FE',
                fontSize: '11px',
                fontWeight: 650,
                cursor: 'pointer'
              }}
              title="Install SETU Application on this device"
            >
              <Download size={12} />
              <span>Install</span>
            </button>
          )}

          {/* Connectivity / Queue Sync Pill */}
          <button
            onClick={handleManualSync}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: !syncState.isOnline
                ? 'rgba(235, 167, 86, 0.15)'
                : (syncState.isSyncing 
                  ? 'rgba(56, 189, 248, 0.15)' 
                  : (queueMetrics.pending > 0 ? 'rgba(235, 167, 86, 0.15)' : 'rgba(141, 207, 169, 0.12)')),
              border: !syncState.isOnline
                ? '1px solid rgba(235, 167, 86, 0.4)'
                : (syncState.isSyncing 
                  ? '1px solid rgba(56, 189, 248, 0.4)' 
                  : (queueMetrics.pending > 0 ? '1px solid rgba(235, 167, 86, 0.4)' : '1px solid rgba(141, 207, 169, 0.3)')),
              color: !syncState.isOnline
                ? '#EBA756'
                : (syncState.isSyncing ? '#38BDF8' : (queueMetrics.pending > 0 ? '#EBA756' : '#8DCFA9')),
              fontSize: '11px',
              fontWeight: 650,
              cursor: 'pointer'
            }}
            title={!syncState.isOnline ? 'Offline: challenges will queue locally' : 'Click to sync pending challenges'}
          >
            {!syncState.isOnline ? (
              <>
                <WifiOff size={11} color="#EBA756" />
                <span>Offline {queueMetrics.pending > 0 ? `(${queueMetrics.pending})` : ''}</span>
              </>
            ) : syncState.isSyncing ? (
              <>
                <RefreshCw size={11} className="animate-spin" color="#38BDF8" />
                <span>Syncing...</span>
              </>
            ) : queueMetrics.pending > 0 ? (
              <>
                <RefreshCw size={11} color="#EBA756" />
                <span>Sync ({queueMetrics.pending})</span>
              </>
            ) : (
              <>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8DCFA9' }} />
                <span>Online</span>
              </>
            )}
          </button>

          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Search SETU"
          >
            <Search size={15} />
          </button>
        </div>
      </header>
    </>
  );
}
