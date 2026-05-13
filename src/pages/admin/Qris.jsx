import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminTabs from '../../components/AdminTabs';
import Toast from '../../components/Toast';
import { QrCode, Upload, Check, X, AlertCircle } from 'lucide-react';

export default function AdminQris() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/qris');
      if (res.data.success) {
        setSettings(res.data.data);
        setLabel(res.data.data?.label || '');
      }
    } catch (err) {
      console.error('Gagal memuat pengaturan QRIS', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      const newStatus = !settings.isActive;
      const res = await api.patch('/admin/qris/toggle', { isActive: newStatus });
      if (res.data.success) {
        setSettings(prev => ({ ...prev, isActive: newStatus }));
        setToast({ message: `QRIS berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`, type: 'success' });
      }
    } catch (err) {
      setToast({ message: 'Gagal mengubah status QRIS', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !settings?.imageUrl) {
      setToast({ message: 'Harap pilih file gambar QRIS!', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (file) formData.append('qrisImage', file);
      formData.append('label', label);

      const res = await api.post('/admin/qris', formData);
      if (res.data.success) {
        setSettings(res.data.data);
        setFile(null);
        setToast({ message: 'Pengaturan QRIS berhasil diperbarui!', type: 'success' });
      }
    } catch (err) {
      setToast({ 
        message: err.response?.data?.message || 'Gagal memperbarui QRIS. Pastikan koneksi internet stabil.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container container animate-fade-in">
      <div className="flex-col-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <QrCode size={32} color="var(--accent)" />
        <h1 className="text-section-title" style={{ margin: 0 }}>Pengaturan QRIS</h1>
      </div>

      <AdminTabs />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="flex-col-mobile">
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Update QRIS</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Toko / Label QRIS</label>
              <input 
                type="text" 
                className="form-input" 
                value={label} 
                onChange={(e) => setLabel(e.target.value)} 
                placeholder="Misal: KENZY TOPUP STORE"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pilih Gambar QRIS</label>
              <div 
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: '0.5rem', 
                  padding: '2rem', 
                  textAlign: 'center',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => document.getElementById('qrisInput').click()}
              >
                <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  {file ? file.name : 'Klik untuk upload gambar QRIS'}
                </p>
                <input 
                  id="qrisInput"
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Pratinjau QRIS</h2>
            {settings && (
              <button 
                onClick={handleToggle}
                className={`btn ${settings.isActive ? 'btn-danger' : 'btn-success'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {settings.isActive ? <><X size={16} /> Matikan QRIS</> : <><Check size={16} /> Aktifkan QRIS</>}
              </button>
            )}
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
          ) : settings?.imageUrl ? (
            <div style={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div 
                  onClick={() => window.open(settings.imageUrl, '_blank')}
                  style={{ 
                    position: 'relative', 
                    display: 'inline-block', 
                    margin: '0 auto',
                    padding: '1rem',
                    backgroundColor: '#fff',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    cursor: 'zoom-in'
                  }}
                  title="Klik untuk lihat ukuran penuh"
                >
                  <img 
                    src={settings.imageUrl} 
                    alt="QRIS Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '320px', 
                      borderRadius: '0.5rem',
                      imageRendering: 'crisp-edges'
                    }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '1.5rem', 
                    right: '1.5rem', 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    color: '#fff', 
                    padding: '0.2rem 0.4rem', 
                    borderRadius: '0.25rem',
                    fontSize: '0.7rem'
                  }}>
                    🔍 Zoom
                  </div>
                {!settings.isActive && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.6)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderRadius: '1rem'
                  }}>
                    <div style={{ color: '#fff', fontWeight: 700, backgroundColor: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                      NON-AKTIF
                    </div>
                  </div>
                )}
              </div>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{settings.label}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Ini adalah gambar yang akan muncul di halaman checkout user.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Belum ada gambar QRIS yang diupload.</p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
