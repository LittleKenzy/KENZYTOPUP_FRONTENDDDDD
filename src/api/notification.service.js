import api from './axios';

const notificationService = {
  /**
   * Ambil semua notifikasi (paginated)
   */
  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Ambil jumlah notifikasi belum dibaca + 5 item terbaru
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  /**
   * Tandai satu notifikasi sudah dibaca
   */
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Tandai semua notifikasi sudah dibaca
   */
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
