import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, getCategoryLabel, getCategoryIcon } from '../utils/formatters';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const CATEGORIES = ['GAME', 'EWALLET', 'PLN', 'PULSA', 'PAKET_DATA'];

export default function Layanan() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'GAME';
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetId, setTargetId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProducts(currentCategory);
  }, [currentCategory]);

  const fetchProducts = async (cat) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/products?category=${cat}&limit=50`);
      if (res.data.success) {
        setProducts(res.data.data.products);
      }
    } catch (err) {
      setError('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat });
    setSelectedBrand(null);
  };

  const handleBuyClick = (product) => {
    if (!user) {
      return navigate('/login', { state: { from: location } });
    }
    setSelectedProduct(product);
    setTargetId('');
    setQuantity(1);
    setPaymentMethod('QRIS');
  };

  const getTargetLabel = () => {
    switch (currentCategory) {
      case 'GAME': return 'ID Game (Server)';
      case 'EWALLET': return 'Nomor HP E-Wallet';
      case 'PLN': return 'Nomor Meter / ID Pelanggan';
      case 'PULSA':
      case 'PAKET_DATA': return 'Nomor HP';
      default: return 'ID Tujuan';
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!targetId) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.post('/transactions', {
        productId: selectedProduct.id,
        targetId,
        quantity: parseInt(quantity, 10),
        paymentMethod
      });
      
      if (res.data.success) {
        setSelectedProduct(null);
        setToast({ message: 'Transaksi berhasil diproses!', type: 'success' });
        setTimeout(() => {
          navigate('/riwayat');
        }, 1500);
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal memproses transaksi', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container container animate-fade-in">
      <h1 className="text-section-title" style={{ marginBottom: '2rem' }}>Pilih Layanan</h1>
      
      {/* Category Tabs */}
      <div className="scrollable-tabs">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: currentCategory === cat ? 'var(--surface-card)' : 'transparent',
              color: currentCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${currentCategory === cat ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.2s ease'
            }}
          >
            {getCategoryIcon(cat)} {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem' }}>
              <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '0.5rem' }}></div>
              <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '1.5rem' }}></div>
              <div className="skeleton" style={{ height: '36px', width: '100%' }}></div>
            </div>
          ))
        ) : !selectedBrand && products.length > 0 ? (
          // RENDER BRAND LIST
          [...new Set(products.map(p => p.operatorCode))].map(brand => (
            <div 
              key={brand} 
              className="card" 
              onClick={() => setSelectedBrand(brand)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '2.5rem 1.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: 'rgba(233, 69, 96, 0.05)',
                border: '1px solid rgba(233, 69, 96, 0.2)'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', color: 'var(--accent)', margin: 0 }}>{brand}</h3>
              <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pilih untuk melihat layanan</p>
            </div>
          ))
        ) : selectedBrand && products.length > 0 ? (
          // RENDER PRODUCTS FOR SELECTED BRAND
          <>
            <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
               <button 
                 onClick={() => setSelectedBrand(null)}
                 className="btn btn-outline"
                 style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
               >
                 ← Kembali ke Pilihan {getCategoryLabel(currentCategory)}
               </button>
               <h2 className="text-section-title" style={{ marginTop: '1.5rem' }}>Layanan {selectedBrand}</h2>
            </div>
            {products.filter(p => p.operatorCode === selectedBrand).map(product => (
              <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {product.operatorCode}
                  </div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    {formatRupiah(product.price)}
                  </div>
                </div>
                <button 
                  onClick={() => handleBuyClick(product)}
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                >
                  Beli
                </button>
              </div>
            ))}
          </>
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Belum ada produk untuk kategori ini.
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <Modal 
        isOpen={!!selectedProduct} 
        onClose={() => !isSubmitting && setSelectedProduct(null)}
        title="Konfirmasi Pembelian"
      >
        {selectedProduct && (
          <form onSubmit={handleSubmitOrder}>
            <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.25rem' }}>{selectedProduct.name}</h4>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatRupiah(selectedProduct.price)}</div>
            </div>

            <div className="form-group">
              <label className="form-label">{getTargetLabel()}</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Masukkan ID / Nomor tujuan"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jumlah</label>
              <input 
                type="number" 
                min="1"
                max="100"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Metode Pembayaran</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['CASH', 'QRIS', 'DANA', 'SHOPEEPAY'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${paymentMethod === method ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: paymentMethod === method ? 'rgba(233, 69, 96, 0.1)' : 'var(--secondary-bg)',
                      color: paymentMethod === method ? 'var(--accent)' : 'var(--text-main)',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Pembayaran</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {formatRupiah(selectedProduct.price * quantity)}
                </div>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting || !targetId}
              >
                {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            </div>
          </form>
        )}
      </Modal>

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
