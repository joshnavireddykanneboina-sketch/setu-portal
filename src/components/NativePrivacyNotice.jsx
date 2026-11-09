import React, { useEffect, useState } from 'react';
import { isNativeApp } from '../services/apiConfig';

const STORAGE_KEY = 'SETU_ANDROID_PRIVACY_ACK_V1';

export default function NativePrivacyNotice({ onNavigate }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'yes') setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'yes');
    } catch {
      // The notice can be dismissed for this session even if storage is blocked.
    }
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="setu-privacy-title"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        zIndex: 1200,
        background: '#121826',
        color: '#F8FAFC',
        border: '1px solid rgba(0, 242, 254, 0.35)',
        borderRadius: 16,
        padding: '16px 16px 14px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.45)'
      }}
    >
      <h2 id="setu-privacy-title" style={{ fontSize: 16, margin: '0 0 8px' }}>
        What this app uses
      </h2>
      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#CBD5E1', margin: '0 0 8px' }}>
        SETU uses the camera for challenge photos, location to tag a district problem, and the network to send submissions to the Government of Jharkhand server. Drafts and pending submissions stay on this phone until they sync.
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: '#94A3B8', margin: '0 0 12px' }}>
        Photos and location are sent only when you submit a challenge. SETU does not run in the background to track you.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn-primary" onClick={accept} style={{ padding: '8px 14px' }}>
          Continue
        </button>
        <button
          type="button"
          onClick={() => {
            accept();
            onNavigate('/privacy');
          }}
          style={{
            background: 'transparent',
            color: '#00F2FE',
            border: '1px solid rgba(0,242,254,0.4)',
            borderRadius: 999,
            padding: '8px 14px',
            cursor: 'pointer'
          }}
        >
          Privacy details
        </button>
      </div>
    </div>
  );
}
