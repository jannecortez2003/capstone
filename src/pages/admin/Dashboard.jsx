import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaUtensils, FaUsers } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, menuItems: 0, customers: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center mt-10 dark:text-white">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-300">Dashboard Overview</h1>
      
      {/* Stat Cards */}
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
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">₱{parseFloat(stats.revenue || 0).toLocaleString()}</div>
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

      {/* Upcoming Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <h2 className="font-bold text-gray-800 dark:text-white transition-colors duration-300">Upcoming Events (Next 5)</h2>
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
                    <td className="p-4 font-medium text-gray-800 dark:text-white transition-colors duration-300">{new Date(event.preferred_date).toLocaleDateString()}</td>
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
    </div>
  );
};

export default Dashboard;