import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCheckCircle, FaSun, FaMoon } from 'react-icons/fa';
import NotificationBell from './NotificationBell';

// Helper component for professional animated desktop links
const NavLink = ({ title, onClick, href }) => {
  return (
    <a 
      href={href} 
      onClick={onClick} 
      className="relative text-gray-700 dark:text-gray-200 font-semibold group px-1 py-2 cursor-pointer transition-colors duration-300 hover:text-pink-600 dark:hover:text-pink-400"
    >
      {title}
      <span className="absolute inset-x-0 bottom-0 h-[2px] bg-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></span>
    </a>
  );
};

const Navbar = ({ setActiveForm, isLoggedIn, onLogout, user, onShowVerifyModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  // === SCROLL EFFECT ===
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-md shadow-sm border-gray-200 dark:border-gray-800 py-1' 
          : 'bg-white dark:bg-gray-900 border-transparent py-2'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent tracking-tight">
                Mommy Rosal's
              </h1>
            </div>

            {/* ========================================== */}
            {/* DESKTOP MENU (Hidden on Mobile)              */}
            {/* ========================================== */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex space-x-6 mr-4">
                <NavLink onClick={() => handleNavigation('/')} title="Home" />
                <NavLink href="/#services" title="Services" />
                <NavLink href="/#packages" title="Packages" />
                <NavLink href="/#contact" title="Contact" />
              </div>

              {/* Desktop Dark Mode Toggle */}
              <button 
                onClick={toggleTheme} 
                className="text-gray-500 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Toggle Dark Mode"
              >
                {theme === 'dark' ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
              </button>

              {isLoggedIn ? (
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                  {user?.role !== 'admin' && user?.username !== 'admin' && (
                    <NotificationBell />
                  )}
                  
                  {!user?.verified && user?.role !== 'admin' && user?.username !== 'admin' && (
                    <button 
                      onClick={onShowVerifyModal}
                      className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
                    >
                      <FaCheckCircle /> Verify Account
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    <FaUserCircle className="text-xl" /> Profile
                  </button>
                  
                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-pink-700 hover:shadow-lg hover:shadow-pink-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setActiveForm('login')} 
                  className="bg-pink-600 text-white px-7 py-2 rounded-full font-bold text-sm hover:bg-pink-700 hover:shadow-lg hover:shadow-pink-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* ========================================== */}
            {/* MOBILE HAMBURGER ICON                        */}
            {/* ========================================== */}
            <div className="md:hidden flex items-center gap-4">
              {isLoggedIn && user?.role !== 'admin' && user?.username !== 'admin' && (
                  <NotificationBell />
              )}
              <button onClick={() => setIsOpen(true)} className="text-gray-700 dark:text-gray-200 hover:text-pink-600 focus:outline-none text-2xl p-1">
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================== */}
      {/* MOBILE SIDE DRAWER MENU                      */}
      {/* ========================================== */}
      
      {/* Dark Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Side Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-gray-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-black bg-gradient-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-pink-600 dark:text-gray-400 text-2xl p-1 transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          <button onClick={() => handleNavigation('/')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-bold rounded-xl transition-colors">Home</button>
          <a href="/#services" onClick={() => setIsOpen(false)} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-bold rounded-xl transition-colors">Services</a>
          <a href="/#packages" onClick={() => setIsOpen(false)} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-bold rounded-xl transition-colors">Packages</a>
          <a href="/#contact" onClick={() => setIsOpen(false)} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 font-bold rounded-xl transition-colors">Contact</a>
        </div>

        {/* Drawer Footer / Actions */}
        <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-3">
          <button 
            onClick={toggleTheme} 
            className="flex justify-center items-center gap-2 w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            {theme === 'dark' ? <><FaSun className="text-yellow-500"/> Light Mode</> : <><FaMoon className="text-gray-600"/> Dark Mode</>}
          </button>

          {isLoggedIn ? (
            <>
              {!user?.verified && user?.role !== 'admin' && user?.username !== 'admin' && (
                <button 
                  onClick={() => handleAction(onShowVerifyModal)}
                  className="flex justify-center items-center gap-2 w-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-xl font-bold hover:bg-yellow-200 transition-colors"
                >
                  <FaCheckCircle /> Verify Account
                </button>
              )}
              <button 
                onClick={() => handleNavigation('/profile')}
                className="flex justify-center items-center gap-2 w-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-4 py-3 rounded-xl font-bold hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors"
              >
                <FaUserCircle className="text-xl" /> My Profile
              </button>
              <button 
                onClick={() => handleAction(onLogout)}
                className="flex justify-center items-center gap-2 w-full bg-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-md"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleAction(() => setActiveForm('login'))}
              className="w-full bg-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-md"
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;