import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const useDailyMission = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState({
    completed: false,
    pointsEarned: 0,
    resetAt: null,
    totalPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimLoading, setClaimLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/missions/daily/status');
      if (res.data?.success) {
        setStatus(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch mission status', err);
      setError('Gagal memuat status misi, coba lagi ya!');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const claimMission = async (channel) => {
    try {
      setClaimLoading(true);
      setError(null);
      const res = await api.post('/missions/daily/claim', { channel });
      
      if (res.data?.success) {
        // Update local state to reflect completed mission
        setStatus(prev => ({
          ...prev,
          completed: true,
          pointsEarned: res.data.data.points,
          totalPoints: res.data.data.currentPoints
        }));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Gagal klaim misi.' };
    } catch (err) {
      console.error('Failed to claim mission', err);
      const errorMsg = err.response?.data?.message || 'Gagal melakukan klaim misi, coba lagi ya!';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setClaimLoading(false);
    }
  };

  return {
    status,
    loading,
    error,
    claimLoading,
    claimMission,
    refetch: fetchStatus
  };
};
