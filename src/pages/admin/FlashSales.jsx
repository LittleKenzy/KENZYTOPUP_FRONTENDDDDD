import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminTabs from '../../components/AdminTabs';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { Plus, Trash2, Edit, Power } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

const CATEGORIES = ['GAME', 'EWALLET', 'PLN', 'PULSA', 'PAKET_DATA'];

export default function FlashSales() {
  const [flashSales, setFlashSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercent: 10,
    productId: '',
    category: '',
    brand: '',
    startAt: '',
    endAt: ''
  });

  useEffect(() => {
    fetchFlashSales();
    fetchProducts();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const res = await api.get('/admin/flash-sales');
      if (res.data?.success) {
        setFlashSales(res.data.data);
      }
    } catch (err) {
      setToast({ message: 'Gagal memuat daftar Flash Sale', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products?limit=1000');
      if (res.data?.success) {
        // Hanya simpan produk yang aktif (isActive = true)
        const activeProducts = res.data.data.products.filter(p => p.isActive !== false);
        setProducts(activeProducts);
      }
    } catch (err) {
      console.error('Gagal memuat daftar produk');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      discountPercent: 10,
      productId: '',
      category: '',
      brand: '',
      startAt: new Date().toISOString().slice(0, 16),
      endAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    });
    setIsModalOpen(true);
  };

  const openEditModal = (fs) => {
    setEditingId(fs.id);
    setFormData({
      title: fs.title,
      description: fs.description || '',
      discountPercent: fs.discountPercent,
      productId: fs.productId || '',
      category: fs.category || '',
      brand: fs.product?.operatorCode || '',
      startAt: new Date(fs.startAt).toISOString().slice(0, 16),
      endAt: new Date(fs.endAt).toISOString().slice(0, 16)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        discountPercent: parseInt(formData.discountPercent, 10),
        productId: formData.productId || null,
        category: formData.category || null,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString()
      };

      let res;
      if (editingId) {
        res = await api.put(`/admin/flash-sales/${editingId}`, payload);
      } else {
        res = await api.post('/admin/flash-sales', payload);
      }

      if (res.data?.success) {
        setToast({ message: res.data.message, type: 'success' });
        setIsModalOpen(false);
        fetchFlashSales();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Terjadi kesalahan', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id, isActive) => {
    if (!window.confirm(`Yakin ingin ${isActive ? 'nonaktifkan' : 'aktifkan'} flash sale ini?`)) return;
    try {
      const res = await api.patch(`/admin/flash-sales/${id}/toggle`, { isActive: !isActive });
      if (res.data?.success) {
        setToast({ message: res.data.message, type: 'success' });
        fetchFlashSales();
      }
    } catch (err) {
      setToast({ message: 'Gagal mengubah status', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus flash sale ini?')) return;
    try {
      const res = await api.delete(`/admin/flash-sales/${id}`);
      if (res.data?.success) {
        setToast({ message: res.data.message, type: 'success' });
        fetchFlashSales();
      }
    } catch (err) {
      setToast({ message: 'Gagal menghapus flash sale', type: 'error' });
    }
  };

  return (
    <div className="page-container container animate-fade-in">
      <h1 className="text-section-title" style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>
      <AdminTabs />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Kelola Flash Sale</h2>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Tambah Flash Sale
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>
        ) : flashSales.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada flash sale.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--secondary-bg)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Judul</th>
                <th style={{ padding: '1rem' }}>Diskon</th>
                <th style={{ padding: '1rem' }}>Target</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Waktu</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {flashSales.map((fs) => (
                <tr key={fs.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{fs.title}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{fs.discountPercent}%</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {fs.product ? `Produk: ${fs.product.name}` : fs.category ? `Kategori: ${fs.category}` : 'Semua Produk'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: fs.status === 'LIVE' ? 'rgba(34, 197, 94, 0.1)' : fs.status === 'SCHEDULED' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: fs.status === 'LIVE' ? '#22c55e' : fs.status === 'SCHEDULED' ? '#3b82f6' : '#ef4444'
                    }}>
                      {fs.status} {!fs.isActive && '(Nonaktif)'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    Mulai: {new Date(fs.startAt).toLocaleString('id-ID')}<br/>
                    Akhir: {new Date(fs.endAt).toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleToggle(fs.id, fs.isActive)} 
                        className="btn btn-outline" 
                        style={{ padding: '0.5rem', color: fs.isActive ? 'var(--warning)' : '#22c55e' }}
                        title={fs.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <Power size={16} />
                      </button>
                      <button onClick={() => openEditModal(fs)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(fs.id)} className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Flash Sale' : 'Tambah Flash Sale'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Judul Promo</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi Singkat (opsional)</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Pilih target diskon (kosongkan keduanya untuk diskon semua produk)</p>
            <div className="form-group">
              <label className="form-label">Kategori Spesifik (opsional)</label>
              <select 
                className="form-input" 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value, brand: '', productId: '' })}
              >
                <option value="">-- Semua Kategori --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {formData.category && (
              <div className="form-group">
                <label className="form-label">Brand Spesifik (opsional)</label>
                <select 
                  className="form-input" 
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value, productId: '' })}
                >
                  <option value="">-- Semua Brand di {formData.category} --</option>
                  {[...new Set(products.filter(p => p.category === formData.category).map(p => p.operatorCode))].sort().map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}
            {formData.brand && (
              <div className="form-group">
                <label className="form-label">Produk Spesifik (opsional)</label>
                <select 
                  className="form-input" 
                  value={formData.productId}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}
                >
                  <option value="">-- Semua Produk {formData.brand} --</option>
                  {products
                    .filter(p => p.category === formData.category && p.operatorCode === formData.brand)
                    .map(p => <option key={p.id} value={p.id}>{p.name} - {formatRupiah(p.price)}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="form-group" style={{ backgroundColor: 'var(--surface-card)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <label className="form-label" style={{ color: 'var(--accent)' }}>Diskon (%)</label>
            <input 
              type="number" 
              className="form-input" 
              min="1" max="100"
              value={formData.discountPercent}
              onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
              required
            />
            {formData.productId && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '0.5rem', border: '1px dashed rgba(239, 68, 68, 0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Estimasi Harga:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {formatRupiah(products.find(p => p.id === formData.productId)?.price || 0)}
                  </span>
                  <span>→</span>
                  <span style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '1.25rem' }}>
                    {formatRupiah((products.find(p => p.id === formData.productId)?.price || 0) * (1 - formData.discountPercent / 100))}
                  </span>
                </div>
              </div>
            )}
            {!formData.productId && formData.discountPercent > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Semua produk dalam target ini akan didiskon {formData.discountPercent}%.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
              <label className="form-label">Waktu Mulai</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.startAt}
                onChange={e => setFormData({ ...formData, startAt: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
              <label className="form-label">Waktu Berakhir</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.endAt}
                onChange={e => setFormData({ ...formData, endAt: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Flash Sale'}
          </button>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
