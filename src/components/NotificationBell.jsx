import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    // Get user from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        if (!user) return;
        
        // Fetch notifications every 10 seconds
        const fetchNotifs = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/fetch_notifications?userId=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setNotifications(data.notifications);
                }
            } catch (err) {
                console.error("Error fetching notifications", err);
            }
        };

        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000);
        return () => clearInterval(interval);
    }, [user]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        
        // If opening and there are unread notifications, mark them as read in the database
        if (!isOpen && unreadCount > 0) {
            try {
                await fetch(`${import.meta.env.VITE_API_URL}/mark_notifications_read`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                });
                
                // Locally update state so badge clears immediately
                setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            } catch (err) {
                console.error("Error marking as read", err);
            }
        }
    };

    if (!user) return null; // Don't show bell if not logged in

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button 
                onClick={handleOpen}
                className="relative p-2 text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 transition"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                // Added max-w-[90vw] and right-[-10px] md:right-0 to prevent mobile edge bleed
                <div className="absolute right-[-20px] sm:right-0 mt-2 w-80 max-w-[90vw] sm:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">No notifications yet.</div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => {
                                        if (notif.message.toLowerCase().includes('message')) {
                                            window.dispatchEvent(new Event('open-chat'));
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`p-4 border-b border-gray-50 dark:border-gray-700/50 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition ${notif.is_read ? 'opacity-70' : 'bg-pink-50/50 dark:bg-pink-900/10'}`}
                                >
                                    {/* FIX: break-words whitespace-pre-wrap ensures long text wraps properly */}
                                    <p className="text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap leading-relaxed">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-medium">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;