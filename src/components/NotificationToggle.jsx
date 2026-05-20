import React from 'react';
import { usePushNotification } from '../hooks/usePushNotification';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import './NotificationToggle.css';

const NotificationToggle = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotification();

  if (!isSupported) {
    return (
      <div className="notification-toggle__unsupported">
        Push notification tidak didukung oleh browser Anda.
      </div>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="notification-toggle">
      <div className="notification-toggle__header">
        <div>
          <h4 className="notification-toggle__title">Notifikasi Produk & Promo</h4>
          <p className="notification-toggle__description">
            Dapatkan update status order dan info flash sale terbaru.
          </p>
        </div>
        <div className={`notification-toggle__status ${isSubscribed ? 'notification-toggle__status--active' : 'notification-toggle__status--inactive'}`}>
          {isSubscribed ? (
            <>
              <Bell size={14} />
              <span>Aktif</span>
            </>
          ) : (
            <>
              <BellOff size={14} />
              <span>Mati</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`notification-toggle__button ${isSubscribed ? 'btn-deactivate' : 'btn-activate'}`}
      >
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 className="spinner" size={16} />
            Memproses...
          </div>
        ) : (
          isSubscribed ? 'Nonaktifkan Notifikasi' : 'Aktifkan Notifikasi'
        )}
      </button>

      {error && (
        <div className="notification-toggle__error">
          {error}
        </div>
      )}
    </div>
  );
};

export default NotificationToggle;
