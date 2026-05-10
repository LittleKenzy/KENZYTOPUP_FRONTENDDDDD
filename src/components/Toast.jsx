import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const bg = type === 'success' ? 'var(--success)' : 'var(--danger)';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="animate-slide-up" style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      backgroundColor: 'var(--surface-card)',
      borderLeft: `4px solid ${bg}`,
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      padding: '1rem 1.5rem',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 100,
    }}>
      <Icon size={24} color={bg} />
      <span style={{ fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>
        <X size={18} />
      </button>
    </div>
  );
}
