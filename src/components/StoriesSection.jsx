import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Sparkles, MapPin, GraduationCap, Building2, CheckCircle2, Award, ArrowRight } from 'lucide-react';

export default function StoriesSection({ onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const stories = [
    {
      id: 1,
      quote: "Over 14 villages in Jama block had severe fluoride contamination causing skeletal fluorosis in school children. Within hours of submitting through SETU, our issue was matched with BIT Mesra's Environmental Lab. Today, a solar bio-char filter unit is supplying clean drinking water.",
      author: "Rameshwar Mahato",
      role: "PRI Gram Pradhan",
      location: "Jama Block, Dumka District",
      domain: "Water Resources & Public Health",
      tagColor: "#00F2FE",
      university: "Birla Institute of Technology (BIT), Mesra",
      industry: "Tata Steel CSR Division",
      outcome: "18,500 villagers served • Patent IN-2026-JH-004921 Filed • Startup Incubated",
      photo: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      quote: "Unseasonal frost destroyed 60% of our tribal lac harvest every winter. Through SETU, Birsa Agricultural University and Tata Steel CSR co-engineered an IoT micro-weather early warning sensor system that notifies farmers via SMS before frost hits.",
      author: "Sunita Hembrom",
      role: "Self Help Group (SHG) Leader",
      location: "Torpa, Khunti District",
      domain: "Agriculture & Rural Livelihoods",
      tagColor: "#8DCFA9",
      university: "Birsa Agricultural University (BAU), Kanke",
      industry: "Tata Steel CSR & Agritech Alliance",
      outcome: "2,400 tribal lac farmers protected • 45% yield increase across 8 villages",
      photo: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      quote: "Perishable vegetable farmers in Ormanjhi lost 40% of produce during summer heatwaves due to lack of grid electricity for cold stores. NIT Jamshedpur designed a zero-electricity evaporative solar cooling unit that keeps vegetables fresh for 12 days.",
      author: "Vikram Soren",
      role: "Farmers Cooperative President",
      location: "Ormanjhi, Ranchi District",
      domain: "Clean Energy & Agricultural Logistics",
      tagColor: "#EBA756",
      university: "NIT Jamshedpur",
      industry: "Jharkhand MSME Innovation Alliance",
      outcome: "₹4.8 Lakhs annual savings per cooperative • 12 Solar Units Deployed",
      photo: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const current = stories[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  return (
    <section 
      style={{
        position: 'relative',
        padding: 'clamp(5rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)',
        backgroundColor: '#080C14',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div style={{ maxWidth: '1320px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', marginBottom: '3.5rem' }}>
          <div>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: '9999px',
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                color: '#00F2FE',
                fontSize: '12.5px',
                fontWeight: 500,
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={14} color="#00F2FE" />
              <span>Real Communities • Real Technological Impact</span>
            </div>

            <h2 
              style={{
                fontSize: 'clamp(32px, 3.8vw, 52px)',
                lineHeight: 1.15,
                color: '#F8FAFC',
                fontFamily: 'var(--font-editorial)',
              }}
            >
              Transforming Ground Issues into <br />
              <span style={{ color: '#00F2FE', fontStyle: 'italic', fontWeight: 400 }}>Deployed Statewide Solutions.</span>
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrev}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(0, 242, 254, 0.15)',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                color: '#00F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Feature Story Card */}
        <div 
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderRadius: '28px',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '0',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Left Text */}
          <div style={{ padding: 'clamp(2rem, 4vw, 3.5rem)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'rgba(0,242,254,0.15)', color: '#00F2FE', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
                {current.domain}
              </span>
              <span style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} color="#00F2FE" />
                {current.location}
              </span>
            </div>

            <p style={{ fontSize: 'clamp(16px, 1.4vw, 21px)', lineHeight: 1.6, color: '#F8FAFC', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>
              "{current.quote}"
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C7B8F5' }}>
                <GraduationCap size={16} color="#C7B8F5" />
                <span>HEI Partner: <strong>{current.university}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#EBA756' }}>
                <Building2 size={16} color="#EBA756" />
                <span>CSR Sponsor: <strong>{current.industry}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#8DCFA9', marginTop: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#8DCFA9" />
                <span>{current.outcome}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 650, color: '#F8FAFC' }}>{current.author}</div>
                <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>{current.role} • {current.location}</div>
              </div>
              <button 
                onClick={() => onNavigate('/support')}
                style={{ background: 'none', border: 'none', color: '#00F2FE', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View All 1,480+ Projects</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div style={{ position: 'relative', width: '100%', minHeight: '380px', backgroundColor: '#0F172A' }}>
            <img 
              src={current.photo} 
              alt={current.author}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,23,42,0.9) 0%, transparent 40%)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
