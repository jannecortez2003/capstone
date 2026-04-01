import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaBox, FaUtensils, FaComments, FaUsers, FaMoneyBillWave, FaChartBar, FaUserCheck, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa'; // Added FaSignOutAlt

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Securely clears admin data and forces a redirect to the home page
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/'; // Forces a full page reload to clear React state
  };

  // Array of all admin tabs to make the code much cleaner
  const navItems = [
    { path: '/admin', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/booking-requests', icon: <FaCalendarAlt />, label: 'Bookings' },
    { path: '/admin/inventory', icon: <FaBox />, label: 'Inventory' },
    { path: '/admin/menu-items', icon: <FaUtensils />, label: 'Menu Items' },
    { path: '/admin/customer-chat', icon: <FaComments />, label: 'Chat' },
    { path: '/admin/staff', icon: <FaUsers />, label: 'Staff' },
    { path: '/admin/payment-tracking', icon: <FaMoneyBillWave />, label: 'Payments' },
    { path: '/admin/reports', icon: <FaChartBar />, label: 'Reports' },
    { path: '/admin/verification', icon: <FaUserCheck />, label: 'Verification' },
  ];

  return (
    <>
      {/* ========================================== */}
      {/* 1. MOBILE VIEW (Top Bar + Dropdown)          */}
      {/* ========================================== */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-pink-600 text-white z-50 shadow-md">
        <div className="flex justify-between items-center p-4">
          <h1 className="font-bold text-xl tracking-wider">ADMIN PANEL</h1>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-2xl focus:outline-none hover:text-pink-200 transition"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        {/* The Dropdown Menu */}
        {isOpen && (
          <div className="bg-pink-700 w-full absolute top-full left-0 flex flex-col shadow-2xl max-h-[80vh] overflow-y-auto border-t border-pink-500 pb-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Auto-close menu when a link is clicked
                className={`flex items-center gap-4 p-4 border-b border-pink-600/50 transition ${
                  location.pathname === item.path 
                    ? 'bg-pink-800 font-bold border-l-4 border-white' 
                    : 'hover:bg-pink-800 text-pink-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* 🔥 MOBILE LOGOUT BUTTON 🔥 */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 mt-2 border-t-2 border-pink-900 bg-pink-800 hover:bg-pink-900 text-white font-bold transition w-full text-left"
            >
              <span className="text-xl"><FaSignOutAlt /></span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 2. DESKTOP VIEW (Classic Sidebar)            */}
      {/* ========================================== */}
      <div className="hidden md:flex flex-col w-64 bg-pink-600 h-screen fixed top-0 left-0 text-white shadow-xl z-40">
        <div className="p-6 text-center font-bold text-2xl border-b border-pink-500 tracking-widest mt-4">
          ADMIN
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-4 transition ${
                location.pathname === item.path 
                  ? 'bg-pink-800 border-l-4 border-white font-bold' 
                  : 'hover:bg-pink-700 text-pink-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* 🔥 DESKTOP LOGOUT BUTTON 🔥 */}
        <div className="border-t border-pink-500 bg-pink-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-5 hover:bg-pink-800 text-white font-bold transition"
          >
            <span className="text-xl"><FaSignOutAlt /></span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;