import React, { useState } from 'react';
import { GraduationCap, Building2, Calendar, Clock, Star, ShieldCheck, ArrowRight, UserCheck, MessageSquare, Award, Sparkles } from 'lucide-react';

export default function CounsellingPage({ onNavigate }) {
  const [bookedMentor, setBookedMentor] = useState(null);

  const mentors = [
    {
      id: 1,
      name: "Dr. Rajeshwar Prasad",
      role: "Head of Innovation & Incubation Cell",
      institution: "BIT Mesra, Ranchi",
      specialties: ["Water Filtration Technologies", "IoT & Sensor Networks", "Clean Energy"],
      availability: "Wed, 11:00 AM",
      rating: "4.9",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 2,
      name: "Dr. Swati Soren",
      role: "Professor & Extension Coordinator",
      institution: "Birsa Agricultural University (BAU), Kanke",
      specialties: ["Smart Agriculture", "Soil Health", "Frost Defense Systems"],
      availability: "Thu, 2:30 PM",
      rating: "4.9",
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: 3,
      name: "Amitabh Choudhury",
      role: "Head of Community Innovation & CSR Funding",
      institution: "Tata Steel CSR Division, Jamshedpur",
      specialties: ["CSR Project Funding", "Prototyping Grants", "Field Manufacturing"],
      availability: "Fri, 10:00 AM",
      rating: "5.0",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#080C14', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 3rem)' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
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
            <GraduationCap size={14} color="#00F2FE" />
            <span>Faculty & Industry Technical Mentorship Hub</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 650, color: '#F8FAFC', fontFamily: 'var(--font-editorial)', marginBottom: '1rem' }}>
            Book Consultation with HEI Mentors & CSR Leads
          </h1>
          <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '680px', lineHeight: 1.6 }}>
            Connect multidisciplinary student teams with university faculty advisors and corporate CSR technical leaders for prototyping guidance, funding approval, and pilot testing sign-offs.
          </p>
        </div>

        {/* Mentors Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {mentors.map(m => (
            <div 
              key={m.id}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: '24px',
                padding: '24px',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={m.photo} alt={m.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00F2FE' }} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F8FAFC' }}>{m.name}</h3>
                  <div style={{ fontSize: '13px', color: '#00F2FE', fontWeight: 500 }}>{m.role}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>{m.institution}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {m.specialties.map((s, idx) => (
                  <span key={idx} style={{ background: 'rgba(255,255,255,0.04)', color: '#CBD5E1', fontSize: '11.5px', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {s}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12.5px', color: '#8DCFA9', fontWeight: 600 }}>
                  Next Slot: {m.availability}
                </div>
                <button
                  onClick={() => setBookedMentor(m)}
                  style={{
                    background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '8px 18px',
                    color: '#080C14',
                    fontSize: '13px',
                    fontWeight: 650,
                    cursor: 'pointer',
                  }}
                >
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Confirmation Modal */}
        {bookedMentor && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(8,12,20,0.88)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ maxWidth: '480px', width: '100%', background: '#0F172A', borderRadius: '24px', border: '1px solid rgba(0,242,254,0.3)', padding: '28px', textAlign: 'center' }}>
              <Award size={36} color="#00F2FE" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}>Mentorship Session Confirmed</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
                Consultation scheduled with <strong>{bookedMentor.name}</strong> ({bookedMentor.institution}) for {bookedMentor.availability}.
              </p>
              <button onClick={() => setBookedMentor(null)} style={{ background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)', border: 'none', borderRadius: '9999px', padding: '10px 24px', color: '#080C14', fontWeight: 650, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
