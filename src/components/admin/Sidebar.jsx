import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    FaHome, FaCalendarCheck, FaBoxes, FaUtensils, 
    FaComments, FaUsers, FaMoneyBillWave, FaChartBar, 
    FaBars, FaTimes, FaMoon, FaSun, FaUserCheck, FaUserShield, FaHistory
} from 'react-icons/fa';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // --- DARK MODE LOGIC ---
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => setDarkMode(!darkMode);
    // -----------------------

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    const navItems = [
        { path: '/admin', icon: FaHome, label: 'Dashboard' },
        { path: '/admin/booking-requests', icon: FaCalendarCheck, label: 'Bookings' },
        { path: '/admin/inventory', icon: FaBoxes, label: 'Inventory' },
        { path: '/admin/menu-items', icon: FaUtensils, label: 'Menu Items' },
        { path: '/admin/customer-chat', icon: FaComments, label: 'Messages' },
        { path: '/admin/staff', icon: FaUsers, label: 'Staff' },
        { path: '/admin/accounts', icon: FaUserShield, label: 'Accounts' },
        { path: '/admin/payment-tracking', icon: FaMoneyBillWave, label: 'Payments' },
        { path: '/admin/reports', icon: FaChartBar, label: 'Reports' },
        { path: '/admin/verification', icon: FaUserCheck, label: 'Verifications' },
        { path: '/admin/activity-logs', icon: FaHistory, label: 'Activity Logs' }
    ];

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden bg-gray-900 text-white flex justify-between items-center p-4 fixed top-0 w-full z-50 shadow-md">
                <span className="text-xl font-bold text-pink-500">Admin Panel</span>
                
                <div className="flex items-center space-x-4">
                    {/* MOBILE DARK MODE TOGGLE */}
                    <button onClick={toggleTheme} className="text-gray-300 hover:text-white p-2 transition">
                        {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
                    </button>
                    
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                        {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                    </button>
                </div>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar Container */}
            <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0 w-64 bg-gray-900 dark:bg-black text-white h-screen overflow-y-auto transition duration-200 ease-in-out z-50 flex flex-col pt-16 md:pt-0`}>
                
                {/* Desktop Header */}
                <div className="hidden md:flex p-6 border-b border-gray-800 justify-between items-center">
                    <h2 className="text-2xl font-bold text-pink-500">Admin Panel</h2>
                    {/* Desktop Dark Mode Toggle */}
                    <button onClick={toggleTheme} className="text-gray-400 hover:text-white transition">
                        {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                    isActive 
                                        ? 'bg-pink-600 text-white' 
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                <Icon className={`text-lg mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;