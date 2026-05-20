import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatRupiah, formatDate } from '../../utils/formatters';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import AdminTabs from '../../components/AdminTabs';
import { Settings, CheckCircle, XCircle, Clock, Activity, Search } from 'lucide-react';

const STATUS_TABS = [
  { value: '', label: 'Semua' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SUCCESS', label: 'Berhasil' },
  { value: 'FAILED', label: 'Gagal' },
];

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchInput, setSearchInput] = useState(currentSearch);
  
  const [stats, setStats] = useState({ total: 0, pending: 0, success: 0, failed: 0 });
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [selectedTx, setSelectedTx] = useState(null);
  const [txDetail, setTxDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updateNote, setUpdateNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchTransactions(currentStatus, currentPage, currentSearch);

    // Auto-refresh stats and transactions list every 15 seconds to keep the dashboard live
    const interval = setInterval(() => {
      // Hanya refresh jika tidak sedang loading detail transaksi/modal tidak terbuka untuk kenyamanan
      if (!selectedTx) {
        fetchStats();
        fetchTransactions(currentStatus, currentPage, currentSearch);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentStatus, currentPage, currentSearch, selectedTx]);


  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/transactions/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchTransactions = async (status, page, search = '') => {
    setLoading(true);
    try {
      let url = `/admin/transactions?page=${page}&limit=10`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await api.get(url);
      if (res.data.success) {
        setTransactions(res.data.data.transactions);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTxDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/admin/transactions/${id}`);
      if (res.data.success) {
        setTxDetail(res.data.data);
        setUpdateNote(res.data.data.note || '');
      }
    } catch (err) {
      console.error('Failed to load transaction detail');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = (status) => {
    setSearchParams({ status, page: 1, search: currentSearch });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setSearchParams({ status: currentStatus, page: newPage, search: currentSearch });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ status: currentStatus, page: 1, search: searchInput });
  };

  const handleRowClick = (tx) => {
    setSelectedTx(tx);
    fetchTxDetail(tx.id);
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      const res = await api.patch(`/admin/transactions/${txDetail.id}/status`, {
        status: newStatus,
        note: updateNote
      });
      
      if (res.data.success) {
        setToast({ message: `Status berhasil diubah ke ${newStatus}`, type: 'success' });
        setSelectedTx(null);
        setTxDetail(null);
        fetchStats();
        fetchTransactions(currentStatus, currentPage, currentSearch);
      }
    } catch (err) {
      setToast({ message: err.message || 'Gagal mengubah status', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS': return <span className="badge badge-success">BERHASIL</span>;
      case 'FAILED': return <span className="badge badge-danger">GAGAL</span>;
      case 'PENDING': return <span className="badge badge-warning">PENDING</span>;
      default: return <span className="badge">{status}</span>;
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
            <Activity size={24} color="var(--text-main)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Transaksi</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}>
            <Clock size={24} color="var(--warning)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--warning)' }}>Pending</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.pending}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%' }}>
            <CheckCircle size={24} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Berhasil</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.success}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%' }}>
            <XCircle size={24} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--danger)' }}>Gagal</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.failed}</div>
          </div>
        </div>
      </div>

      <div className="flex-col-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <h2 className="text-section-title" style={{ margin: 0 }}>Kelola Transaksi</h2>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', maxWidth: '350px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </div>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Cari ID, Email, No HP, atau Ref..." 
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

      {/* Status Tabs */}
      <div className="scrollable-tabs">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => handleStatusChange(tab.value)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '999px',
              fontWeight: 600,
              backgroundColor: currentStatus === tab.value ? 'var(--accent)' : 'var(--surface-card)',
              color: currentStatus === tab.value ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${currentStatus === tab.value ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--secondary-bg)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>User / Waktu</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Produk & Tujuan</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Metode</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Total</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
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
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => handleRowClick(tx)}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderBottom: '1px solid var(--border)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{tx.user?.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(tx.createdAt)}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{tx.product?.name} x{tx.amount}</div>
                      <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--accent)' }}>{tx.targetId}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {tx.paymentMethod}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>
                      {formatRupiah(tx.totalPrice)}
                    </td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(tx.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada transaksi ditemukan.
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

      {/* Admin Action Modal */}
      <Modal isOpen={!!selectedTx} onClose={() => { setSelectedTx(null); setTxDetail(null); }} title="Kelola Transaksi">
        {loadingDetail ? (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>Loading detail...</div>
        ) : txDetail ? (
          <div>
            <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{txDetail.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pembeli</span>
                <span style={{ fontWeight: 600 }}>{txDetail.user?.name} ({txDetail.user?.phone})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Metode Bayar</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{txDetail.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status Saat Ini</span>
                {getStatusBadge(txDetail.status)}
              </div>
            </div>

            <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{txDetail.product?.name}</div>
              <div style={{ marginBottom: '0.5rem' }}>ID Tujuan: <strong style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{txDetail.targetId}</strong></div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Total: {formatRupiah(txDetail.totalPrice)}</div>
            </div>

            {txDetail.paymentProof && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Bukti Pembayaran (QRIS):</label>
                <div 
                  style={{ 
                    marginTop: '0.5rem', 
                    borderRadius: '0.5rem', 
                    overflow: 'hidden', 
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(txDetail.paymentProof, '_blank')}
                >
                  <img 
                    src={txDetail.paymentProof} 
                    alt="Bukti Transfer" 
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} 
                  />
                  <div style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }}>
                    Klik untuk memperbesar
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Catatan Admin (opsional)</label>
              <textarea 
                className="form-input" 
                rows="3" 
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="Misal: Topup sudah berhasil dikirim / Pembayaran tidak ditemukan"
              ></textarea>
            </div>

            <div className="flex-col-mobile" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={() => handleUpdateStatus('SUCCESS')}
                disabled={isUpdating || txDetail.status === 'SUCCESS'}
                className="btn" 
                style={{ flex: 1, backgroundColor: 'var(--success)', color: 'white' }}
              >
                <CheckCircle size={18} /> Konfirmasi Berhasil
              </button>
              <button 
                onClick={() => handleUpdateStatus('FAILED')}
                disabled={isUpdating || txDetail.status === 'FAILED'}
                className="btn" 
                style={{ flex: 1, backgroundColor: 'var(--danger)', color: 'white' }}
              >
                <XCircle size={18} /> Tolak / Gagal
              </button>
            </div>
            
            {txDetail.status !== 'PENDING' && (
              <button 
                onClick={() => handleUpdateStatus('PENDING')}
                disabled={isUpdating}
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Kembalikan ke PENDING
              </button>
            )}
          </div>
        ) : null}
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
