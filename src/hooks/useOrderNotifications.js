import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { STORE_CONFIG } from '../config/constants';

// Web Audio API Synthesizer: Plays a beautiful, premium dual-tone chime
const playPremiumChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Tone 1: E5 (sweet start chime)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Tone 2: A5 (bright chime ending) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.4);
    
    osc2.start(now + 0.08);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('Audio feedback blocked or not supported:', err.message);
  }
};

export const useOrderNotifications = () => {
  const { user } = useAuth();
  const [newOrders, setNewOrders] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Hanya poll jika user adalah admin
    if (!user || user.role !== 'admin') {
      return;
    }

    // Set check awal jika belum ada
    if (!localStorage.getItem('lastOrderCheck')) {
      localStorage.setItem('lastOrderCheck', new Date().toISOString());
    }

    const pollInterval = STORE_CONFIG.orderPollingInterval || 15000;

    const checkNewOrders = async () => {
      try {
        const lastChecked = localStorage.getItem('lastOrderCheck') || new Date().toISOString();
        
        // Ambil order baru sejak lastChecked
        const res = await api.get(`/admin/orders/new?since=${lastChecked}`);
        
        if (res.data?.success && res.data?.data) {
          const { orders, count } = res.data.data;
          
          if (orders && orders.length > 0) {
            // Urutkan dari terlama ke terbaru agar notif berurutan
            const sortedOrders = [...orders].reverse();
            
            // Tambahkan ke newOrders (simpan maksimal 20 order di state history)
            setNewOrders((prev) => {
              const combined = [...orders, ...prev];
              return combined.slice(0, 20);
            });
            
            // Tambahkan ke unread count
            setUnreadCount((prev) => prev + orders.length);
            
            // Putar suara premium notifikasi
            playPremiumChime();
            
            // Update timestamp terakhir dicek
            localStorage.setItem('lastOrderCheck', new Date().toISOString());
          }
        }
      } catch (err) {
        console.error('Gagal memuat order baru (polling error):', err.message);
      }
    };

    // Jalankan segera setelah login admin pertama kali, tapi jangan play chime untuk data lama
    if (isInitialMount.current) {
      isInitialMount.current = false;
      checkNewOrders();
    }

    const interval = setInterval(checkNewOrders, pollInterval);

    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = () => {
    setUnreadCount(0);
    localStorage.setItem('lastOrderCheck', new Date().toISOString());
  };

  const clearNotifications = () => {
    setNewOrders([]);
    setUnreadCount(0);
  };

  return {
    newOrders,
    unreadCount,
    markAllRead,
    clearNotifications,
    triggerTestSound: playPremiumChime,
  };
};
