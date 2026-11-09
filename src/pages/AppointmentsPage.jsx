import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Check, ChevronLeft, ChevronRight, User, ShieldCheck, Sparkles, ArrowRight, GraduationCap, Building2, Cpu, CheckCircle2 } from 'lucide-react';
import { getStore } from '../services/store';

export default function AppointmentsPage({ onNavigate }) {
  const [selectedDept, setSelectedDept] = useState('Water Resources R&D Lab');
  const [selectedDate, setSelectedDate] = useState('Wednesday, Oct 28');
  const [selectedTime, setSelectedTime] = useState('02:30 PM');
  const [selectedLead, setSelectedLead] = useState('Dr. Rajeshwar Prasad (BIT Mesra)');
  const [isBooked, setIsBooked] = useState(false);

  const departments = [
    'Water Resources R&D Lab',
    'Agri-Tech & Soil Testing Center',
    'Clean Energy Micro-grid Lab',
    'CSR Funding Sign-off Committee',
    'Patent & IP Legal Office',
  ];

  const specialists = [
    { name: 'Dr. Rajeshwar Prasad', dept: 'Water Resources R&D Lab', spec: 'Bio-Char & Fluoride Filtration Systems', rating: 'BIT Mesra' },
    { name: 'Dr. Swati Soren', dept: 'Agri-Tech & Soil Testing Center', spec: 'IoT Frost Early Warning Systems', rating: 'BAU Kanke' },
    { name: 'Amitabh Choudhury', dept: 'CSR Funding Sign-off Committee', spec: 'CSR Grant Allocation & Manufacturing Support', rating: 'Tata Steel CSR' },
    { name: 'Dr. Subhashish Roy, IAS', dept: 'Patent & IP Legal Office', spec: 'Statewide Deployment & Incubation', rating: 'Govt. of Jharkhand' }
  ];

  const timeslots = ['09:00 AM', '10:30 AM', '11:45 AM', '02:30 PM', '03:45 PM', '05:00 PM'];
  const days = [
    { label: 'Wed', dateText: 'Wednesday, Oct 28', num: 28 },
    { label: 'Thu', dateText: 'Thursday, Oct 29', num: 29 },
    { label: 'Fri', dateText: 'Friday, Oct 30', num: 30 },
    { label: 'Mon', dateText: 'Monday, Nov 02', num: 2 },
  ];

  const handleConfirm = () => {
    setIsBooked(true);
  };

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#080C14', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 3rem)' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
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
              marginBottom: '1rem',
            }}
          >
            <CalendarIcon size={14} color="#00F2FE" />
            <span>HEI R&D Lab & CSR Review Schedule</span>
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 48px)', fontWeight: 650, color: '#F8FAFC', fontFamily: 'var(--font-editorial)', marginBottom: '0.8rem' }}>
            Schedule Lab Milestone & Funding Review
          </h1>
          <p style={{ fontSize: '15.5px', color: '#94A3B8', maxWidth: '640px', lineHeight: 1.6 }}>
            Reserve consultation slots with university laboratory leads, faculty mentors, and corporate CSR funding committees across Jharkhand.
          </p>
        </div>

        {isBooked ? (
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#00F2FE" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', color: '#F8FAFC', marginBottom: '8px' }}>R&D Consultation Scheduled!</h2>
            <p style={{ fontSize: '14.5px', color: '#94A3B8', marginBottom: '24px' }}>
              Reserved with <strong>{selectedLead}</strong> ({selectedDept}) for {selectedDate} at {selectedTime}.
            </p>
            <button onClick={() => onNavigate('/journey')} style={{ background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)', border: 'none', borderRadius: '9999px', padding: '12px 28px', color: '#080C14', fontWeight: 650, cursor: 'pointer' }}>
              Return to University Hub →
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
            
            {/* Main Form */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12.5px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Select R&D Laboratory or Review Committee
                </label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  style={{ width: '100%', background: '#0F172A', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '12px', padding: '12px', color: '#F8FAFC', fontSize: '14px', outline: 'none' }}
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Select Target Date
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {days.map(d => (
                    <button
                      key={d.label}
                      onClick={() => setSelectedDate(d.dateText)}
                      style={{
                        background: selectedDate === d.dateText ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: selectedDate === d.dateText ? '1px solid #00F2FE' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '12px',
                        color: selectedDate === d.dateText ? '#00F2FE' : '#F8FAFC',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>{d.label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700 }}>{d.num}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Select Time Slot
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {timeslots.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      style={{
                        background: selectedTime === t ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: selectedTime === t ? '1px solid #00F2FE' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '10px',
                        color: selectedTime === t ? '#00F2FE' : '#F8FAFC',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', color: '#F8FAFC', fontWeight: 650 }}>Reservation Summary</h3>
              
              <div style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong style={{ color: '#F8FAFC' }}>Committee:</strong> {selectedDept}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Date:</strong> {selectedDate}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Time:</strong> {selectedTime}</div>
                <div><strong style={{ color: '#F8FAFC' }}>Lead:</strong> {selectedLead}</div>
              </div>

              <button
                onClick={handleConfirm}
                style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '12px',
                  color: '#080C14',
                  fontSize: '14px',
                  fontWeight: 650,
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
