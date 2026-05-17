import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminTabs from '../../components/AdminTabs';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { MessageSquare, Users, History, Send, Search, Check, Info, Image as ImageIcon, X } from 'lucide-react';

export default function WaBlast() {
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'
  const [toast, setToast] = useState(null);
  
  // States for Send Blast
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [targetType, setTargetType] = useState('all'); // 'all' or 'selected'
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSending, setIsSending] = useState(false);

  // States for History
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  
  const [selectedBlast, setSelectedBlast] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [blastDetail, setBlastDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (activeTab === 'send' && targetType === 'selected') {
      fetchUsers();
    } else if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, targetType, search, historyPage]);

  // --- Send Blast Methods ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/blast/users?search=${search}&waVerified=true`);
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Gagal memuat daftar user', type: 'error' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleUserSelect = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.id));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Ukuran gambar maksimal 5MB', type: 'error' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSendBlast = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setToast({ message: 'Pesan WA tidak boleh kosong', type: 'error' });
      return;
    }

    if (targetType === 'selected' && selectedUserIds.length === 0) {
      setToast({ message: 'Pilih minimal satu user tujuan', type: 'error' });
      return;
    }

    if (!window.confirm('Yakin ingin mengirim WA blast ini? Proses tidak dapat dibatalkan.')) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('message', message.trim());
      formData.append('userIds', targetType === 'all' ? 'all' : JSON.stringify(selectedUserIds));
      if (imageFile) {
        formData.append('blastImage', imageFile);
      }

      const res = await api.post('/admin/blast/send', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data?.success) {
        setToast({ message: res.data.message, type: 'success' });
        setMessage('');
        removeImage();
        setSelectedUserIds([]);
        if (targetType === 'selected') fetchUsers();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Gagal mengirim WA blast', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  // --- History Methods ---
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/admin/blast/history?page=${historyPage}&limit=10`);
      if (res.data?.success) {
        setHistory(res.data.data.blasts);
        setHistoryTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Gagal memuat riwayat blast', type: 'error' });
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchBlastDetail = async (id) => {
    setLoadingDetail(true);
    setBlastDetail(null);
    setIsDetailModalOpen(true);
    try {
      const res = await api.get(`/admin/blast/history/${id}`);
      if (res.data?.success) {
        setBlastDetail(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Gagal memuat detail blast', type: 'error' });
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="page-container container animate-fade-in">
      <h1 className="text-section-title" style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>
      <AdminTabs />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>WA Blast Management</h2>
      </div>

      {/* Internal Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'send' ? 'btn-primary' : ''}`}
          style={activeTab !== 'send' ? { backgroundColor: 'transparent', color: 'var(--text)' } : {}}
          onClick={() => setActiveTab('send')}
        >
          <Send size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Kirim Blast
        </button>
        <button 
          className={`btn ${activeTab === 'history' ? 'btn-primary' : ''}`}
          style={activeTab !== 'history' ? { backgroundColor: 'transparent', color: 'var(--text)' } : {}}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Riwayat Blast
        </button>
      </div>

      {activeTab === 'send' && (
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSendBlast}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Target Penerima</label>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="targetType" 
                    value="all" 
                    checked={targetType === 'all'} 
                    onChange={() => setTargetType('all')} 
                  />
                  <span>Semua User Terverifikasi</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="targetType" 
                    value="selected" 
                    checked={targetType === 'selected'} 
                    onChange={() => setTargetType('selected')} 
                  />
                  <span>Pilih User</span>
                </label>
              </div>
            </div>

            {targetType === 'selected' && (
              <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Cari nama / nomor WA..." 
                      className="form-input"
                      style={{ paddingLeft: '2rem' }}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '1rem' }}>
                      {selectedUserIds.length} terpilih
                    </span>
                    <button 
                      type="button" 
                      onClick={handleSelectAllUsers} 
                      className="btn" 
                      style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                    >
                      {selectedUserIds.length === users.length && users.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.25rem' }}>
                  {loadingUsers ? (
                    <div style={{ padding: '1rem', textAlign: 'center' }}>Memuat user...</div>
                  ) : users.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Tidak ada user ditemukan.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleToggleUserSelect(u.id)}>
                            <td style={{ padding: '0.5rem 1rem', width: '40px' }}>
                              <input 
                                type="checkbox" 
                                checked={selectedUserIds.includes(u.id)}
                                onChange={() => {}} // handled by tr click
                              />
                            </td>
                            <td style={{ padding: '0.5rem 1rem', fontWeight: 'bold' }}>{u.name}</td>
                            <td style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>{u.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Gambar (Opsional)</label>
              
              {!imagePreview ? (
                <label style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '2rem', 
                  border: '2px dashed var(--border)', 
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: 'var(--surface)'
                }}>
                  <ImageIcon size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Klik untuk upload gambar (Max 5MB)</span>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </label>
              ) : (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                  <button 
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Pesan WhatsApp</label>
              <textarea 
                className="form-input" 
                rows="8" 
                placeholder="Tulis pesan promosi atau informasi di sini..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Hindari penggunaan karakter khusus berlebihan agar tidak ditandai sebagai spam oleh WhatsApp.
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={isSending}>
              {isSending ? 'Mengirim...' : <><Send size={18} /> Kirim Pesan Sekarang</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          {loadingHistory ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat riwayat...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada riwayat blast.</div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--secondary-bg)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem' }}>Tanggal</th>
                    <th style={{ padding: '1rem' }}>Pesan</th>
                    <th style={{ padding: '1rem' }}>Target</th>
                    <th style={{ padding: '1rem' }}>Status Pengiriman</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                        {new Date(h.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '1rem', maxWidth: '300px' }}>
                        <div style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          fontSize: '0.875rem'
                        }}>
                          {h.message}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          backgroundColor: h.targetType === 'all' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                          color: h.targetType === 'all' ? '#3b82f6' : '#a855f7',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {h.targetType === 'all' ? 'Semua User' : 'User Terpilih'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={14}/> {h.stats.sent}</span>
                          {h.stats.failed > 0 && <span style={{ color: '#ef4444' }}>Gagal: {h.stats.failed}</span>}
                          {h.stats.pending > 0 && <span style={{ color: 'var(--warning)' }}>Pending: {h.stats.pending}</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Total target: {h.stats.total}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => fetchBlastDetail(h.id)} 
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem' }}
                          title="Lihat Detail"
                        >
                          <Info size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {historyTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', gap: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <button 
                    disabled={historyPage === 1} 
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Prev
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                    Hal {historyPage} dari {historyTotalPages}
                  </span>
                  <button 
                    disabled={historyPage === historyTotalPages} 
                    onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Detail Pengiriman Blast">
        {loadingDetail ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat detail...</div>
        ) : blastDetail ? (
          <div>
            {blastDetail.imageUrl && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Gambar Terlampir:</h3>
                <img src={blastDetail.imageUrl} alt="Blast Image" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
              </div>
            )}

            <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Isi Pesan:</h3>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {blastDetail.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ color: '#22c55e', fontSize: '1.5rem', fontWeight: 'bold' }}>{blastDetail.stats.sent}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Terkirim</div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold' }}>{blastDetail.stats.failed}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gagal</div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--surface-card)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 'bold' }}>{blastDetail.stats.total}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Target</div>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '1.5rem 0 1rem' }}>Log Pengiriman</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '0.5rem 1rem' }}>Penerima</th>
                    <th style={{ padding: '0.5rem 1rem' }}>No WA</th>
                    <th style={{ padding: '0.5rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.5rem 1rem' }}>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {blastDetail.blastLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem 1rem' }}>{log.user.name}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>{log.phone}</td>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <span style={{ 
                          color: log.status === 'sent' ? '#22c55e' : log.status === 'failed' ? '#ef4444' : 'var(--warning)',
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>
                        {log.errorMsg || (log.sentAt ? new Date(log.sentAt).toLocaleTimeString('id-ID') : '-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Detail tidak ditemukan.</div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
