import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCheckCircle } from 'react-icons/fa';

const Navbar = ({ setActiveForm, isLoggedIn, onLogout, user, onShowVerifyModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Helper function to close menu when a link is clicked
  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <nav className="fixed w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
            <h1 className="text-2xl font-bold text-pink-600">Mommy Rosal's</h1>
          </div>

          {/* ========================================== */}
          {/* DESKTOP MENU (Hidden on Mobile)              */}
          {/* ========================================== */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => handleNavigation('/')} className="text-gray-700 hover:text-pink-600 font-medium transition">Home</button>
            <a href="/#services" className="text-gray-700 hover:text-pink-600 font-medium transition">Services</a>
            <a href="/#packages" className="text-gray-700 hover:text-pink-600 font-medium transition">Packages</a>
            <a href="/#contact" className="text-gray-700 hover:text-pink-600 font-medium transition">Contact</a>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {/* Verify Button (Only show if unverified and not admin) */}
                {!user?.verified && user?.role !== 'admin' && user?.username !== 'admin' && (
                  <button 
                    onClick={onShowVerifyModal}
                    className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold hover:bg-yellow-200 transition"
                  >
                    <FaCheckCircle /> Verify Account
                  </button>
                )}
                {/* Profile Button */}
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition"
                >
                  <FaUserCircle className="text-2xl" /> Profile
                </button>
                {/* Logout Button */}
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2 rounded-full font-bold hover:bg-pink-700 transition"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveForm('login')} 
                className="bg-pink-600 text-white px-6 py-2 rounded-full font-bold hover:bg-pink-700 transition"
              >
                Sign In
              </button>
            )}
          </div>

          {/* ========================================== */}
          {/* MOBILE HAMBURGER ICON                        */}
          {/* ========================================== */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-pink-600 focus:outline-none text-2xl">
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE DROPDOWN MENU                         */}
      {/* ========================================== */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <button onClick={() => handleNavigation('/')} className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium rounded-md">Home</button>
            <a href="/#services" onClick={() => setIsOpen(false)} className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium rounded-md">Services</a>
            <a href="/#packages" onClick={() => setIsOpen(false)} className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium rounded-md">Packages</a>
            <a href="/#contact" onClick={() => setIsOpen(false)} className="block w-full text-left px-3 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-600 font-medium rounded-md">Contact</a>
            
            {/* Mobile Auth & Action Buttons */}
            <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  {/* Verify Button for Mobile */}
                  {!user?.verified && user?.role !== 'admin' && user?.username !== 'admin' && (
                    <button 
                      onClick={() => handleAction(onShowVerifyModal)}
                      className="flex justify-center items-center gap-2 w-full bg-yellow-100 text-yellow-700 px-4 py-3 rounded-md font-bold hover:bg-yellow-200 transition"
                    >
                      <FaCheckCircle /> Verify Account
                    </button>
                  )}
                  {/* Profile Button for Mobile */}
                  <button 
                    onClick={() => handleNavigation('/profile')}
                    className="flex justify-center items-center gap-2 w-full bg-pink-100 text-pink-700 px-4 py-3 rounded-md font-bold hover:bg-pink-200 transition"
                  >
                    <FaUserCircle className="text-xl" /> My Profile
                  </button>
                  {/* Logout Button for Mobile */}
                  <button 
                    onClick={() => handleAction(onLogout)}
                    className="flex justify-center items-center gap-2 w-full bg-pink-600 text-white px-4 py-3 rounded-md font-bold hover:bg-pink-700 transition"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleAction(() => setActiveForm('login'))}
                  className="w-full bg-pink-600 text-white px-4 py-3 rounded-md font-bold hover:bg-pink-700 transition"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;