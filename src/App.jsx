import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Modal, { SuccessModal } from './components/Modal';
import EventFormModal from './components/EventFormModal';
import DishSelectionModal from './components/DishSelectionModal';
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
import AccountList from './pages/admin/AccountList';
import ActivityLogs from './pages/admin/ActivityLogs';
import ChatBot from './components/ChatBot';
import AdminPackages from './pages/admin/AdminPackages';
import Auth from './pages/Auth';
import UserProfile from './pages/UserProfile';
import './App.css';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem('user') || sessionStorage.getItem('adminUser');
    try { return storedUser ? JSON.parse(storedUser) : null; } catch { return null; }
  });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const [activeForm, setActiveForm] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  // MODAL STATES
  const [showEventFormModal, setShowEventFormModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  
  // BOOKING DATA STATES
  const [selectedPackageForBooking, setSelectedPackageForBooking] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');
  const [preSelectedEventType, setPreSelectedEventType] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user') || sessionStorage.getItem('adminUser');
    const storedLoginState = sessionStorage.getItem('isLoggedIn');
    if (storedUser && storedLoginState === 'true') {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
        if (location.pathname.startsWith('/admin')) {
            const isAdminType = ['admin', 'manager', 'staff'].includes(parsedUser.role) || parsedUser.username === 'admin';
            if (!isAdminType) navigate('/', { replace: true });
        }
      } catch (e) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('isLoggedIn');
      }
    } else {
        if (location.pathname.startsWith('/admin') || location.pathname === '/profile') {
            navigate('/auth', { replace: true });
        }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (activeForm === 'login' || activeForm === 'signup') {
      navigate('/auth');
      setActiveForm(null);
    }
  }, [activeForm, navigate]);

  const handleAuthLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    sessionStorage.setItem("isLoggedIn", "true");
    if (['admin', 'manager', 'staff'].includes(userData.role) || userData.username === 'admin') {
        sessionStorage.setItem("adminUser", JSON.stringify(userData));
        navigate('/admin');
    } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        navigate('/');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const handleHeroBooking = () => {
    setPreSelectedEventType("");
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEventSelection = (eventType) => {
    setPreSelectedEventType(eventType);
    document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' });
  };

  // PHASES CONTROLLER
  const handlePackageSelection = (pkg) => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else if (!user?.verified && !['admin', 'manager', 'staff'].includes(user?.role) && user?.username !== 'admin') {
      setShowVerifyModal(true);
    } else {
      setSelectedPackageForBooking(pkg);
      setShowEventFormModal(true); 
    }
  };

  // Triggered when completing Phase 2
  const handleEventDetailsConfirm = (details) => {
    setEventDetails(details);
    setShowEventFormModal(false);
    
    // Check if customer selected Food/Catering in Phase 2
    if (details.inclusions.includes('Food/Catering (7 Dishes)')) {
        setShowDishModal(true); // Proceed to Phase 3
    } else {
        submitFinalBooking(details, []); // Skip Phase 3 if no food
    }
  };

  // Triggered when completing Phase 3 (if applicable)
  const handleDishSelectionConfirm = async (dishes) => {
      submitFinalBooking(eventDetails, dishes);
  };

  // Final Database Submission
  const submitFinalBooking = async (details, dishes) => {
    setIsBookingLoading(true);
    const payload = {
      userId: user?.id,
      eventType: details.eventType,
      packageType: selectedPackageForBooking?.title, 
      serviceType: details.inclusions.join(', '), 
      preferredDate: details.preferredDate,
      duration: details.duration,
      eventTime: details.eventTime,
      eventLocation: details.eventLocation,
      guestCount: details.guestCount, // The dynamically edited guest count
      selectedDishes: dishes.join('; '),
      totalCost: 0 // Will be negotiated by admin
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/book_event`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setIsBookingLoading(false);
      if (data.success) {
         setShowDishModal(false);
         setBookingSuccessMessage("Event requested successfully! Our admin will review your inclusions and contact you for price negotiation.");
         setShowBookingSuccessModal(true);
      } else {
         alert(data.message || "Booking failed.");
      }
    } catch (err) {
       setIsBookingLoading(false);
       alert("Network error. Please try again.");
    }
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && (
        <Navbar setActiveForm={setActiveForm} isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} onShowVerifyModal={() => setShowVerifyModal(true)} theme={theme} toggleTheme={toggleTheme} />
      )}
      {!isAdminRoute && isLoggedIn && user && !['admin', 'manager', 'staff'].includes(user.role) && user.username !== 'admin' && <ChatBot user={user} />}
      
      <Routes>
        <Route path="/auth" element={
          <><Hero handleHeroBooking={handleHeroBooking} /><Services /><Packages handlePackageSelection={handlePackageSelection} /><Events handleEventSelection={handleEventSelection} /><Contact isLoggedIn={isLoggedIn} user={user} /><Footer /><Auth onLogin={handleAuthLogin} /></>
        } />
        <Route path="/profile" element={isLoggedIn ? <UserProfile /> : <Navigate to="/auth" replace />} />
        <Route path="/" element={
          <><Hero handleHeroBooking={handleHeroBooking} /><Services /><Packages handlePackageSelection={handlePackageSelection} /><Events handleEventSelection={handleEventSelection} /><Contact isLoggedIn={isLoggedIn} user={user} /><Footer /></>
        } />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="booking-requests" element={<BookingRequests />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="menu-items" element={<MenuItems />} />
          <Route path="customer-chat" element={<CustomerChat />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="accounts" element={<AccountList />} />
          <Route path="payment-tracking" element={<PaymentTracking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="verification" element={<VerificationRequests />} />
          <Route path="activity-logs" element={<ActivityLogs />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showVerifyModal && user && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] backdrop-blur-sm bg-black/50">
          <div className="bg-pink-500 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button className="absolute top-5.5 right-6 bg-white p-2 text-gray-600 hover:text-red-600 border-pink-400 border-2 rounded-full" onClick={() => setShowVerifyModal(false)}>X</button>
            <VerifyForm user={user} onClose={() => setShowVerifyModal(false)} onSuccess={() => setShowVerifyModal(false)} />
          </div>
        </div>
      )}

      {/* PHASE 1 & 2 MODAL */}
      <EventFormModal 
         isOpen={showEventFormModal} 
         onClose={() => setShowEventFormModal(false)} 
         packageCapacity={selectedPackageForBooking?.guestCount} 
         preSelectedEventType={preSelectedEventType} 
         onNext={handleEventDetailsConfirm} 
       />

      {/* PHASE 3 MODAL */}
      <DishSelectionModal 
         isOpen={showDishModal} 
         onClose={() => setShowDishModal(false)} 
         packageData={selectedPackageForBooking} 
         onConfirm={handleDishSelectionConfirm} 
         isLoading={isBookingLoading} 
      />
      
      <SuccessModal isOpen={showBookingSuccessModal} onClose={() => setShowBookingSuccessModal(false)} title="Request Sent!" message={bookingSuccessMessage} />
    </>
  );
}

export default App;