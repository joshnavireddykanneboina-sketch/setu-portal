import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Cpu, ShieldCheck } from 'lucide-react';

export default function HelpPage({ onNavigate }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is SETU?",
      a: "SETU is the official digital portal developed for the Department of Higher & Technical Education, Government of Jharkhand (SIH PS 26043). It crowdsources ground-level societal challenges from citizens, Panchayati Raj Institutions (PRIs), and local bodies across all 24 districts, connecting them with Higher Education Institutions (HEIs) and Industry CSR partners for innovation-driven solutions.",
    },
    {
      q: "How does the AI Engine classify and deduplicate submitted problems?",
      a: "The SETU AI Engine automatically classifies issues across 10 thematic domains (Water Resources, Agriculture, Healthcare, Energy, Urban Dev, etc.), performs sub-10ms semantic deduplication scans against 1,480+ existing issues to avoid redundant work, and calculates social impact/priority scores.",
    },
    {
      q: "How are universities assigned to societal challenges?",
      a: "Validated problem statements are automatically routed to suitable Higher Education Institutions (BIT Mesra, NIT Jamshedpur, Birsa Agricultural University, IIT-ISM Dhanbad) based on faculty specializations, lab capabilities, and incubation centers.",
    },
    {
      q: "How do Industry CSR partners participate?",
      a: "Corporate entities (Tata Steel CSR, Central Coalfields Ltd, SAIL Bokaro, MSMEs) explore high-priority HEI solution proposals on the portal, pledge co-development grants (₹3 Lakhs - ₹15 Lakhs), assign technical mentors, and sponsor pilot implementations.",
    },
    {
      q: "How are patents and spinoff startups handled?",
      a: "Solutions created by multidisciplinary student-faculty teams are supported through expedited patent filing (IN-2026-JH-XXXX) and incubated within university incubation centers (BIT STEP, CIIE Dhanbad, ABIC BAU).",
    },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#080C14', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 clamp(1.5rem, 5vw, 3rem)' }}>
        
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
            <HelpCircle size={14} color="#00F2FE" />
            <span>Platform FAQs & Knowledge Base</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 650, color: '#F8FAFC', fontFamily: 'var(--font-editorial)', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.6 }}>
            Everything you need to know about crowdsourcing societal challenges, AI deduplication, university matching, and industry CSR partnerships on SETU.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: isOpen ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  transition: 'all 200ms ease',
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    color: '#F8FAFC',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={20} color="#00F2FE" /> : <ChevronDown size={20} color="#94A3B8" />}
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 20px', fontSize: '14.5px', color: '#94A3B8', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
