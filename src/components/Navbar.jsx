import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, LogOut, User, History, Home, CreditCard, Shield, Gift, Copy, Bell } from 'lucide-react';
import api from '../api/axios';
import Modal from './Modal';
import Toast from './Toast';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { formatRupiah, formatDate } from '../utils/formatters';
import NotificationBell from './NotificationBell';


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Real-time Order Notifications for Admin
  const { newOrders, unreadCount, markAllRead, clearNotifications } = useOrderNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Baru saja';
    const diffMs = new Date() - new Date(dateString);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m yang lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}j yang lalu`;
    return formatDate(dateString);
  };

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
                <NotificationBell />
                
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

                {/* ─── REAL-TIME ORDER NOTIFICATION BELL (ADMIN ONLY) ─── */}
                {user?.role === 'admin' && (
                  <div ref={notifRef} style={{ position: 'relative' }}>
                    <style>{`
                      @keyframes pulseGlow {
                        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(233, 69, 96, 0.4); }
                        70% { transform: scale(1.08); box-shadow: 0 0 0 6px rgba(233, 69, 96, 0); }
                        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(233, 69, 96, 0); }
                      }
                      @media (max-width: 768px) {
                        .notif-dropdown {
                          position: fixed !important;
                          top: 72px !important;
                          right: 16px !important;
                          width: 328px !important;
                          max-height: 70vh !important;
                          box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
                          z-index: 9999 !important;
                        }
                      }
                      @media (max-width: 360px) {
                        .notif-dropdown {
                          right: 8px !important;
                          left: 8px !important;
                          width: calc(100vw - 16px) !important;
                        }
                      }
                    `}</style>
                    <button
                      onClick={() => {
                        setIsNotifOpen(!isNotifOpen);
                        if (!isNotifOpen) {
                          markAllRead();
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: unreadCount > 0 ? 'rgba(233, 69, 96, 0.15)' : 'var(--secondary-bg)',
                        color: unreadCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
                        border: unreadCount > 0 ? '1px solid rgba(233, 69, 96, 0.4)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        position: 'relative'
                      }}
                      title="Notifikasi Order Baru"
                    >
                      <Bell size={16} style={{ animation: unreadCount > 0 ? 'pulseGlow 2s infinite' : 'none' }} />
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          backgroundColor: 'var(--accent)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          fontSize: '0.675rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          boxShadow: '0 0 8px var(--accent)'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Beautiful glassmorphism dropdown popover */}
                    {isNotifOpen && (
                      <div className="card animate-fade-in notif-dropdown" style={{
                        position: 'absolute',
                        right: '-80px',
                        top: '42px',
                        width: '320px',
                        maxHeight: '400px',
                        padding: '1rem',
                        zIndex: 100,
                        backgroundColor: 'var(--surface-card)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)' }}>
                            <Bell size={14} color="var(--accent)" /> Order Masuk Terbaru
                          </h4>
                          {newOrders.length > 0 && (
                            <button
                              onClick={() => {
                                clearNotifications();
                                setIsNotifOpen(false);
                              }}
                              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                              onMouseOver={(e) => e.target.style.color = 'var(--accent)'}
                              onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                            >
                              Hapus
                            </button>
                          )}
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', paddingRight: '4px' }}>
                          {newOrders.length > 0 ? (
                            newOrders.map((order) => (
                              <div
                                key={order.id}
                                onClick={() => {
                                  setIsNotifOpen(false);
                                  navigate(`/admin?search=${order.id}`);
                                }}
                                style={{
                                  padding: '0.75rem',
                                  borderRadius: '0.5rem',
                                  backgroundColor: 'rgba(255,255,255,0.02)',
                                  border: '1px solid var(--border)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  textAlign: 'left'
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                  e.currentTarget.style.borderColor = 'rgba(233, 69, 96, 0.3)';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                                  e.currentTarget.style.borderColor = 'var(--border)';
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>#{order.id.slice(-6).toUpperCase()}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getRelativeTime(order.createdAt)}</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {order.product?.name || 'Top Up Game'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>👤 {order.user?.name || 'Guest'}</span>
                                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formatRupiah(order.totalPrice)}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: '2.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              Belum ada order baru hari ini.
                            </div>
                          )}
                        </div>

                        {newOrders.length > 0 && (
                          <button
                            onClick={() => {
                              setIsNotifOpen(false);
                              navigate('/admin');
                            }}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem', fontSize: '0.8rem', width: '100%', borderRadius: '0.5rem', cursor: 'pointer' }}
                          >
                            Kelola Transaksi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
                Tukar poin dengan kode diskon!<br />
                1 Poin = Rp{loyaltyConfig.pointValue}<br />
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
