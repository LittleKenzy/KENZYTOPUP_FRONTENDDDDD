import React, { useState, useEffect } from 'react';
import { Gift, Copy, Clock, Ticket, Info, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { formatRupiah } from '../utils/formatters';
import Toast from '../components/Toast';
import './NotificationsPage.css'; // Reuse some layout styles

const LoyaltyPage = () => {
  const [points, setPoints] = useState(0);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pointsRes, configRes, vouchersRes] = await Promise.all([
        api.get('/loyalty/my-points'),
        api.get('/loyalty/config'),
        api.get('/loyalty/my-redemptions')
      ]);

      if (pointsRes.data?.success) setPoints(pointsRes.data.data.currentPoints);
      if (configRes.data?.success) setLoyaltyConfig(configRes.data.data);
      if (vouchersRes.data?.success) {
        const active = vouchersRes.data.data.filter(v => !v.isUsed && new Date(v.expiresAt) > new Date());
        setMyVouchers(active);
      }
    } catch (err) {
      console.error('Failed to fetch loyalty data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!redeemAmount) return;

    setIsRedeeming(true);
    try {
      const res = await api.post('/loyalty/redeem', { points: parseInt(redeemAmount, 10) });
      if (res.data?.success) {
        setToast({ message: res.data.message, type: 'success' });
        setRedeemAmount('');
        fetchData();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal menukar poin', type: 'error' });
    } finally {
      setIsRedeeming(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setToast({ message: 'Kode voucher disalin!', type: 'success' });
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Memuat data poyalty...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="notifications-page__header">
        <h1 className="notifications-page__title">Kenzy Loyalty Poin</h1>
      </div>

      {/* Stats Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', 
        color: 'white', 
        padding: '2.5rem',
        borderRadius: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)'
      }}>
        <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '0.5rem' }}>Saldo Poin Kamu</div>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{points}</div>
        {loyaltyConfig && (
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
            1 Poin = {formatRupiah(loyaltyConfig.pointValue)} • Minimal Redeem {loyaltyConfig.minRedeemPoints} Poin
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Redeem Section */}
        <section>
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={20} color="var(--accent)" /> Tukar Poin
            </h3>
            <form onSubmit={handleRedeem}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem' }}>Jumlah Poin</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={`Minimal ${loyaltyConfig?.minRedeemPoints || 100}`}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  min={loyaltyConfig?.minRedeemPoints || 1}
                  max={points}
                  required
                />
              </div>
              {redeemAmount && loyaltyConfig && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent)', fontWeight: 600, textAlign: 'center', fontSize: '0.875rem' }}>
                   Potongan Diskon: {formatRupiah(parseInt(redeemAmount) * loyaltyConfig.pointValue)}
                </div>
              )}
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
                disabled={isRedeeming || !redeemAmount || parseInt(redeemAmount) > points || parseInt(redeemAmount) < (loyaltyConfig?.minRedeemPoints || 1)}
              >
                {isRedeeming ? 'Memproses...' : 'Tukar Sekarang'}
              </button>
            </form>
          </div>
        </section>

        {/* Info Section */}
        <section>
          <div className="card" style={{ height: '100%', backgroundColor: 'var(--surface-card)' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Info size={20} color="var(--accent)" /> Cara Pakai
             </h3>
             <ul style={{ color: 'var(--text-muted)', fontSize: '0.875rem', paddingLeft: '1.25rem', lineHeight: '1.7' }}>
               <li>Dapatkan poin dari setiap transaksi yang berhasil.</li>
               <li>Tukar poin kamu dengan Voucher Diskon Belanja.</li>
               <li>Voucher dapat digunakan pada halaman Checkout.</li>
               <li>Kode Voucher memiliki masa berlaku {loyaltyConfig?.redeemExpiryDays || 30} hari.</li>
             </ul>
          </div>
        </section>
      </div>

      {/* Active Vouchers */}
      <section style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <CheckCircle2 size={20} color="var(--success)" /> Voucher Aktif
        </h3>
        {myVouchers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {myVouchers.map(v => (
              <div key={v.id} className="card" style={{ 
                border: '1px dashed var(--accent)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div>
                      <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.25rem' }}>Diskon {formatRupiah(v.discountAmount)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                         Valid sampai: {new Date(v.expiresAt).toLocaleDateString('id-ID')}
                      </div>
                   </div>
                   <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                      <Ticket size={24} color="var(--accent)" />
                   </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  backgroundColor: 'var(--secondary-bg)', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '0.5rem'
                }}>
                   <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1px' }}>{v.discountCode}</span>
                   <button 
                     onClick={() => copyToClipboard(v.discountCode)}
                     style={{ border: 'none', background: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                   >
                     <Copy size={18} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
             Belum ada voucher aktif. Tukar poin kamu sekarang!
          </div>
        )}
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LoyaltyPage;
