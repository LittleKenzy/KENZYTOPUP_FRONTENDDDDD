import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Package, Gift, Zap, Info, Check } from 'lucide-react';
import notificationService from '../api/notification.service';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Polling for unread count every 30 seconds
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        if (res.success) {
          setUnreadCount(res.data.unreadCount);
          setNotifications(res.data.recent);
        }
      } catch (err) {
        console.error('Error fetching unread status:', err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Optional: Fetch latest on open
  };

  const handleItemClick = async (notif) => {
    setIsOpen(false);
    
    // Mark as read if unread
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }

    // Navigate to related URL
    if (notif.data?.url) {
      navigate(notif.data.url);
    }
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_status': return <Package size={16} color="#2563eb" />;
      case 'points': return <Gift size={16} color="#f59e0b" />;
      case 'flash_sale': return <Zap size={16} color="#ef4444" />;
      default: return <Info size={16} color="#64748b" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin}m lalu`;
    if (diffHrs < 24) return `${diffHrs}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString('id-ID');
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <div className="notification-bell" onClick={handleToggle}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown__header">
            <h4>Notifikasi</h4>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="btn-text" 
                style={{ fontSize: '0.75rem', color: '#2563eb', cursor: 'pointer', border: 'none', background: 'none' }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="notification-dropdown__list">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.isRead ? 'notification-item--unread' : ''}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <div className="notification-item__icon">
                    {getIcon(notif.type)}
                  </div>
                  <div className="notification-item__content">
                    <div className="notification-item__title">{notif.title}</div>
                    <div className="notification-item__body">{notif.body}</div>
                    <div className="notification-item__time">{formatTime(notif.createdAt)}</div>
                  </div>
                  {!notif.isRead && <div className="notification-item__dot"></div>}
                </div>
              ))
            ) : (
              <div className="notification-dropdown__empty">
                Belum ada notifikasi
              </div>
            )}
          </div>

          <div className="notification-dropdown__footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
