import React, { useState, useEffect } from 'react';
import { Timer, Tag } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function FlashSaleBanner({ flashSales }) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    if (!flashSales || flashSales.length === 0) return;

    const interval = setInterval(() => {
      const newTimeLeft = {};
      flashSales.forEach((sale) => {
        const end = new Date(sale.endAt).getTime();
        const now = new Date().getTime();
        const distance = end - now;

        if (distance < 0) {
          newTimeLeft[sale.id] = { expired: true };
        } else {
          newTimeLeft[sale.id] = {
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            expired: false,
          };
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSales]);

  if (!flashSales || flashSales.length === 0) return null;

  return (
    <section className="container" style={{ padding: '3rem 1.5rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#ef4444' }}>
        <Tag size={24} />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Flash Sale</h2>
      </div>
      <div style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: '1.5rem', 
        paddingBottom: '1rem',
        scrollSnapType: 'x mandatory'
      }}>
        {flashSales.map((sale) => {
          const t = timeLeft[sale.id];
          if (t?.expired) return null;

          return (
            <div 
              key={sale.id} 
              className="card" 
              onClick={() => {
                if (sale.product) {
                  navigate(`/layanan?category=${sale.product.category}&productId=${sale.productId}`);
                } else if (sale.category) {
                  navigate(`/layanan?category=${sale.category}`);
                } else {
                  navigate('/layanan');
                }
              }}
              style={{ 
                minWidth: '280px', 
                maxWidth: '350px', 
                flexShrink: 0,
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                padding: '1.5rem',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.25rem 1rem',
                borderBottomLeftRadius: '1rem',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                -{sale.discountPercent}%
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ef4444' }}>{sale.title}</h3>
              {sale.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{sale.description}</p>
              )}
              
              {sale.product && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontWeight: '800', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{sale.product.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {formatRupiah(sale.product.price)}
                    </div>
                    <div style={{ fontWeight: '900', color: '#ef4444', fontSize: '1.25rem' }}>
                      {formatRupiah(sale.discountedPrice)}
                    </div>
                  </div>
                </div>
              )}

              {(!sale.product && sale.category) && (
                <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                  Kategori: {sale.category}
                </div>
              )}

              {(!sale.product && !sale.category) && (
                <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                  Semua Produk
                </div>
              )}

              <div style={{ 
                marginTop: 'auto', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: 'var(--surface-card)',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                justifyContent: 'center'
              }}>
                <Timer size={16} color="#ef4444" />
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.125rem', color: '#ef4444' }}>
                  {t ? `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}` : '00:00:00'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
