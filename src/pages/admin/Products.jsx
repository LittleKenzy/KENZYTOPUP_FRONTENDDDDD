import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../utils/formatters';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import AdminTabs from '../../components/AdminTabs';
import { Settings, Plus, Search, Edit2, Trash2, RotateCcw, Package, Grid, CheckCircle, XCircle } from 'lucide-react';

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchInput, setSearchInput] = useState(currentSearch);
  
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalCategories: 0 });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    category: '',
    name: '',
    description: '',
    denomination: '',
    price: '',
    operatorCode: '',
  });
  const [customCategory, setCustomCategory] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchProducts(currentCategory, currentPage, currentSearch);
  }, [currentCategory, currentPage, currentSearch]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/products/stats');
      if (res.data.success) {
        setStats(res.data.data);
        setCategories(res.data.data.categories);
      }
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchProducts = async (category, page, search = '') => {
    setLoading(true);
    try {
      let url = `/admin/products?page=${page}&limit=10`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSearchParams({ category, page: 1, search: currentSearch });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setSearchParams({ category: currentCategory, page: newPage, search: currentSearch });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ category: currentCategory, page: 1, search: searchInput });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: '', category: '', name: '', description: '', denomination: '', price: '', operatorCode: ''
    });
    setCustomCategory('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setIsEditing(true);
    setFormData({
      id: product.id,
      category: product.category,
      name: product.name,
      description: product.description || '',
      denomination: product.denomination,
      price: product.price,
      operatorCode: product.operatorCode,
    });
    setCustomCategory('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = { ...formData, price: parseInt(formData.price, 10) };
      
      // Jika category diset ke 'CUSTOM', gunakan value dari customCategory
      if (payload.category === 'CUSTOM') {
        if (!customCategory.trim()) throw new Error('Kategori baru harus diisi');
        payload.category = customCategory.trim().toUpperCase();
      }
      
      delete payload.id; // Jangan kirim ID di body

      if (isEditing) {
        await api.put(`/admin/products/${formData.id}`, payload);
        setToast({ message: 'Produk berhasil diperbarui', type: 'success' });
      } else {
        await api.post('/admin/products', payload);
        setToast({ message: 'Produk berhasil ditambahkan', type: 'success' });
      }
      
      setIsModalOpen(false);
      fetchStats();
      fetchProducts(currentCategory, currentPage, currentSearch);
    } catch (err) {
      setToast({ message: err.message || 'Terjadi kesalahan', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      if (product.isActive) {
        await api.delete(`/admin/products/${product.id}`);
        setToast({ message: 'Produk dinonaktifkan', type: 'success' });
      } else {
        await api.patch(`/admin/products/${product.id}/reactivate`);
        setToast({ message: 'Produk diaktifkan kembali', type: 'success' });
      }
      fetchStats();
      fetchProducts(currentCategory, currentPage, currentSearch);
    } catch (err) {
      setToast({ message: err.message || 'Gagal mengubah status', type: 'error' });
    }
  };

  return (
    <div className="page-container container animate-fade-in">
      <div className="flex-col-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Settings size={32} color="var(--accent)" />
        <h1 className="text-section-title" style={{ margin: 0 }}>Admin Panel</h1>
      </div>

      <AdminTabs />

      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
            <Package size={24} color="var(--text-main)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Produk</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%' }}>
            <CheckCircle size={24} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Aktif</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.active}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
            <XCircle size={24} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>Non-Aktif</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.inactive}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
            <Grid size={24} color="#3b82f6" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#3b82f6' }}>Kategori</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalCategories}</div>
          </div>
        </div>
      </div>

      <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 className="text-section-title" style={{ margin: 0 }}>Kelola Produk</h2>
          <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <Plus size={16} /> Tambah
          </button>
        </div>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', maxWidth: '350px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Cari nama, operator..." 
              style={{ paddingLeft: '2.5rem', paddingRight: '5rem', borderRadius: '999px' }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ position: 'absolute', right: '0.25rem', top: '0.25rem', bottom: '0.25rem', padding: '0 1rem', borderRadius: '999px', fontSize: '0.875rem' }}
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Category Tabs */}
      <div className="scrollable-tabs">
        <button
          onClick={() => handleCategoryChange('')}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '999px',
            fontWeight: 600,
            backgroundColor: currentCategory === '' ? 'var(--accent)' : 'var(--surface-card)',
            color: currentCategory === '' ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${currentCategory === '' ? 'var(--accent)' : 'var(--border)'}`,
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          Semua Kategori
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              fontWeight: 600,
              backgroundColor: currentCategory === cat ? 'var(--accent)' : 'var(--surface-card)',
              color: currentCategory === cat ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${currentCategory === cat ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--secondary-bg)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Produk & Detail</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Kategori / Op</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Harga</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5" style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <div className="skeleton" style={{ height: '24px', width: '100%' }}></div>
                    </td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Denom: {prod.denomination}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                          {prod.category}
                        </span>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                          {prod.operatorCode}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {formatRupiah(prod.price)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {prod.isActive ? (
                        <span className="badge badge-success">Aktif</span>
                      ) : (
                        <span className="badge badge-danger">Non-Aktif</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => openEditModal(prod)}
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem' }} 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => toggleProductStatus(prod)}
                          className="btn" 
                          style={{ 
                            padding: '0.5rem', 
                            backgroundColor: prod.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            color: prod.isActive ? 'var(--danger)' : 'var(--success)'
                          }}
                          title={prod.isActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {prod.isActive ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Sebelumnya
          </button>
          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
            Halaman {currentPage} dari {pagination.totalPages}
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages || loading}
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Produk" : "Tambah Produk Baru"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select 
              name="category" 
              className="form-input" 
              value={formData.category} 
              onChange={handleInputChange} 
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="CUSTOM">+ Buat Kategori Baru</option>
            </select>
          </div>

          {formData.category === 'CUSTOM' && (
            <div className="form-group">
              <label className="form-label">Nama Kategori Baru</label>
              <input 
                type="text" 
                className="form-input" 
                value={customCategory} 
                onChange={(e) => setCustomCategory(e.target.value)} 
                placeholder="Misal: STREAMING"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Kode Operator (Brand)</label>
            <input 
              type="text" 
              name="operatorCode" 
              className="form-input" 
              value={formData.operatorCode} 
              onChange={handleInputChange} 
              placeholder="Misal: MLBB, TELKOMSEL, NETFLIX"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nama Produk Lengkap</label>
            <input 
              type="text" 
              name="name" 
              className="form-input" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="Misal: 86 Diamonds MLBB"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Label Denominasi</label>
              <input 
                type="text" 
                name="denomination" 
                className="form-input" 
                value={formData.denomination} 
                onChange={handleInputChange} 
                placeholder="Misal: 86 Diamonds / 1 Bulan"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Harga (Rp)</label>
              <input 
                type="number" 
                name="price" 
                className="form-input" 
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="Misal: 25000"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi (Opsional)</label>
            <textarea 
              name="description" 
              className="form-input" 
              rows="2" 
              value={formData.description} 
              onChange={handleInputChange}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </div>
        </form>
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
