import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import { getCategoryIcon, getCategoryLabel } from '../utils/formatters';

const CATEGORIES = ['GAME', 'EWALLET', 'PLN', 'PULSA', 'PAKET_DATA'];

export default function Home() {
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
