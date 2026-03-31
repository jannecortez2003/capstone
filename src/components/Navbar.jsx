// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = ({ setActiveForm, isLoggedIn, onLogout, user, onShowVerifyModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current user is admin
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

  // Check verification status (Matches 'is_verified' from DB or 'verified' from App state)
  const isVerified = user?.is_verified === 1 || user?.is_verified === true || user?.verified === 1 || user?.verified === true;

  const handleNavClick = (path) => {
    if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
            const section = document.querySelector(path);
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const section = document.querySelector(path);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-md z-50 transition-all duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-pink-600 flex items-center gap-2">
           Mommy Rosal's <span className="text-gray-700 font-light">Catering</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => handleNavClick('#home')} className="text-gray-600 hover:text-pink-600 font-medium transition">Home</button>
          <button onClick={() => handleNavClick('#services')} className="text-gray-600 hover:text-pink-600 font-medium transition">Services</button>
          <button onClick={() => handleNavClick('#packages')} className="text-gray-600 hover:text-pink-600 font-medium transition">Packages</button>
          <button onClick={() => handleNavClick('#contact')} className="text-gray-600 hover:text-pink-600 font-medium transition">Contact</button>
          
          {isLoggedIn ? (
            <div className="relative">
              <button 
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 font-medium focus:outline-none"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUserCircle className="text-2xl" />
                <span>{user?.fullName || user?.username}</span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-100 animate-fade-in-down">
                  {isAdmin ? (
                    <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition" onClick={() => setShowDropdown(false)}>
                        Admin Dashboard
                    </Link>
                  ) : (
                    <>
                        {/* HIDE VERIFY BUTTON IF USER IS ALREADY VERIFIED */}
                        {!isVerified && (
                            <button 
                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                                onClick={() => {
                                    onShowVerifyModal();
                                    setShowDropdown(false);
                                }}
                            >
                                Verify Account
                            </button>
                        )}
                        
                        <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition" onClick={() => setShowDropdown(false)}>
                            My Profile
                        </Link>
                    </>
                  )}
                  <button 
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition border-t"
                    onClick={() => {
                        onLogout();
                        setShowDropdown(false);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
                to="/auth" 
                className="bg-pink-600 text-white px-6 py-2 rounded-full font-medium hover:bg-pink-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-600 text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col space-y-4 shadow-lg">
            <button onClick={() => handleNavClick('#home')} className="text-left text-gray-600 font-medium">Home</button>
            <button onClick={() => handleNavClick('#services')} className="text-left text-gray-600 font-medium">Services</button>
            <button onClick={() => handleNavClick('#packages')} className="text-left text-gray-600 font-medium">Packages</button>
            <button onClick={() => handleNavClick('#contact')} className="text-left text-gray-600 font-medium">Contact</button>
            {isLoggedIn ? (
                <button onClick={onLogout} className="text-left text-red-600 font-bold">Logout</button>
            ) : (
                <Link to="/auth" className="bg-pink-600 text-white text-center py-2 rounded-lg font-bold" onClick={() => setMobileMenuOpen(false)}>
                    Login
                </Link>
            )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;