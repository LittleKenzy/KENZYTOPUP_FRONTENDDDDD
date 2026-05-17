import React from 'react';
import Modal from '../Modal';

export default function PromoModal({ isOpen, onClose, onConfirm, channel, loading }) {
  const getChannelName = () => {
    switch (channel) {
      case 'whatsapp': return 'WhatsApp';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      case 'copy': return 'Copy Link';
      default: return 'Sosial Media';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Misi">
      <div style={{ padding: '1rem 0' }}>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.5', color: 'var(--text-muted)' }}>
          Apakah kamu sudah membagikan teks promo ke <strong>{getChannelName()}</strong>? 
          Pastikan kamu benar-benar membagikannya untuk mendukung toko kami ya!
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            className="btn btn-outline" 
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Sudah Share'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
