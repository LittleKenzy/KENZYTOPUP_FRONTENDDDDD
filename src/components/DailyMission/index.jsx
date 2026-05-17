import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDailyMission } from '../../hooks/useDailyMission';
import MissionCard from './MissionCard';
import PromoModal from './PromoModal';
import Toast from '../Toast';
import { RefreshCw } from 'lucide-react';

export default function DailyMission() {
  const { user } = useAuth();
  const { status, loading, error, claimLoading, claimMission, refetch } = useDailyMission();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // If user is not logged in, we don't show the daily mission
  if (!user) return null;

  const handleShareClick = (channel) => {
    setSelectedChannel(channel);
    if (channel === 'copy') {
      showToast('Teks promo berhasil disalin!', 'success');
    }
    // Show modal to confirm
    setModalOpen(true);
  };

  const handleConfirmShare = async () => {
    if (!selectedChannel) return;
    
    const result = await claimMission(selectedChannel);
    
    if (result.success) {
      setModalOpen(false);
      showToast(result.message, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  if (loading && !status?.resetAt) {
    return (
      <div className="card animate-pulse" style={{ padding: '1.5rem', marginBottom: '2rem', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" />
          <span>Memuat misi harian...</span>
        </div>
      </div>
    );
  }

  if (error && !status?.resetAt) {
    return (
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
        <div style={{ textAlign: 'center', color: 'var(--danger)' }}>
          <p style={{ margin: '0 0 1rem', fontWeight: 500 }}>{error}</p>
          <button className="btn btn-outline" onClick={refetch} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <MissionCard 
        status={status} 
        onShareClick={handleShareClick} 
      />
      
      <PromoModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmShare}
        channel={selectedChannel}
        loading={claimLoading}
      />

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </>
  );
}
