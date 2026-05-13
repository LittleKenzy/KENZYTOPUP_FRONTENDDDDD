import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { formatRupiah, formatDate } from '../utils/formatters';
import Modal from '../components/Modal';

const STATUS_TABS = [
  { value: '', label: 'Semua' },
  { value: 'SUCCESS', label: 'Berhasil' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Gagal' },
];

export default function Riwayat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  const [selectedTx, setSelectedTx] = useState(null);
  const [txDetail, setTxDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [txError, setTxError] = useState(null);

  useEffect(() => {
    fetchTransactions(currentStatus, currentPage);
  }, [currentStatus, currentPage]);

  const fetchTransactions = async (status, page) => {
    setLoading(true);
    try {
      let url = `/transactions?page=${page}&limit=10`;
      if (status) url += `&status=${status}`;
      
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
    setTxError(null);
    try {
      const res = await api.get(`/transactions/${id}`);
      if (res.data.success) {
        setTxDetail(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load transaction detail:', err);
      setTxError(err.response?.data?.message || 'Gagal mengambil detail transaksi');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleStatusChange = (status) => {
    setSearchParams({ status, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setSearchParams({ status: currentStatus, page: newPage });
  };

  const handleRowClick = (tx) => {
    setSelectedTx(tx);
    fetchTxDetail(tx.id);
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
      <h1 className="text-section-title" style={{ marginBottom: '2rem' }}>Riwayat Transaksi</h1>

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
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Produk</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>ID Tujuan</th>
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
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {formatDate(tx.createdAt)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{tx.product?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>x{tx.amount}</div>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{tx.targetId}</td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{formatRupiah(tx.totalPrice)}</td>
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

      {/* Detail Modal */}
      <Modal isOpen={!!selectedTx} onClose={() => { setSelectedTx(null); setTxDetail(null); setTxError(null); }} title="Detail Transaksi">
        {loadingDetail ? (
          <div style={{ padding: '2rem 0', textAlign: 'center' }}>Loading detail...</div>
        ) : txError ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--danger)' }}>
            {txError}
          </div>
        ) : txDetail ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              {getStatusBadge(txDetail.status)}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
              <span style={{ fontFamily: 'monospace' }}>{txDetail.id}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Waktu</span>
              <span>{formatDate(txDetail.createdAt)}</span>
            </div>

            {txDetail.paymentMethod && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Metode Pembayaran</span>
                <span style={{ fontWeight: 600 }}>{txDetail.paymentMethod}</span>
              </div>
            )}
            
            {txDetail.paymentProof && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Bukti Pembayaran</span>
                <img 
                  src={txDetail.paymentProof} 
                  alt="Bukti Transfer" 
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '0.5rem', border: '1px solid var(--border)' }} 
                />
              </div>
            )}

            <div style={{ backgroundColor: 'var(--secondary-bg)', padding: '1rem', borderRadius: '0.5rem', margin: '1.5rem 0' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{txDetail.product?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ID Tujuan: {txDetail.targetId}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span>{txDetail.amount}x {formatRupiah(txDetail.product?.price)}</span>
                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.25rem' }}>{formatRupiah(txDetail.totalPrice)}</span>
              </div>
            </div>

            {txDetail.note && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.25rem' }}>
                Catatan: {txDetail.note}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
