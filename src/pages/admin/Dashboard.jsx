import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaUtensils, FaUsers, FaChevronLeft, FaChevronRight, FaSun, FaMoon } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, menuItems: 0, customers: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // ADDED DARK MODE LOGIC HERE
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

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_dashboard_stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setUpcomingEvents(data.upcomingEvents || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 🔥 SAFE DATE FORMATTER (Prevents "Invalid Date" bugs) 🔥
  const formatSafeDate = (dateStr) => {
    if (!dateStr) return "N/A";
    // Adding T00:00:00 prevents timezone shifting bugs if it's just a YYYY-MM-DD string
    const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(date.getTime())) return "N/A"; 
    return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-center text-transparent">0</div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const m = String(month + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const dateStr = `${year}-${m}-${d}`;
      
      const hasEvent = upcomingEvents.some(e => e.preferred_date && e.preferred_date.startsWith(dateStr));
      const isToday = todayStr === dateStr;

      days.push(
        <div key={day} className={`p-2 text-center text-sm rounded-full mx-auto w-8 h-8 flex items-center justify-center font-medium transition-colors
          ${hasEvent ? 'bg-pink-600 text-white font-bold shadow-md' : 'text-gray-700 dark:text-gray-300'}
          ${isToday && !hasEvent ? 'border-2 border-pink-500 text-pink-600 dark:text-pink-400' : ''}
        `}>
          {day}
        </div>
      );
    }
    return days;
  };

  if (loading) return <div className="text-center mt-10 dark:text-white">Loading dashboard...</div>;

  return (
    <div className="fade-in transition-colors duration-300">
      {/* ADDED DARK MODE BUTTON TO HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Dashboard Overview</h1>
        <button onClick={toggleTheme} className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 p-3 rounded-full shadow-sm hover:text-pink-600 dark:hover:text-pink-400 transition border dark:border-gray-700">
          {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-pink-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Total Bookings</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">{stats.bookings}</div>
            </div>
            <div className="bg-pink-100 dark:bg-gray-700 p-3 rounded-full text-pink-600 dark:text-pink-400 transition-colors duration-300">
              <FaCalendarAlt className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Total Revenue</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">₱ {parseFloat(stats.revenue || 0).toLocaleString()}</div>
            </div>
            <div className="bg-green-100 dark:bg-gray-700 p-3 rounded-full text-green-600 dark:text-green-400 transition-colors duration-300">
              <FaMoneyBillWave className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Menu Items</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">{stats.menuItems}</div>
            </div>
            <div className="bg-yellow-100 dark:bg-gray-700 p-3 rounded-full text-yellow-600 dark:text-yellow-400 transition-colors duration-300">
              <FaUtensils className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Verified Customers</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">{stats.customers}</div>
            </div>
            <div className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 transition-colors duration-300">
              <FaUsers className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300 h-fit">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <h2 className="font-bold text-gray-800 dark:text-white transition-colors duration-300">Upcoming Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm uppercase transition-colors duration-300">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Event Type</th>
                  <th className="p-4 font-semibold">Guests</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingEvents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">No upcoming events scheduled.</td>
                  </tr>
                ) : (
                  upcomingEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      
                      {/* APPLYING SAFE DATE FORMATTER HERE */}
                      <td className="p-4 font-medium text-gray-800 dark:text-white transition-colors duration-300">
                        {formatSafeDate(event.preferred_date)}
                      </td>
                      
                      <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{event.event_type}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{event.guest_count}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          event.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          event.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300 h-fit">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition"><FaChevronLeft /></button>
            <h2 className="font-bold text-gray-800 dark:text-white transition-colors">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </h2>
            <button onClick={handleNextMonth} className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition"><FaChevronRight /></button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs font-bold text-gray-400 dark:text-gray-500">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
          
          <div className="mt-6 border-t dark:border-gray-700 pt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
            <span>Dates with booked events</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;