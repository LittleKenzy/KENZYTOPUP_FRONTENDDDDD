import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Gift, CheckCircle, User, Clock } from 'lucide-react';
import api from '../../api/axios';
import AdminTabs from '../../components/AdminTabs';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';

export default function AdminMissions() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/missions/logs');
      if (res.data?.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch mission logs', err);
      showToast('Gagal memuat data misi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMissions = async () => {
    try {
      setIsResetting(true);
      const res = await api.delete('/admin/missions/reset');
      
      if (res.data?.success) {
        setIsModalOpen(false);
        showToast(res.data.message, 'success');
        fetchLogs(); // refresh the list (should be empty now)
      }
    } catch (err) {
      console.error('Failed to reset missions', err);
      showToast('Gagal mereset misi', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1 className="text-section-title" style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
      <AdminTabs />

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gift color="var(--primary)" /> Misi Harian ({today})
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Daftar pengguna yang telah menyelesaikan misi share hari ini.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={fetchLogs} 
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              <Trash2 size={18} /> Reset Misi Hari Ini
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface-active)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Selesai Hari Ini</span>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={24} /> {logs.length} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>User</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <p>Memuat data...</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', backgroundColor: 'var(--primary-bg)', borderRadius: '0.5rem' }}>
            <p style={{ margin: 0 }}>Belum ada user yang menyelesaikan misi hari ini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>No</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pengguna</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Waktu Selesai</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Channel</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Poin Didapat</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{index + 1}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} color="var(--primary)" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{log.user?.name || 'Unknown'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.user?.phone || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        <Clock size={16} />
                        {new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.875rem', 
                        backgroundColor: 'var(--surface-active)',
                        fontWeight: 500
                      }}>
                        {log.channel}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--accent)', fontWeight: 600 }}>
                      +{log.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Konfirmasi Reset Misi">
        <div style={{ padding: '1rem 0' }}>
          <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Apakah Anda yakin ingin mereset misi hari ini? 
            <br/><br/>
            <strong>Peringatan:</strong> Ini akan menghapus semua log misi hari ini, sehingga user yang sudah klaim poin dapat melakukan klaim poin lagi (mendapatkan poin ganda). Lakukan ini hanya jika terjadi error sistem atau untuk keperluan testing.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isResetting}>
              Batal
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleResetMissions}
              disabled={isResetting}
              style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              {isResetting ? 'Mereset...' : 'Ya, Reset Misi'}
            </button>
          </div>
        </div>
      </Modal>

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
}
