import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Layanan from './pages/Layanan';
import Riwayat from './pages/Riwayat';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminQris from './pages/admin/Qris';
import AdminNews from './pages/admin/News';
import AdminFlashSales from './pages/admin/FlashSales';
import AdminLoyalty from './pages/admin/Loyalty';
import AdminMissions from './pages/admin/Missions';
import AdminWaBlast from './pages/admin/WaBlast';
import NotificationsPage from './pages/NotificationsPage';
import LoyaltyPage from './pages/LoyaltyPage';
import MissionsPage from './pages/MissionsPage';
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/layanan" element={<Layanan />} />
              
              {/* Protected Routes */}
              <Route 
                path="/riwayat" 
                element={
                  <ProtectedRoute>
                    <Riwayat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/loyalty" 
                element={
                  <ProtectedRoute>
                    <LoyaltyPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/missions" 
                element={
                  <ProtectedRoute>
                    <MissionsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/orders/:id" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/qris" 
                element={
                  <AdminRoute>
                    <AdminQris />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/news" 
                element={
                  <AdminRoute>
                    <AdminNews />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/flash-sales" 
                element={
                  <AdminRoute>
                    <AdminFlashSales />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/loyalty" 
                element={
                  <AdminRoute>
                    <AdminLoyalty />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/missions" 
                element={
                  <AdminRoute>
                    <AdminMissions />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/blast" 
                element={
                  <AdminRoute>
                    <AdminWaBlast />
                  </AdminRoute>
                } 
              />
            </Routes>
          </main>
          <WhatsAppButton />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
