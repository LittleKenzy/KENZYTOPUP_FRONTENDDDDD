import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Gift, Zap, Info, Bell, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import notificationService from '../api/notification.service';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(page, 20);
      if (res.success) {
        setNotifications(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal mengambil daftar notifikasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchNotifications(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }

    if (notif.data?.url) {
      navigate(notif.data.url);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_status': return <Package size={24} color="#2563eb" />;
      case 'points': return <Gift size={24} color="#f59e0b" />;
      case 'flash_sale': return <Zap size={24} color="#ef4444" />;
      default: return <Info size={24} color="#64748b" />;
    }
  };

  const formatFullTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} className="btn-back" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="notifications-page__title">Pusat Notifikasi</h1>
        </div>
        {notifications.length > 0 && (
          <button onClick={handleMarkAllRead} className="btn-text" style={{ fontSize: '0.875rem', color: 'var(--accent)', cursor: 'pointer', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={40} className="spinner" />
          <p style={{ marginTop: '16px' }}>Memuat notifikasi...</p>
        </div>
      ) : error ? (
        <div className="notifications-page__error">
          <p>{error}</p>
          <button onClick={() => fetchNotifications(pagination.page)}>Coba Lagi</button>
        </div>
      ) : notifications.length > 0 ? (
        <>
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notification-row ${!notif.isRead ? 'notification-row--unread' : ''}`}
                onClick={() => handleItemClick(notif)}
              >
                <div className="notification-row__icon-box">
                  {getIcon(notif.type)}
                </div>
                <div className="notification-row__content">
                  <div className="notification-row__header">
                    <span className="notification-row__title">{notif.title}</span>
                    <span className="notification-row__time">{formatFullTime(notif.createdAt)}</span>
                  </div>
                  <div className="notification-row__body">{notif.body}</div>
                </div>
                {!notif.isRead && <div className="notification-item__dot"></div>}
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Sebelumnya
              </button>
              <span className="pagination-info">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>
              <button 
                className="pagination-btn"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="notifications-page__empty">
          <Bell size={64} strokeWidth={1} color="#cbd5e1" />
          <h3>Belum ada notifikasi</h3>
          <p>Notifikasi tentang order dan promo akan muncul di sini.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
