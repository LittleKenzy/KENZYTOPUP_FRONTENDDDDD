import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kenzy_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Jika data adalah FormData, hapus Content-Type agar axios set multipart/form-data otomatis
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 dan bukan saat login/register/refresh
    const isAuthRoute = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register') || originalRequest.url.includes('/auth/refresh');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('kenzy_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Coba refresh token
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data.data.accessToken;
        
        // Update storage
        localStorage.setItem('kenzy_access_token', newAccessToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // Jika refresh gagal, logout
        localStorage.removeItem('kenzy_access_token');
        localStorage.removeItem('kenzy_refresh_token');
        localStorage.removeItem('kenzy_user');
        
        // Hanya redirect jika kita di browser environment
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
