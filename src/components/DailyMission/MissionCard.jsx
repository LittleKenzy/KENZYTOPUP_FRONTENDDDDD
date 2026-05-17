import React, { useState, useEffect } from 'react';
import { Gift, Info, Sparkles, ChevronRight } from 'lucide-react';
import { STORE_CONFIG } from '../../config/constants';
import MissionStatus from './MissionStatus';
import ShareButton from './ShareButton';

export default function MissionCard({ status, onShareClick }) {
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate countdown to resetAt
  useEffect(() => {
    if (!status?.resetAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(status.resetAt) - new Date();
      let timeLeftStr = '';

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        timeLeftStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        timeLeftStr = '00:00:00';
      }
      setTimeLeft(timeLeftStr);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [status?.resetAt]);

  if (!status) return null;

  return (
    <div style={{
      position: 'relative',
      borderRadius: '1.25rem',
      background: 'linear-gradient(145deg, var(--surface-card) 0%, rgba(20,20,20,1) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      overflow: 'hidden',
      marginBottom: '2rem'
    }}>
      {/* Decorative Glow Elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'var(--primary)',
        filter: 'blur(80px)',
        opacity: 0.15,
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-50px',
        left: '-50px',
        width: '150px',
        height: '150px',
        background: 'var(--accent)',
        filter: 'blur(80px)',
        opacity: 0.1,
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{ padding: '1.75rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '1rem', 
              background: status.completed ? 'rgba(16, 185, 129, 0.1)' : 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              color: status.completed ? 'var(--success)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: status.completed ? 'none' : '0 8px 16px rgba(233, 69, 96, 0.3)',
              position: 'relative'
            }}>
              {!status.completed && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '1rem',
                  boxShadow: '0 0 15px var(--accent)',
                  animation: 'pulse 2s infinite',
                  opacity: 0.5
                }} />
              )}
              <Gift size={28} />
            </div>
            
            <div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.02em' }}>
                Misi Harian <MissionStatus completed={status.completed} />
              </h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Bantu sebarkan info toko kami & klaim hadiahmu!
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 100%)',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={12} color="var(--accent)" /> Reward
            </span>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              background: 'linear-gradient(to right, #f59e0b, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(245, 158, 11, 0.2)'
            }}>
              +{STORE_CONFIG.missionPoints} Poin
            </span>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.2)', 
          padding: '1.25rem', 
          borderRadius: '0.75rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          borderLeft: '3px solid var(--accent)'
        }}>
          <Info size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
            Bagikan link toko kami melalui salah satu platform di bawah ini.
            Misi ini <strong style={{ color: '#fff' }}>hanya dapat diklaim 1x setiap harinya</strong> dan otomatis di-reset pada pukul 00:00 WIB.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
          <ShareButton channel="whatsapp" disabled={status.completed} onShare={onShareClick} />
          <ShareButton channel="instagram" disabled={status.completed} onShare={onShareClick} />
          <ShareButton channel="tiktok" disabled={status.completed} onShare={onShareClick} />
          <ShareButton channel="copy" disabled={status.completed} onShare={onShareClick} />
        </div>

        {status.completed && (
          <div className="animate-fade-in" style={{ 
            marginTop: '2rem', 
            paddingTop: '1.25rem', 
            borderTop: '1px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.9rem'
          }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Misi selesai, kembali besok <ChevronRight size={14} />
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem' }}>
              Reset: <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '1px' }}>{timeLeft}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
