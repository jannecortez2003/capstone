import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Modal, { SuccessModal } from './components/Modal'; 
import EventFormModal from './components/EventFormModal';
import DishSelectionModal from './components/DishSelectionModal'; // <-- RESTORED
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

import ChatBot from './components/ChatBot'; 
import Auth from './pages/Auth'; 
import UserProfile from './pages/UserProfile';
import './App.css'; 

function App() {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [user, setUser] = useState(null);
  
  // Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false); // <-- RESTORED
  const [showEventFormModal, setShowEventFormModal] = useState(false); 
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null); 
  const [finalSelectedDishes, setFinalSelectedDishes] = useState([]); 
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');
  
  const [preSelectedEventType, setPreSelectedEventType] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
    const storedLoginState = localStorage.getItem('isLoggedIn');
    if (storedUser && storedLoginState === 'true') {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (e) {
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
  
  const handleBookingSuccess = (message) => {
    setShowEventFormModal(false); 
    setBookingSuccessMessage(message);
    setShowBookingSuccessModal(true); 
  };

  const handleHeroBooking = () => {
    setPreSelectedEventType("");
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEventSelection = (eventType) => {
    setPreSelectedEventType(eventType);
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
  };

  // RESTORED FIX: Opens the Dish Modal first instead of the Event Form
  const handlePackageSelection = (pkg) => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else if (!user?.verified) {
      setShowVerifyModal(true);
    } else {
      setSelectedPackageForBooking(pkg);
      setShowDishModal(true); 
    }
  };

  // RESTORED FIX: Handles transitioning from Dish Selection to Event Form
  const handleDishSelectionConfirm = (dishes) => {
    setFinalSelectedDishes(dishes);
    setShowDishModal(false);
    setShowEventFormModal(true);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && (
        <Navbar setActiveForm={setActiveForm} isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} onShowVerifyModal={handleShowVerifyModal} />
      )}
      {!isAdminRoute && isLoggedIn && user && user.role !== 'admin' && <ChatBot user={user} />}

      <Routes>
        <Route path="/auth" element={<Auth onLogin={handleAuthLogin} />} />
        <Route path="/profile" element={<UserProfile />} />
        
        <Route path="/" element={
          <>
            <Hero handleHeroBooking={handleHeroBooking} />
            <Services />
            <Packages handlePackageSelection={handlePackageSelection} />
            <Events handleEventSelection={handleEventSelection} />
            <Contact />
            <Footer />
          </>
        } />

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

      {showVerifyModal && user && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-pink-500 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button className="absolute top-5.5 right-6 bg-white p-2 text-gray-600 hover:text-red-600 border-pink-400 border-2" onClick={() => setShowVerifyModal(false)}>×</button>
            <VerifyForm user={user} onClose={() => setShowVerifyModal(false)} onSuccess={() => setShowVerifyModal(false)} />
          </div>
        </div>
      )}

      {/* RESTORED: Dish Selection Modal */}
      <DishSelectionModal 
        isOpen={showDishModal} 
        onClose={() => setShowDishModal(false)} 
        packageData={selectedPackageForBooking} 
        onConfirm={handleDishSelectionConfirm} 
      />

      <EventFormModal 
        isOpen={showEventFormModal} 
        onClose={() => setShowEventFormModal(false)} 
        userId={user?.id} 
        preSelectedPackage={selectedPackageForBooking?.title}
        preSelectedDishes={finalSelectedDishes}
        preSelectedEventType={preSelectedEventType} 
        onBookingSuccess={handleBookingSuccess} 
      />
      
      <SuccessModal isOpen={showBookingSuccessModal} onClose={() => setShowBookingSuccessModal(false)} title="Booking Confirmed!" message={bookingSuccessMessage} />
    </>
  );
}

export default App;