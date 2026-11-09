import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Play, 
  Users, 
  X,
  Sparkles,
  Building2,
  GraduationCap,
  Award,
  Compass,
  CheckCircle2,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { t } from '../services/i18n';

const TOTAL_FRAMES = 100;

export default function Hero({ onNavigate, onStartChat }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [framesLoaded, setFramesLoaded] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [, setLangTick] = useState(0);
  const animFrameId = useRef(null);
  const frameCurrentRef = useRef(0);

  useEffect(() => {
    const handleLangChange = () => setLangTick(t => t + 1);
    window.addEventListener('setu-lang-changed', handleLangChange);
    return () => window.removeEventListener('setu-lang-changed', handleLangChange);
  }, []);

  // Preload frames if available
  useEffect(() => {
    let loadedCount = 0;
    const imgs = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, '0');
      img.src = `/frames/frame_${paddedIndex}.jpg`;

      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setFramesLoaded(true);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setFramesLoaded(true);
        }
      };

      imgs.push(img);
    }

    imagesRef.current = imgs;

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  // Frame Loop
  useEffect(() => {
    let lastTime = performance.now();
    const fps = 24;
    const interval = 1000 / fps;
    let direction = 1;
    let pauseUntil = 0;

    const renderLoop = (now) => {
      if (now < pauseUntil) {
        animFrameId.current = requestAnimationFrame(renderLoop);
        return;
      }

      const delta = now - lastTime;
      if (delta >= interval) {
        lastTime = now - (delta % interval);
        let nextFrame = frameCurrentRef.current + direction;

        if (nextFrame >= TOTAL_FRAMES - 1) {
          nextFrame = TOTAL_FRAMES - 1;
          direction = -1;
          pauseUntil = now + 1800;
        } else if (nextFrame <= 0) {
          nextFrame = 0;
          direction = 1;
          pauseUntil = now + 1000;
        }

        frameCurrentRef.current = nextFrame;
        drawFrame(nextFrame);
        setCurrentFrame(nextFrame);
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    if (framesLoaded) {
      animFrameId.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [framesLoaded]);

  const drawFrame = (frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIdx];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const hRatio = cw / iw;
    const vRatio = ch / ih;
    const ratio = Math.max(hRatio, vRatio);

    const centerShiftX = (cw - iw * ratio) / 2;
    const centerShiftY = (ch - ih * ratio) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, iw, ih, centerShiftX, centerShiftY, iw * ratio, ih * ratio);
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawFrame(frameCurrentRef.current);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [framesLoaded]);

  return (
    <section 
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '92vh',
        backgroundColor: '#080C14',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '100px',
        paddingBottom: '60px',
      }}
    >
      {/* Background Canvas / Gradient Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: framesLoaded ? 'block' : 'none' }} />
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 20% 30%, rgba(0, 242, 254, 0.12) 0%, rgba(8, 12, 20, 0.85) 60%, rgba(8, 12, 20, 0.98) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1320px',
          width: '100%',
          margin: '0 auto',
          padding: '0 clamp(1.2rem, 4vw, 3rem)',
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 680px) 1fr',
          alignItems: 'center',
          gap: '3rem',
        }}
      >
        {/* Left Column: Heading & CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {/* Government Nodal Tag */}
          <div>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                backdropFilter: 'blur(12px)',
                fontSize: '12.5px',
                color: '#00F2FE',
                fontWeight: 500,
              }}
            >
              <Cpu size={14} color="#00F2FE" />
              <span>{t('govTag')}</span>
            </div>
          </div>

          {/* Fraunces Editorial Headline */}
          <h1 
            style={{
              fontSize: 'clamp(36px, 4.2vw, 62px)',
              lineHeight: 1.12,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#F8FAFC',
              fontFamily: 'var(--font-editorial)',
            }}
          >
            {t('heroTitleLine1')} <br />
            {t('heroTitleLine2')} <br />
            <span style={{ color: '#00F2FE', fontStyle: 'italic', fontWeight: 400 }}>{t('heroTitleHighlight')}</span>
          </h1>

          {/* Subtitle Copy */}
          <p 
            style={{
              fontSize: 'clamp(15px, 1.1vw, 17px)',
              lineHeight: 1.65,
              color: '#94A3B8',
              maxWidth: '560px',
            }}
          >
            {t('heroSubtitle')}
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', paddingTop: '6px' }}>
            <button
              onClick={() => onNavigate('/chat')}
              style={{
                background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
                border: 'none',
                borderRadius: '9999px',
                padding: '14px 28px',
                color: '#080C14',
                fontSize: '15px',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 25px rgba(0, 242, 254, 0.35)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>{t('btnSubmitChallenge')}</span>
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => onNavigate('/support')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '9999px',
                padding: '14px 24px',
                color: '#F8FAFC',
                fontSize: '14.5px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
            >
              <Compass size={16} color="#00F2FE" />
              <span>{t('btnExploreLive')}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-time State Impact Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '24px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00F2FE', fontWeight: 600 }}>
                {t('pulseTitle')}
              </span>
              <span style={{ fontSize: '11px', background: 'rgba(0, 242, 254, 0.15)', color: '#00F2FE', padding: '3px 9px', borderRadius: '9999px' }}>
                {t('nepTag')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-display)' }}>{t('statCrowdsourced')}</div>
                <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>{t('labelCrowdsourced')}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#00F2FE', fontFamily: 'var(--font-display)' }}>{t('statHeis')}</div>
                <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>{t('labelHeis')}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#EBA756', fontFamily: 'var(--font-display)' }}>{t('statCsr')}</div>
                <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>{t('labelCsr')}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#8DCFA9', fontFamily: 'var(--font-display)' }}>{t('statPatents')}</div>
                <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>{t('labelPatents')}</div>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#8DCFA9" />
                {t('districtsActive')}
              </span>
              <button 
                onClick={() => setVideoModalOpen(true)}
                style={{ background: 'none', border: 'none', color: '#00F2FE', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Play size={12} fill="#00F2FE" />
                Watch Platform Flow
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Walkthrough Video Modal */}
      {videoModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(8, 12, 20, 0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setVideoModalOpen(false)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '860px',
              width: '100%',
              background: '#0F172A',
              borderRadius: '24px',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="#00F2FE" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#F8FAFC' }}>SETU Portal Walkthrough (SIH PS 26043)</span>
              </div>
              <button 
                onClick={() => setVideoModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video 
                src="/video.mp4" 
                controls 
                autoPlay 
                style={{ width: '100%', maxHeight: '460px', display: 'block' }}
                onError={(e) => {
                  // Fallback visual if video file is not local
                  e.target.style.display = 'none';
                }}
              />
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Cpu size={48} color="#00F2FE" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', color: '#F8FAFC', marginBottom: '8px' }}>SETU Innovation Collaboration Model</h3>
                <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '500px', margin: '0 auto 20px' }}>
                  Citizens & Local Bodies Submit Issues ➔ AI Deduplicates & Categorizes ➔ HEIs Form Multidisciplinary Teams ➔ Industry Mentors Provide CSR Funding ➔ Field Deployment & Patenting.
                </p>
              </div>
            </div>

            <div style={{ padding: '16px 20px', fontSize: '13.5px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Dept. of Higher & Technical Education, Government of Jharkhand</span>
              <button 
                onClick={() => {
                  setVideoModalOpen(false);
                  onNavigate('/chat');
                }}
                style={{
                  background: 'linear-gradient(135deg, #00F2FE 0%, #38BDF8 100%)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '8px 18px',
                  color: '#080C14',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span>Launch Citizen Submission</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
