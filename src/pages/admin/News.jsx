import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import AdminTabs from '../../components/AdminTabs';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function AdminNews() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/news');
      if (res.data.success) {
        setNewsList(res.data.data);
      }
    } catch (err) {
      setToast({ message: 'Gagal memuat daftar berita', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (news = null) => {
    if (news) {
      setEditingNews(news);
      setTitle(news.title);
      setContent(news.content);
      setIsPinned(news.isPinned);
      setIsPublished(news.isPublished);
      setImagePreview(news.imageUrl || '');
    } else {
      setEditingNews(null);
      setTitle('');
      setContent('');
      setIsPinned(false);
      setIsPublished(true);
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('isPinned', isPinned);
    formData.append('isPublished', isPublished);
    if (imageFile) {
      formData.append('newsImage', imageFile);
    }

    try {
      if (editingNews) {
        await api.put(`/admin/news/${editingNews.id}`, formData);
        setToast({ message: 'Berita berhasil diperbarui', type: 'success' });
      } else {
        await api.post('/admin/news', formData);
        setToast({ message: 'Berita berhasil ditambahkan', type: 'success' });
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Gagal menyimpan berita', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus berita ini?')) return;
    try {
      await api.delete(`/admin/news/${id}`);
      setToast({ message: 'Berita berhasil dihapus', type: 'success' });
      fetchNews();
    } catch (err) {
      setToast({ message: 'Gagal menghapus berita', type: 'error' });
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/news/${id}/publish`, { isPublished: !currentStatus });
      fetchNews();
    } catch (err) {
      setToast({ message: 'Gagal mengubah status publish', type: 'error' });
    }
  };

  const togglePin = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/news/${id}/pin`, { isPinned: !currentStatus });
      fetchNews();
    } catch (err) {
      setToast({ message: 'Gagal mengubah status pin', type: 'error' });
    }
  };

  return (
    <div className="page-container container animate-fade-in">
      <h1 className="text-section-title" style={{ marginBottom: '1rem' }}>Panel Admin</h1>
      <AdminTabs />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Kelola Berita & Pengumuman</h2>
        <button className="btn btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Buat Berita
        </button>
      </div>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Gambar</th>
                <th style={{ padding: '1rem' }}>Judul</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Pin</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {newsList.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Belum ada berita.
                  </td>
                </tr>
              ) : (
                newsList.map(news => (
                  <tr key={news.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>
                      {news.imageUrl ? (
                        <img src={news.imageUrl} alt={news.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '60px', height: '40px', backgroundColor: 'var(--surface-card)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={20} color="var(--text-muted)" />
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{news.title}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {news.content}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => togglePublish(news.id, news.isPublished)}
                        style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: news.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: news.isPublished ? '#10b981' : '#ef4444',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {news.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => togglePin(news.id, news.isPinned)}
                        style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '1rem', 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: news.isPinned ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                          color: news.isPinned ? '#f59e0b' : '#6b7280',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {news.isPinned ? 'Pinned' : 'Unpinned'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          className="btn" 
                          style={{ padding: '0.5rem', backgroundColor: 'var(--surface-card)', color: 'var(--accent)' }}
                          onClick={() => openModal(news)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn" 
                          style={{ padding: '0.5rem', backgroundColor: 'var(--surface-card)', color: 'var(--danger)' }}
                          onClick={() => handleDelete(news.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSubmitting && setIsModalOpen(false)} title={editingNews ? "Edit Berita" : "Buat Berita"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Judul Berita</label>
            <input 
              type="text" 
              className="form-input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Konten / Isi Pengumuman</label>
            <textarea 
              className="form-input" 
              rows="4" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required 
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Gambar Banner (Opsional)</label>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageChange} 
              className="form-input" 
              style={{ padding: '0.5rem' }}
              disabled={isSubmitting}
            />
            {imagePreview && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '0.5rem' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isPublished} 
                onChange={(e) => setIsPublished(e.target.checked)} 
                disabled={isSubmitting}
              />
              Publish Langsung
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isPinned} 
                onChange={(e) => setIsPinned(e.target.checked)} 
                disabled={isSubmitting}
              />
              Pin di Atas
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
