/* eslint-disable no-restricted-globals */
// ============================================
// Service Worker — Kenzy Store
// Handling Push Notifications
// ============================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    console.log('Push received:', data);

    const title = data.title || 'Kenzy Store';
    const options = {
      body: data.body || 'Ada notifikasi baru untukmu!',
      icon: data.icon || '/icon-192.png',
      badge: '/badge-72.png',
      data: {
        url: data.data?.url || '/',
      },
      vibrate: [100, 50, 100],
      actions: [
        {
          action: 'open_url',
          title: 'Lihat Detail',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error parsing push data:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open and focus it of not
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window found, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
