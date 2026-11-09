import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { AssistantOrb } from '../components/AssistantOrb';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div 
      style={{
        minHeight: '100vh',
        backgroundColor: '#05080F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div 
        className="glass-panel"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '48px 36px',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <AssistantOrb size={88} state="thinking" />
        </div>

        <div 
          style={{
            fontSize: '13px',
            color: '#8EDCF2',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}
        >
          404 · Page Not Found
        </div>

        <h1 
          style={{
            fontSize: 'clamp(28px, 3.5vw, 42px)',
            fontWeight: 650,
            color: '#F5F4F2',
            fontFamily: 'var(--font-display)',
            marginBottom: '12px',
          }}
        >
          Looks like you wandered somewhere else.
        </h1>

        <p style={{ fontSize: '15.5px', color: '#9BA4B5', lineHeight: 1.6, marginBottom: '2rem' }}>
          Let’s get you back to where you need to be.
        </p>

        <button 
          onClick={() => onNavigate('/')}
          className="btn-primary"
          style={{ margin: '0 auto', fontSize: '14.5px', padding: '12px 28px' }}
        >
          <ArrowLeft size={16} />
          <span>Return to HERE →</span>
        </button>
      </div>
    </div>
  );
}
