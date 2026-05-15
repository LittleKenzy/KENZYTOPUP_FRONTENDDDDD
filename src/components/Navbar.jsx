import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, LogOut, User, History, Home, CreditCard, Shield, Gift, Copy } from 'lucide-react';
import api from '../api/axios';
import Modal from './Modal';
import Toast from './Toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [toast, setToast] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);

  useEffect(() => {
    if (user) {
      fetchPoints(); // Fetch points on mount to show on badge
    }
  }, [user]);

  useEffect(() => {
    if (isPointsModalOpen && user) {
      fetchPoints();
      fetchConfig();
      fetchMyVouchers();
    }
  }, [isPointsModalOpen, user]);

  const fetchPoints = async () => {
    try {
      const res = await api.get('/loyalty/my-points');
      if (res.data?.success) setPoints(res.data.data.currentPoints);
    } catch (err) {
      console.error('Failed to fetch points', err);
    }
  };

  const fetchMyVouchers = async () => {
    try {
      const res = await api.get('/loyalty/my-redemptions');
      if (res.data?.success) {
        // Filter yang belum dipakai dan belum expired
        const active = res.data.data.filter(v => !v.isUsed && new Date(v.expiresAt) > new Date());
        setMyVouchers(active);
      }
    } catch (err) {
      console.error('Failed to fetch vouchers', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await api.get('/loyalty/config');
      if (res.data?.success) setLoyaltyConfig(res.data.data);
    } catch (err) {
      console.error('Failed to fetch loyalty config', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemAmount) return;
    
    setIsRedeeming(true);
    try {
      const res = await api.post('/loyalty/redeem', { points: parseInt(redeemAmount, 10) });
      if (res.data?.success) {
        setToast({ message: res.data.message, type: 'success' });
        setPoints(res.data.data.remainingPoints);
        setRedeemAmount('');
        // fetch points again just to be sure
        fetchPoints();
        fetchMyVouchers();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal menukar poin', type: 'error' });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <nav style={{
      backgroundColor: 'var(--surface-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
          <Gamepad2 size={28} color="var(--accent)" />
          <span>Kenzy <span style={{ color: 'var(--accent)' }}>Store</span></span>
        </Link>

        {/* Links */}
        <div className="nav-links">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            <Home size={18} /> <span>Home</span>
          </Link>
          <Link to="/layanan" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            <CreditCard size={18} /> <span>Layanan</span>
          </Link>
          {user && (
            <Link to="/riwayat" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              <History size={18} /> <span>Riwayat</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--warning)' }}>
              <Shield size={18} /> <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Auth Actions */}
        <div className="auth-actions">
          {user ? (
            <div className="user-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => setIsPointsModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  <Gift size={16} /> {points} Poin
                </button>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User size={16} />
                </div>
                <div className="user-name-role" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} /> <span className="user-name-role">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Daftar</Link>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isPointsModalOpen} onClose={() => setIsPointsModalOpen(false)} title="Tukar Poin Loyalty">
        <div style={{ padding: '1rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '0.5rem' }}><Gift size={64} style={{ margin: '0 auto' }} /></div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Saldo Poin: {points}</h3>
            {loyaltyConfig && (
              <p style={{ color: 'var(--text-muted)' }}>
                Tukar poin dengan kode diskon!<br/>
                1 Poin = Rp{loyaltyConfig.pointValue}<br/>
                Minimal penukaran: {loyaltyConfig.minRedeemPoints} Poin
              </p>
            )}
          </div>
          
          <form onSubmit={handleRedeem}>
            <div className="form-group">
              <label className="form-label">Jumlah Poin yang Ingin Ditukar</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder={`Minimal ${loyaltyConfig?.minRedeemPoints || 100}`}
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                min={loyaltyConfig?.minRedeemPoints || 1}
                max={points}
                disabled={isRedeeming}
                required
              />
            </div>
            {redeemAmount && loyaltyConfig && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }}>
                Kamu akan mendapat diskon: Rp{(parseInt(redeemAmount) * loyaltyConfig.pointValue).toLocaleString()}
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isRedeeming || !redeemAmount || parseInt(redeemAmount) > points || parseInt(redeemAmount) < (loyaltyConfig?.minRedeemPoints || 1)}>
              {isRedeeming ? 'Memproses...' : 'Tukar Poin Sekarang'}
            </button>
          </form>

          {myVouchers.length > 0 && (
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Voucher Aktif Anda</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myVouchers.map(v => (
                  <div key={v.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px dashed var(--accent)',
                    borderRadius: '0.5rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                        Diskon Rp{v.discountAmount.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Kedaluwarsa: {new Date(v.expiresAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '0.5rem 1rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px' }}>
                        {v.discountCode}
                      </div>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.5rem' }} 
                        onClick={() => {
                          navigator.clipboard.writeText(v.discountCode);
                          setToast({ message: 'Kode voucher disalin!', type: 'success' });
                        }}
                        title="Salin Kode"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </nav>
  );
}
