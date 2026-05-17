import React, { useState } from 'react';
import { Copy, Instagram, Share2, MessageCircle } from 'lucide-react';
import { getShareLink } from '../../utils/shareLinks';

export default function ShareButton({ channel, disabled, onShare }) {
  const [isHovered, setIsHovered] = useState(false);

  const getChannelConfig = () => {
    switch (channel) {
      case 'whatsapp':
        return { 
          icon: <MessageCircle size={18} />, 
          label: 'WhatsApp', 
          color: '#25D366',
          gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          shadow: 'rgba(37, 211, 102, 0.4)'
        };
      case 'instagram':
        return { 
          icon: <Instagram size={18} />, 
          label: 'Instagram', 
          color: '#E1306C',
          gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          shadow: 'rgba(225, 48, 108, 0.4)'
        };
      case 'tiktok':
        return { 
          icon: <Share2 size={18} />, 
          label: 'TikTok', 
          color: '#ffffff',
          gradient: 'linear-gradient(135deg, #000000 0%, #25F4EE 50%, #FE2C55 100%)',
          shadow: 'rgba(254, 44, 85, 0.4)'
        };
      case 'copy':
        return { 
          icon: <Copy size={18} />, 
          label: 'Salin Teks', 
          color: 'var(--text-main)',
          gradient: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
          shadow: 'rgba(255, 255, 255, 0.1)'
        };
      default:
        return { 
          icon: <Share2 size={18} />, 
          label: 'Share', 
          color: 'var(--primary)',
          gradient: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          shadow: 'rgba(233, 69, 96, 0.4)'
        };
    }
  };

  const config = getChannelConfig();

  const handleClick = () => {
    if (disabled) return;
    
    const linkOrText = getShareLink(channel);
    
    if (channel === 'whatsapp') {
      window.open(linkOrText, '_blank');
    } else if (channel === 'instagram' || channel === 'tiktok') {
      navigator.clipboard.writeText(linkOrText);
      window.open(`https://www.${channel}.com/`, '_blank');
    } else if (channel === 'copy') {
      navigator.clipboard.writeText(linkOrText);
    }
    
    onShare(channel);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        padding: '0.85rem',
        borderRadius: '0.75rem',
        border: 'none',
        background: disabled 
          ? 'rgba(255, 255, 255, 0.05)' 
          : (isHovered ? config.gradient : 'rgba(255, 255, 255, 0.08)'),
        color: disabled ? 'rgba(255, 255, 255, 0.3)' : (isHovered ? '#fff' : config.color),
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: !disabled && isHovered ? 'translateY(-3px) scale(1.02)' : 'none',
        boxShadow: !disabled && isHovered ? `0 8px 20px ${config.shadow}` : '0 2px 10px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle shine effect on hover */}
      {!disabled && isHovered && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transform: 'skewX(-20deg)',
          animation: 'shine 1.5s infinite'
        }} />
      )}
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'transform 0.3s ease',
        transform: isHovered && !disabled ? 'scale(1.1)' : 'scale(1)'
      }}>
        {config.icon}
      </div>
      <span style={{ 
        fontWeight: 600, 
        fontSize: '0.9rem',
        letterSpacing: '0.02em',
        transition: 'color 0.3s ease'
      }}>
        {config.label}
      </span>
      
      <style>{`
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </button>
  );
}
