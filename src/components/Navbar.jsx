import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCheckCircle, FaSun, FaMoon } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

const Navbar = ({ setActiveForm, isLoggedIn, onLogout, user, onShowVerifyModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // === DARK MODE LOGIC ===
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
  // =======================

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
            <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-400">Mommy Rosal's</h1>
          </div>

          {/* ========================================== */}
          {/* DESKTOP MENU (Hidden on Mobile)              */}
          {/* ========================================== */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => handleNavigation('/')} className="text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition">Home</button>
            <a href="/#services" className="text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition">Services</a>
            <a href="/#packages" className="text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition">Packages</a>
            <a href="/#contact" className="text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition">Contact</a>
            
            {/* 🔥 DESKTOP DARK MODE TOGGLE 🔥 */}
            <button 
              onClick={toggleTheme} 
              className="text-gray-500 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition text-xl ml-2"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                
                {/* NEW: NOTIFICATION BELL */}
                {user?.role !== 'admin' && user?.username !== 'admin' && (
                  <NotificationBell />
                )}

                {!user?.verified && user?.role !== 'admin' && user?.username !== 'admin' && (
                  <button 
                    onClick={onShowVerifyModal}
                    className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 px-4 py-2 rounded-full font-bold hover:bg-yellow-200 transition"
                  >
                    <FaCheckCircle /> Verify Account
                  </button>
                )}
                
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold hover:text-pink-700 transition"
                >
                  <FaUserCircle className="text-2xl" /> Profile
                </button>
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
          {/* MOBILE HAMBURGER ICON & TOGGLES              */}
          {/* ========================================== */}
          <div className="md:hidden flex items-center gap-4">
            
            {/* 🔥 FIXED: MOBILE DARK MODE TOGGLE (ALWAYS VISIBLE) 🔥 */}
            <button 
              onClick={toggleTheme} 
              className="text-gray-500 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition text-xl"
              title="Toggle Dark Mode"
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            {/* Mobile Notification Bell (Show if logged in and not admin) */}
            {isLoggedIn && user?.role !== 'admin' && user?.username !== 'admin' && (
                <NotificationBell />
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-200 hover:text-pink-600 focus:outline-none text-2xl">
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE DROPDOWN MENU                         */}
      {/* ========================================== */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl absolute w-full left-0 transition-colors duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <button onClick={() => handleNavigation('/')} className="block w-full text-left px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-medium rounded-md">Home</button>
            <a href="/#services" onClick={() => setIsOpen(false)} className="block w-full text-left px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-medium rounded-md">Services</a>
            <a href="/#packages" onClick={() => setIsOpen(false)} className="block w-full text-left px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-medium rounded-md">Packages</a>
            <a href="/#contact" onClick={() => setIsOpen(false)} className="block w-full text-left px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-medium rounded-md">Contact</a>
            
            <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
              
              {isLoggedIn ? (
                <>
                  {!user?.verified && user?.role !== 'admin' && user?.username !== 'admin' && (
                    <button 
                      onClick={() => handleAction(onShowVerifyModal)}
                      className="flex justify-center items-center gap-2 w-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-md font-bold hover:bg-yellow-200 transition"
                    >
                      <FaCheckCircle /> Verify Account
                    </button>
                  )}
                  <button 
                    onClick={() => handleNavigation('/profile')}
                    className="flex justify-center items-center gap-2 w-full bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400 px-4 py-3 rounded-md font-bold hover:bg-pink-200 transition"
                  >
                    <FaUserCircle className="text-xl" /> My Profile
                  </button>
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