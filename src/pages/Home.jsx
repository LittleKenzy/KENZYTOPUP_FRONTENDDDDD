import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock, Bell } from 'lucide-react';
import { getCategoryIcon, getCategoryLabel } from '../utils/formatters';
import api from '../api/axios';
import Modal from '../components/Modal';
import FlashSaleBanner from '../components/FlashSaleBanner';
import DailyMission from '../components/DailyMission';

const CATEGORIES = ['GAME', 'EWALLET', 'PLN', 'PULSA', 'PAKET_DATA'];

export default function Home() {
  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [flashSales, setFlashSales] = useState([]);

  useEffect(() => {
    fetchNews();
    fetchFlashSales();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get('/news');
      if (res.data?.success) {
        setNews(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch news', err);
    }
  };

  const fetchFlashSales = async () => {
    try {
      const res = await api.get('/flash-sales');
      if (res.data?.success) {
        setFlashSales(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch flash sales', err);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 0', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--surface-card) 0%, var(--primary-bg) 100%)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <h1 className="text-hero" style={{ marginBottom: '1.5rem' }}>
            Top Up Cepat, <br/>
            <span style={{ color: 'var(--accent)' }}>Aman & Terpercaya</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Kenzy Store menyediakan berbagai layanan produk digital mulai dari Top Up Game, E-Wallet, Token Listrik hingga Paket Data dengan proses instan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/layanan" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Beli Sekarang <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <FlashSaleBanner flashSales={flashSales} />



      {/* News Banner Section */}
      {news.length > 0 && (
        <section className="container" style={{ padding: '3rem 1.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
            <Bell size={24} />
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Pengumuman & Berita</h2>
          </div>
          <div style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            gap: '1.5rem', 
            paddingBottom: '1rem',
            scrollSnapType: 'x mandatory'
          }}>
            {news.map((item) => (
              <div 
                key={item.id} 
                className="card" 
                onClick={() => setSelectedNews(item)}
                style={{ 
                  minWidth: '280px', 
                  maxWidth: '350px', 
                  flexShrink: 0,
                  scrollSnapAlign: 'start',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    style={{ 
                      width: '100%', 
                      height: '160px', 
                      objectFit: 'cover' 
                    }} 
                  />
                )}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: item.isPinned ? '70%' : '100%' }}>
                      {item.title}
                    </h3>
                    {item.isPinned && (
                      <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>Pinned</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.content}
                  </p>
                  <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Baca selengkapnya <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* News Modal */}
      <Modal 
        isOpen={!!selectedNews} 
        onClose={() => setSelectedNews(null)} 
        title={selectedNews?.title || 'Detail Pengumuman'}
      >
        {selectedNews && (
          <div style={{ padding: '0.5rem 0' }}>
            {selectedNews.imageUrl && (
              <img 
                src={selectedNews.imageUrl} 
                alt={selectedNews.title} 
                style={{ 
                  width: '100%', 
                  maxHeight: '250px', 
                  objectFit: 'cover', 
                  borderRadius: '0.75rem',
                  marginBottom: '1.5rem'
                }} 
              />
            )}
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-muted)', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Diperbarui pada: {new Date(selectedNews.updatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {selectedNews.isPinned && (
                 <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 600 }}>Penting</span>
              )}
            </div>
            <p style={{ 
              color: 'var(--text-main)', 
              fontSize: '1rem', 
              lineHeight: '1.7', 
              whiteSpace: 'pre-wrap', 
              margin: 0 
            }}>
              {selectedNews.content}
            </p>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
               <button className="btn btn-primary" onClick={() => setSelectedNews(null)} style={{ width: '100%' }}>Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Daily Mission (Only shows if logged in) */}
      <div className="container" style={{ padding: '2rem 1.5rem 0' }}>
        <DailyMission />
      </div>

      {/* Categories Grid */}
      <section className="container" style={{ padding: '5rem 1.5rem' }}>
        <h2 className="text-section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Kategori Layanan</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {CATEGORIES.map(cat => (
            <Link key={cat} to={`/layanan?category=${cat}`} className="card" style={{ 
              textAlign: 'center', 
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ 
                fontSize: '3rem', 
                width: '80px', 
                height: '80px', 
                backgroundColor: 'rgba(233, 69, 96, 0.1)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem'
              }}>
                {getCategoryIcon(cat)}
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>{getCategoryLabel(cat)}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ backgroundColor: 'var(--surface-card)', padding: '5rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--accent)' }}><Zap size={40} /></div>
              <div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Proses Instan</h4>
                <p style={{ color: 'var(--text-muted)' }}>Transaksi diproses secara otomatis dalam hitungan detik setelah pembayaran.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--accent)' }}><Shield size={40} /></div>
              <div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Aman & Terpercaya</h4>
                <p style={{ color: 'var(--text-muted)' }}>Keamanan data dan transaksi Anda adalah prioritas utama kami.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--accent)' }}><Clock size={40} /></div>
              <div>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Layanan 24/7</h4>
                <p style={{ color: 'var(--text-muted)' }}>Sistem kami online 24 jam non-stop siap melayani kebutuhan Anda kapanpun. (On going to 24/7)</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
