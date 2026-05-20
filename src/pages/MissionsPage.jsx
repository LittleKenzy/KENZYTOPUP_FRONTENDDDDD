import React from 'react';
import { Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DailyMission from '../components/DailyMission';
import './NotificationsPage.css';

const MissionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="notifications-page__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} className="btn-back" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="notifications-page__title">Misi Harian</h1>
        </div>
      </div>

      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
        color: 'white', 
        padding: '2rem',
        borderRadius: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
      }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '1rem' }}>
          <Target size={40} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Dapatkan Poin Gratis</h2>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Selesaikan misi share harian dan kumpulkan poin Kenzy Store setiap hari!</p>
        </div>
      </div>

      <DailyMission />
      
      <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <h4 style={{ marginBottom: '1rem' }}>Syarat & Ketentuan</h4>
        <ul style={{ color: 'var(--text-muted)', fontSize: '0.875rem', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
          <li>Misi dapat dikerjakan satu kali setiap hari (Reset pukul 00:00 WIB).</li>
          <li>Poin akan otomatis masuk ke saldo Loyalty kamu.</li>
          <li>Gunakan fitur share ke platform media sosial apa saja.</li>
          <li>Kenzy Store berhak mengubah skema poin sewaktu-waktu.</li>
        </ul>
      </div>
    </div>
  );
};

export default MissionsPage;
