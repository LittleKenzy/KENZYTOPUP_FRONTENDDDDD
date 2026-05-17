import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, getCategoryLabel, getCategoryIcon } from '../utils/formatters';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Tag, Gift } from 'lucide-react';

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
  const [flashSales, setFlashSales] = useState([]);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [targetId, setTargetId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [qrisSettings, setQrisSettings] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [isQrisZoomed, setIsQrisZoomed] = useState(false);
  const [searchBrandQuery, setSearchBrandQuery] = useState('');
  const [searchItemQuery, setSearchItemQuery] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  useEffect(() => {
    fetchProducts(currentCategory);
    fetchFlashSales();
  }, [currentCategory]);

  // Auto-open product modal if productId is in URL (e.g. from Flash Sale Banner)
  useEffect(() => {
    const targetProductId = searchParams.get('productId');
    if (targetProductId && products.length > 0) {
      const targetProduct = products.find(p => p.id === targetProductId);
      if (targetProduct && !selectedProduct) {
        setSelectedBrand(targetProduct.operatorCode); // Auto select brand
        handleBuyClick(targetProduct);
        
        // Remove productId from URL so it doesn't reopen on refresh
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('productId');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [products, searchParams, selectedProduct]);

  useEffect(() => {
    api.get('/qris')
      .then(res => {
        if (res.data?.success) setQrisSettings(res.data.data);
      })
      .catch(err => console.error('Gagal memuat QRIS', err));
  }, []);

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

  const fetchFlashSales = async () => {
    try {
      const res = await api.get('/flash-sales');
      if (res.data?.success) {
        setFlashSales(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch flash sales', err);
    }
  };

  const handleCategoryChange = (cat) => {
    setSearchParams({ category: cat });
    setSelectedBrand(null);
    setSearchBrandQuery('');
    setSearchItemQuery('');
  };

  const handleBuyClick = (product) => {
    if (!user) {
      return navigate('/login', { state: { from: location } });
    }
    setSelectedProduct(product);
    setTargetId('');
    setQuantity(1);
    setPaymentMethod('QRIS');
    setPaymentProofFile(null);
    setDiscountCode('');
    setAppliedDiscount(0);
  };

  const getDiscountedPrice = (product) => {
    const sale = flashSales.find(s => 
      s.productId === product.id || 
      (s.category === product.category && !s.productId) || 
      (!s.productId && !s.category)
    );
    if (!sale) return product.price;
    return Math.round(product.price * (1 - sale.discountPercent / 100));
  };

  const handleValidateCode = async () => {
    if (!discountCode) return;
    setIsValidatingCode(true);
    try {
      const res = await api.post('/loyalty/validate-code', { discountCode });
      if (res.data?.success) {
        const discAmt = res.data.data.discountAmount;
        const currentTotal = getDiscountedPrice(selectedProduct) * quantity;
        const minPurchase = discAmt * 2.5;

        if (currentTotal < minPurchase) {
          setAppliedDiscount(0);
          setToast({ message: `Minimal belanja Rp${minPurchase.toLocaleString('id-ID')} untuk voucher ini`, type: 'error' });
          return;
        }

        setAppliedDiscount(discAmt);
        setToast({ message: res.data.message, type: 'success' });
      }
    } catch (err) {
      setAppliedDiscount(0);
      setToast({ message: err.response?.data?.message || 'Kode diskon tidak valid', type: 'error' });
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Check discount validity if quantity changes
  useEffect(() => {
    if (appliedDiscount > 0 && selectedProduct) {
      const currentTotal = getDiscountedPrice(selectedProduct) * quantity;
      if (currentTotal < appliedDiscount * 2.5) {
        setAppliedDiscount(0);
        setDiscountCode('');
        setToast({ message: 'Voucher dilepas karena total belanja kurang dari batas minimal', type: 'error' });
      }
    }
  }, [quantity, selectedProduct]);

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
    
    if (paymentMethod === 'QRIS' && !paymentProofFile) {
      setToast({ message: 'Bukti transfer QRIS wajib diupload!', type: 'error' });
      return;
    }

    if (discountCode && appliedDiscount === 0) {
      setToast({ message: 'Kode voucher belum divalidasi atau tidak valid. Silakan klik "Gunakan" atau kosongkan kolom jika tidak jadi memakai voucher.', type: 'error' });
      return;
    } 
    
    setIsSubmitting(true);
    try {
      let res;
      if (paymentMethod === 'QRIS') {
        const formData = new FormData();
        formData.append('productId', selectedProduct.id);
        formData.append('targetId', targetId);
        formData.append('quantity', parseInt(quantity, 10));
        formData.append('paymentMethod', paymentMethod);
        formData.append('paymentProof', paymentProofFile);
        if (appliedDiscount > 0) formData.append('discountCode', discountCode);

        res = await api.post('/transactions', formData);
      } else {
        res = await api.post('/transactions', {
          productId: selectedProduct.id,
          targetId,
          quantity: parseInt(quantity, 10),
          paymentMethod,
          discountCode: appliedDiscount > 0 ? discountCode : undefined
        });
      }
      
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

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        {!selectedBrand ? (
          <div className="search-container">
            <input 
              type="text" 
              className="form-input" 
              placeholder={`Cari ${getCategoryLabel(currentCategory)}...`}
              value={searchBrandQuery}
              onChange={(e) => setSearchBrandQuery(e.target.value)}
              style={{ 
                borderRadius: '1rem', 
                padding: '1rem 1.5rem', 
                fontSize: '1rem',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            />
          </div>
        ) : (
          <div className="search-container">
            <input 
              type="text" 
              className="form-input" 
              placeholder={`Cari Item di ${selectedBrand}...`}
              value={searchItemQuery}
              onChange={(e) => setSearchItemQuery(e.target.value)}
              style={{ 
                borderRadius: '1rem', 
                padding: '1rem 1.5rem', 
                fontSize: '1rem',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            />
          </div>
        )}
      </div>

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
          [...new Set(products.map(p => p.operatorCode))]
            .filter(brand => brand.toLowerCase().includes(searchBrandQuery.toLowerCase()))
            .sort()
            .map(brand => (
              <div 
                key={brand} 
                className="card" 
                onClick={() => {
                  setSelectedBrand(brand);
                  setSearchItemQuery('');
                }}
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
                 onClick={() => {
                   setSelectedBrand(null);
                   setSearchItemQuery('');
                 }}
                 className="btn btn-outline"
                 style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
               >
                 ← Kembali ke Pilihan {getCategoryLabel(currentCategory)}
               </button>
               <h2 className="text-section-title" style={{ marginTop: '1.5rem' }}>Layanan {selectedBrand}</h2>
            </div>
            {products
              .filter(p => p.operatorCode === selectedBrand)
              .filter(p => p.name.toLowerCase().includes(searchItemQuery.toLowerCase()))
              .map(product => {
                const finalPrice = getDiscountedPrice(product);
                const hasDiscount = finalPrice < product.price;

                return (
                  <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    {hasDiscount && (
                      <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', color: 'white', padding: '0.25rem 0.75rem', borderBottomLeftRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        Flash Sale
                      </div>
                    )}
                    <div style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {product.operatorCode}
                      </div>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                      {hasDiscount ? (
                        <div>
                          <div style={{ fontSize: '0.875rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            {formatRupiah(product.price)}
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                            {formatRupiah(finalPrice)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                          {formatRupiah(product.price)}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => handleBuyClick(product)}
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                    >
                      Beli
                    </button>
                  </div>
                );
              })}
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
        onClose={() => {
          if (!isSubmitting) {
            setSelectedProduct(null);
            setPaymentProofFile(null);
          }
        }}
        title="Konfirmasi Pembelian"
      >
        {selectedProduct && (
          <form onSubmit={handleSubmitOrder}>
            <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.25rem' }}>{selectedProduct.name}</h4>
              {getDiscountedPrice(selectedProduct) < selectedProduct.price ? (
                <div>
                  <span style={{ fontSize: '0.875rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                    {formatRupiah(selectedProduct.price)}
                  </span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatRupiah(getDiscountedPrice(selectedProduct))}</span>
                </div>
              ) : (
                <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatRupiah(selectedProduct.price)}</div>
              )}
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

            {paymentMethod === 'QRIS' && (
              <div className="form-group" style={{ 
                marginTop: '1.5rem', 
                padding: '1.5rem', 
                backgroundColor: 'rgba(233, 69, 96, 0.05)', 
                borderRadius: '0.8rem',
                border: '1px solid rgba(233, 69, 96, 0.2)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <label className="form-label text-center" style={{ display: 'block', marginBottom: '1rem' }}>
                  Scan QRIS di bawah ini
                </label>
                {qrisSettings ? (
                  <>
                    <div 
                      onClick={() => setIsQrisZoomed(true)}
                      style={{ 
                        cursor: 'zoom-in', 
                        position: 'relative',
                        display: 'inline-block',
                        backgroundColor: '#fff',
                        padding: '1rem',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img 
                        src={qrisSettings.imageUrl} 
                        alt={qrisSettings.label} 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '280px', 
                          borderRadius: '0.5rem', 
                          margin: '0 auto',
                          imageRendering: 'crisp-edges'
                        }} 
                      />
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '1.5rem', 
                        right: '1.5rem', 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: '#fff', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}>
                        Klik untuk Perbesar
                      </div>
                    </div>
                    <div style={{ marginTop: '0.75rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {qrisSettings.label}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    QRIS belum tersedia.
                  </div>
                )}
                
                <label className="form-label" style={{ marginTop: '1rem' }}>Upload Bukti Transfer</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => setPaymentProofFile(e.target.files[0])}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                  required
                  disabled={isSubmitting}
                />
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                  Format: JPG, PNG, WEBP. Maks 5MB.
                </small>
              </div>
            )}

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Kode Diskon Poin</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Masukkan kode diskon"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setAppliedDiscount(0); // reset kalau diganti
                  }}
                  disabled={isSubmitting || isValidatingCode}
                />
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleValidateCode}
                  disabled={!discountCode || isSubmitting || isValidatingCode}
                >
                  {isValidatingCode ? 'Cek...' : 'Gunakan'}
                </button>
              </div>
              {appliedDiscount > 0 && (
                <small style={{ color: '#ef4444', display: 'block', marginTop: '0.5rem', fontWeight: 'bold' }}>
                  Berhasil! Diskon Rp{appliedDiscount.toLocaleString()} diterapkan.
                </small>
              )}
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
                {appliedDiscount > 0 && (
                  <div style={{ fontSize: '0.875rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {formatRupiah(getDiscountedPrice(selectedProduct) * quantity)}
                  </div>
                )}
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {formatRupiah(Math.max(0, getDiscountedPrice(selectedProduct) * quantity - appliedDiscount))}
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

      {/* QRIS Zoom Modal */}
      <Modal
        isOpen={isQrisZoomed}
        onClose={() => setIsQrisZoomed(false)}
        title="Scan QRIS"
      >
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '1.5rem', 
            borderRadius: '1.5rem', 
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <img 
              src={qrisSettings?.imageUrl} 
              alt="QRIS Full" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: '0.5rem',
                display: 'block'
              }} 
            />
          </div>
          <h3 style={{ marginTop: '1.5rem', color: 'var(--text-main)' }}>{qrisSettings?.label}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Silakan scan QRIS di atas untuk melakukan pembayaran.
          </p>
          <button 
            onClick={() => setIsQrisZoomed(false)}
            className="btn btn-primary" 
            style={{ marginTop: '2rem', width: '100%' }}
          >
            Tutup Pratinjau
          </button>
        </div>
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
