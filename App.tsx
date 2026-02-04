

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ExperiencePage from './pages/ExperiencePage';
import ServicesPage from './pages/ServicesPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import BookingPage from './pages/BookingPage';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <MobileNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/experiences" element={<ExperiencePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/room/:id" element={<RoomDetailsPage />} />
        <Route path="/booking/:id" element={<BookingPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
