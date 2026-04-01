// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Modal, { SuccessModal } from './components/Modal'; 
import EventFormModal from './components/EventFormModal';
import Services from './components/Services';
import Events from './components/Events';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import BookingRequests from './pages/admin/BookingRequests';
import Inventory from './pages/admin/Inventory';
import MenuItems from './pages/admin/MenuItems';
import CustomerChat from './pages/admin/CustomerChat';
import StaffPage from './pages/admin/StaffPage';
import PaymentTracking from './pages/admin/PaymentTracking';
import Reports from './pages/admin/Reports';
import Packages from './components/Packages';
import VerificationRequests from './pages/admin/VerificationRequests';
import AppointmentStatus from './components/AppointmentStatus';
import VerifyForm from './components/VerifyForm';

// ✨ FEATURES IMPORT
import ChatBot from './components/ChatBot'; 
import Auth from './pages/Auth'; 
import UserProfile from './pages/UserProfile';

import './App.css'; 

function App() {
  const navigate = useNavigate();
  const location = useLocation(); // ADDED: To check which page we are on
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [user, setUser] = useState(null);
  
  // Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPackagesModal, setShowPackagesModal] = useState(false); 
  const [showEventFormModal, setShowEventFormModal] = useState(false); 
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null); 
  const [finalSelectedDishes, setFinalSelectedDishes] = useState([]); 
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
    const storedLoginState = localStorage.getItem('isLoggedIn');
    if (storedUser && storedLoginState === 'true') {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error parsing user data", e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (activeForm === 'login' || activeForm === 'signup') {
      navigate('/auth');
      setActiveForm(null);
    }
  }, [activeForm, navigate]);

  const handleAuthLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");
    
    if (userData.username === 'admin' || userData.role === 'admin') {
         navigate('/admin');
    } else {
         navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/'); 
  };

  const handleShowVerifyModal = () => setShowVerifyModal(true);
  const handleVerificationSuccess = () => setShowVerifyModal(false);
  
  const handleBookingSuccess = (message) => {
    setShowEventFormModal(false); 
    setBookingSuccessMessage(message);
    setShowBookingSuccessModal(true); 
  };
  
  const handleCloseBookingSuccessModal = () => {
      setShowBookingSuccessModal(false);
      setBookingSuccessMessage('');
  };

  const startBookingFlow = () => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else if (!user?.verified) { 
      setShowVerifyModal(true); 
    } else {
      setShowPackagesModal(true); 
    }
  };

  const handleBookingConfirmed = (pkgData, dishes) => {
    setSelectedPackageForBooking(pkgData);
    setFinalSelectedDishes(dishes);
    setShowPackagesModal(false); 
    setShowEventFormModal(true); 
  };

  // ADDED: Check if we are currently inside the Admin panel
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* ONLY show the public Navbar if we are NOT in the admin panel */}
      {!isAdminRoute && (
        <Navbar
          setActiveForm={setActiveForm}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          user={user}
          onShowVerifyModal={handleShowVerifyModal} 
        />
      )}

      {/* Global Features (Hidden on Admin pages) */}
      {!isAdminRoute && <ChatBot />}

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/auth" element={<Auth onLogin={handleAuthLogin} />} />
        <Route path="/profile" element={<UserProfile />} />
        
        <Route path="/" element={
          <>
            <Hero
              isLoggedIn={isLoggedIn}
              setActiveForm={setActiveForm}
              startBookingFlow={startBookingFlow} 
            />
            <Services />
            <Packages 
                isLoggedIn={isLoggedIn} 
                setActiveForm={setActiveForm} 
                startBookingFlow={startBookingFlow} 
                isOpen={showPackagesModal}
                onClose={() => setShowPackagesModal(false)}
                onConfirmBooking={handleBookingConfirmed}
            />
            <Events 
                isLoggedIn={isLoggedIn} 
                setActiveForm={setActiveForm}
                startBookingFlow={startBookingFlow} 
            />
            <Contact />
            <Footer />
          </>
        } />

        {/* ADMIN ROUTES */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="booking-requests" element={<BookingRequests />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="menu-items" element={<MenuItems />} />
          <Route path="customer-chat" element={<CustomerChat />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="payment-tracking" element={<PaymentTracking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="verification" element={<VerificationRequests />} />
        </Route>
      </Routes>

      {/* GLOBAL MODALS */}
      {showVerifyModal && user && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-pink-500 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-5.5 right-6 bg-white text-1x2 p-2 text-gray-600 hover:text-red-600 border-pink-400 border-2"
              onClick={() => setShowVerifyModal(false)}
            >
              ×
            </button>
            <VerifyForm
              user={user}
              onClose={() => setShowVerifyModal(false)}
              onSuccess={handleVerificationSuccess}
            />
          </div>
        </div>
      )}

      <EventFormModal 
        isOpen={showEventFormModal} 
        onClose={() => setShowEventFormModal(false)} 
        userId={user?.id} 
        preSelectedPackage={selectedPackageForBooking?.title}
        preSelectedDishes={finalSelectedDishes}
        onBookingSuccess={handleBookingSuccess} 
      />
      
      <SuccessModal
          isOpen={showBookingSuccessModal}
          onClose={handleCloseBookingSuccessModal}
          title="Booking Confirmed!"
          message={bookingSuccessMessage}
      />
    </>
  );
}

export default App;