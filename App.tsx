

import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExperiencePage from './pages/ExperiencePage';
import ServicesPage from './pages/ServicesPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import HelpCenterPage from './pages/HelpCenterPage';
import CancellationPolicyPage from './pages/CancellationPolicyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginModal from './components/LoginModal';

const App: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = React.useState<{ fullName: string; email: string; phoneNumber: string; countryCode: string } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
  const [admin, setAdmin] = React.useState<{ name: string; email: string } | null>(null);

  const handleLoginSuccess = (userData: { fullName: string; email: string; phoneNumber: string; countryCode: string }) => {
    setUser(userData);
    setIsLoginOpen(false);
  };

  const openLogin = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsLoginOpen(true);
  };

  const handleAdminLogin = (adminData: { name: string; email: string }) => {
    setAdmin(adminData);
  };

  const handleAdminLogout = () => {
    setAdmin(null);
  };

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Admin routes render without Navbar/Footer
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLoginPage onLogin={handleAdminLogin} />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage admin={admin} onLogout={handleAdminLogout} />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} setUser={setUser} onOpenLogin={openLogin} />
      <MobileNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/experiences" element={<ExperiencePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/room/:id" element={<RoomDetailsPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        <Route path="/profile" element={<ProfilePage user={user} onOpenLogin={() => openLogin('login')} />} />
        <Route path="/account" element={<AccountPage user={user} />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
      </Routes>
      <Footer />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        mode={authMode}
      />
    </div>
  );
};

export default App;

