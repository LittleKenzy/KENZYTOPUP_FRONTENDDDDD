import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, ListOrdered, QrCode, Newspaper, Tag, Gift } from 'lucide-react';

export default function AdminTabs() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
      <Link 
        to="/admin" 
        className="btn"
        style={{ 
          backgroundColor: path === '/admin' ? 'var(--accent)' : 'var(--surface-card)',
          color: path === '/admin' ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}
      >
        <ListOrdered size={18} /> Transaksi
      </Link>
      <Link 
        to="/admin/products" 
        className="btn"
        style={{ 
          backgroundColor: path.includes('/admin/products') ? 'var(--accent)' : 'var(--surface-card)',
          color: path.includes('/admin/products') ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}
      >
        <ShoppingCart size={18} /> Produk
      </Link>
      <Link 
        to="/admin/qris" 
        className="btn"
        style={{ 
          backgroundColor: path === '/admin/qris' ? 'var(--accent)' : 'var(--surface-card)',
          color: path === '/admin/qris' ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}
      >
        <QrCode size={18} /> QRIS
      </Link>
      <Link 
        to="/admin/news" 
        className="btn"
        style={{ 
          backgroundColor: path === '/admin/news' ? 'var(--accent)' : 'var(--surface-card)',
          color: path === '/admin/news' ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}
      >
        <Newspaper size={18} /> Berita
      </Link>
      <Link 
        to="/admin/flash-sales" 
        className="btn"
        style={{ 
          backgroundColor: path === '/admin/flash-sales' ? 'var(--accent)' : 'var(--surface-card)',
          color: path === '/admin/flash-sales' ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}
      >
        <Tag size={18} /> Flash Sale
      </Link>
      <Link 
        to="/admin/loyalty" 
        className="btn"
        style={{ 
          backgroundColor: path === '/admin/loyalty' ? 'var(--accent)' : 'var(--surface-card)',
          color: path === '/admin/loyalty' ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}
      >
        <Gift size={18} /> Loyalty
      </Link>
    </div>
  );
}
