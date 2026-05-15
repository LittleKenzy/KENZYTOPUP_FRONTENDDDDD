import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminTabs from '../../components/AdminTabs';
import Toast from '../../components/Toast';
import { Gift, Users, Award, Ticket } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export default function Loyalty() {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    pointsPerThousand: 1,
    pointValue: 100,
    minRedeemPoints: 100,
    redeemExpiryDays: 30,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, statsRes, leaderboardRes] = await Promise.all([
        api.get('/admin/loyalty/config'),
        api.get('/admin/loyalty/stats'),
        api.get('/admin/loyalty/leaderboard')
      ]);

      if (configRes.data?.success) {
        setConfig(configRes.data.data);
        setFormData({
          pointsPerThousand: configRes.data.data.pointsPerThousand,
          pointValue: configRes.data.data.pointValue,
          minRedeemPoints: configRes.data.data.minRedeemPoints,
          redeemExpiryDays: configRes.data.data.redeemExpiryDays,
          isActive: configRes.data.data.isActive
        });
      }
      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (leaderboardRes.data?.success) setLeaderboard(leaderboardRes.data.data);
    } catch (err) {
      setToast({ message: 'Gagal memuat data loyalty', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put('/admin/loyalty/config', {
        pointsPerThousand: parseInt(formData.pointsPerThousand, 10),
        pointValue: parseInt(formData.pointValue, 10),
        minRedeemPoints: parseInt(formData.minRedeemPoints, 10),
        redeemExpiryDays: parseInt(formData.redeemExpiryDays, 10),
        isActive: formData.isActive
      });
      if (res.data?.success) {
        setToast({ message: 'Pengaturan berhasil disimpan', type: 'success' });
        fetchData();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal menyimpan pengaturan', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-container container" style={{ padding: '4rem', textAlign: 'center' }}>Memuat data...</div>;
  }

  return (
    <div className="page-container container animate-fade-in">
      <h1 className="text-section-title" style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>
      <AdminTabs />

      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Statistik Poin Loyalty</h2>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '50%' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>User Berpartisipasi</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalUsersWithPoints}</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '50%' }}>
              <Gift size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Poin Dibagikan</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalPointsIssued.toLocaleString()}</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '50%' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Penukaran</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalRedemptions}</div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '50%' }}>
              <Ticket size={24} />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Diskon Aktif (Belum dipakai)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.activeRedemptions}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Form Pengaturan */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            Pengaturan Sistem
          </h3>
          <form onSubmit={handleUpdateConfig}>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                style={{ width: '1.25rem', height: '1.25rem' }}
              />
              <label htmlFor="isActive" style={{ fontWeight: 'bold' }}>Sistem Poin Aktif</label>
            </div>
            
            <div className="form-group">
              <label className="form-label">Reward Poin (per Rp1.000 belanja)</label>
              <input 
                type="number" 
                className="form-input" 
                min="0"
                value={formData.pointsPerThousand}
                onChange={e => setFormData({ ...formData, pointsPerThousand: e.target.value })}
                required
              />
              <small style={{ color: 'var(--text-muted)' }}>Contoh: Belanja Rp50.000 dapat {50 * formData.pointsPerThousand} poin.</small>
            </div>
            <div className="form-group">
              <label className="form-label">Nilai 1 Poin (dalam Rupiah)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1"
                value={formData.pointValue}
                onChange={e => setFormData({ ...formData, pointValue: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Minimal Poin untuk Tukar</label>
              <input 
                type="number" 
                className="form-input" 
                min="1"
                value={formData.minRedeemPoints}
                onChange={e => setFormData({ ...formData, minRedeemPoints: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Masa Berlaku Diskon (Hari)</label>
              <input 
                type="number" 
                className="form-input" 
                min="1"
                value={formData.redeemExpiryDays}
                onChange={e => setFormData({ ...formData, redeemExpiryDays: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        </div>

        {/* Leaderboard */}
        <div className="card" style={{ padding: 0, overflowX: 'auto', alignSelf: 'start' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Top 50 User (Leaderboard)</h3>
          </div>
          {leaderboard.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--secondary-bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Peringkat</th>
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Total Poin (Sepanjang Masa)</th>
                  <th style={{ padding: '1rem' }}>Poin Tersedia (Belum dipakai)</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((lb, idx) => (
                  <tr key={lb.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: idx < 3 ? '#ef4444' : 'inherit' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{lb.user?.name || 'User Dihapus'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{lb.user?.email}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#ef4444' }}>
                      {lb.totalPoints.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {lb.currentPoints.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
