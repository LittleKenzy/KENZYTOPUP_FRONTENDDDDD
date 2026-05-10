import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, LogOut, User, History, Home, CreditCard, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: 'var(--surface-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
          <Gamepad2 size={28} color="var(--accent)" />
          <span>Kenzy <span style={{ color: 'var(--accent)' }}>Store</span></span>
        </Link>

        {/* Links */}
        <div className="nav-links">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            <Home size={18} /> <span>Home</span>
          </Link>
          <Link to="/layanan" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            <CreditCard size={18} /> <span>Layanan</span>
          </Link>
          {user && (
            <Link to="/riwayat" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              <History size={18} /> <span>Riwayat</span>
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--warning)' }}>
              <Shield size={18} /> <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Auth Actions */}
        <div className="auth-actions">
          {user ? (
            <div className="user-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User size={16} />
                </div>
                <div className="user-name-role" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} /> <span className="user-name-role">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Daftar</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
