import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

export default function MissionStatus({ completed }) {
  if (completed) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        color: 'var(--success)',
        fontSize: '0.875rem',
        fontWeight: 600
      }}>
        <CheckCircle size={16} />
        <span>Selesai</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      color: '#f59e0b',
      fontSize: '0.875rem',
      fontWeight: 600
    }}>
      <Clock size={16} />
      <span>Belum dikerjakan</span>
    </div>
  );
}
