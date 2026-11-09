import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, Globe, Lock, Key, Sliders, CheckCircle2, Building, MapPin, Award } from 'lucide-react';
import { getCurrentUser, updateUserProfile, subscribeAuth } from '../services/authService';
import { apiUpdateProfile } from '../services/apiClient';

export default function ProfilePage({ onNavigate }) {
  const [currentUser, setCurrentUser] = useState(getCurrentUser() || {});
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(currentUser.name || 'Rameshwar Mahato');
  const [email, setEmail] = useState(currentUser.email || 'citizen@setu.jharkhand.gov.in');
  const [district, setDistrict] = useState(currentUser.district || 'Dumka');
  const [block, setBlock] = useState(currentUser.block || 'Jama');
  const [phone, setPhone] = useState(currentUser.phone || '+91-9431102938');
  const [organization, setOrganization] = useState(currentUser.organization || currentUser.institution || 'Community Resident');
  const [preferredLanguage, setPreferredLanguage] = useState(currentUser.language || 'English');
  const [notificationType, setNotificationType] = useState('In-Portal & SMS Alerts');

  useEffect(() => {
    return subscribeAuth((u) => {
      if (u) {
        setCurrentUser(u);
        setName(u.name || '');
        setEmail(u.email || '');
        setDistrict(u.district || 'Dumka');
        setBlock(u.block || 'Jama');
        setPhone(u.phone || '+91-9431102938');
        setOrganization(u.organization || u.institution || 'Community Resident');
      }
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const updates = { name, district, block, phone, organization, language: preferredLanguage };
    // 1. Persist locally immediately for instant UI feedback
    updateUserProfile(updates);
    // 2. Also persist to the backend so profile survives across devices/sessions
    try {
      await apiUpdateProfile({ name, phone, district, block, organization });
    } catch (e) {
      console.warn('[PROFILE] Backend update failed — saved locally only:', e.message);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            <User size={14} color="#00F2FE" />
            <span>SETU Innovation Profile</span>
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
            Stakeholder Account Details
          </h1>
          <p style={{ fontSize: '15.5px', color: '#94A3B8' }}>
            Manage your verified identity, institutional role, and district collaboration preferences on the Jharkhand Societal Innovation Portal.
          </p>
        </div>

        {saved && (
          <div 
            style={{
              background: 'rgba(20, 48, 36, 0.85)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '12px',
              padding: '12px 18px',
              color: '#86efac',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '2rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>SETU profile details updated securely.</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: '36px', borderRadius: '24px', backdropFilter: 'blur(16px)' }}>
          {/* Section: Stakeholder Identity */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC' }}>
                Verified Identity
              </h3>
              <span style={{ fontSize: '12px', background: 'rgba(0,242,254,0.15)', color: '#00F2FE', padding: '3px 10px', borderRadius: '9999px', border: '1px solid rgba(0,242,254,0.3)', fontWeight: 600 }}>
                ROLE: {currentUser.role || 'CITIZEN'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Institution / Organization</label>
                <input 
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Contact Phone</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Regional Jurisdiction */}
          <div style={{ marginBottom: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC', marginBottom: '1.25rem' }}>
              Regional Jurisdiction & Focus Block
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Jharkhand District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                >
                  {['Dumka', 'Ranchi', 'Dhanbad', 'East Singhbhum', 'Hazaribagh', 'Khunti', 'Bokaro', 'Deoghar', 'Palamu', 'West Singhbhum', 'Giridih', 'Gumla'].map(d => (
                    <option key={d} value={d}>{d} District</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Block / Panchayat Office</label>
                <input 
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Preferences */}
          <div style={{ marginBottom: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC', marginBottom: '1.25rem' }}>
              Interface & Notification Preferences
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Portal Language</label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी (Hindi)</option>
                  <option value="Santhali">ᱥᱟᱱᱛᱟᱲᱤ (Santhali)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#94A3B8', marginBottom: '6px' }}>Project Notifications</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#0F172A',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#F8FAFC',
                    fontSize: '14px',
                  }}
                >
                  <option value="In-Portal & SMS Alerts">In-Portal & SMS Alerts</option>
                  <option value="In-Portal Anonymous Only">In-Portal Anonymous Only</option>
                  <option value="Department Official Email">Department Official Email</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div 
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'rgba(0, 242, 254, 0.05)',
              border: '1px solid rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '2rem',
            }}
          >
            <Lock size={20} color="#00F2FE" />
            <div style={{ fontSize: '13px', color: '#94A3B8' }}>
              All stakeholder information on SETU is protected under Government of Jharkhand IT data governance and university IP confidentiality rules.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button"
              onClick={() => onNavigate('/settings')}
              className="btn-secondary"
            >
              Privacy & Data Controls
            </button>
            <button 
              type="submit"
              className="btn-primary"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
