import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      padding: '2rem 1rem',
    }}>
      <div className="card animate-slide-up" style={{
        width: '100%',
        maxWidth: '500px',
        margin: 'auto', // Ini akan menengahkannya di PC, dan menahannya di atas di HP
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, wordBreak: 'break-word' }}>{title}</h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
