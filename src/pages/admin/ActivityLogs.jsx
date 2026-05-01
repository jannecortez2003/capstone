import React, { useState, useEffect } from 'react';
import { FaHistory, FaCalendarAlt, FaMoneyBillWave, FaUser } from 'react-icons/fa';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_activity_logs`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setLogs(data.logs);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching logs", err);
        setLoading(false);
      });
  }, []);

  const getLogIcon = (type) => {
    if (type === 'Booking') return <FaCalendarAlt className="text-blue-500" />;
    if (type === 'Payment') return <FaMoneyBillWave className="text-green-500" />;
    return <FaUser className="text-purple-500" />;
  };

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">System Activity Logs</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Real-time timeline of bookings, payments, and registrations.</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">Loading timeline...</div>
        ) : logs.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">No recent activity.</div>
        ) : (
            <div className="space-y-6">
                {logs.map((log, idx) => (
                    <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full shadow-sm z-10 transition-colors duration-300">
                                {getLogIcon(log.type)}
                            </div>
                            {idx !== logs.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2 transition-colors duration-300"></div>}
                        </div>
                        <div className="pt-2 pb-6">
                            <p className="font-bold text-gray-800 dark:text-white transition-colors duration-300">{log.type} Event</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">{log.description}</p>
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-2 block transition-colors duration-300">
                                {new Date(log.date).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
export default ActivityLogs;