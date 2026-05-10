import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

/**
 * Helper: Ekstrak pesan error dari response Axios
 * Axios melempar error untuk status 4xx/5xx, pesan backend ada di err.response.data
 */
function extractErrorMessage(err) {
  // Cek apakah ada response dari backend
  if (err.response?.data) {
    const data = err.response.data;

    // Jika ada field errors (Zod validation), gabungkan jadi string
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((e) => e.message).join('. ');
    }

    // Pesan umum dari backend
    if (data.message) {
      return data.message;
    }
  }

  // Fallback ke pesan Axios default
  return err.message || 'Terjadi kesalahan. Coba lagi.';
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kenzy_access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Session expired or invalid token');
          clearTokens();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const clearTokens = () => {
    localStorage.removeItem('kenzy_access_token');
    localStorage.removeItem('kenzy_refresh_token');
    localStorage.removeItem('kenzy_user');
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { accessToken, refreshToken, user: userData } = res.data.data;
        localStorage.setItem('kenzy_access_token', accessToken);
        localStorage.setItem('kenzy_refresh_token', refreshToken);
        localStorage.setItem('kenzy_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      throw new Error(res.data.message || 'Login gagal');
    } catch (err) {
      // Re-throw dengan pesan yang benar dari backend
      throw new Error(extractErrorMessage(err));
    }
  };

  const register = async (name, phone, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, phone, email, password });
      if (res.data.success) {
        // Auto login setelah register berhasil
        return await login(email, password);
      }
      throw new Error(res.data.message || 'Registrasi gagal');
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('kenzy_refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
