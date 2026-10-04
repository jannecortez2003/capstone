import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarCheck, 
  FaUsers, 
  FaExclamationTriangle, 
  FaGlassCheers, 
  FaMoneyBillWave,
  FaCheckDouble,
  FaClock
} from 'react-icons/fa';

const Reports = () => {
  const [reportData, setReportData] = useState({
    summary: { 
      revenue: 0, 
      total_events: 0, 
      total_guests_served: 0, 
      completed_events: 0, 
      upcoming_events: 0, 
      pending_events: 0 
    },
    eventsByType: [],
    inventoryAlerts: [],
    recentCateringOrders: []
  });
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${apiUrl}/admin_fetch_reports`);
      if (response.data.success) {
        setReportData({
          summary: response.data.summary,
          eventsByType: response.data.eventsByType || [],
          inventoryAlerts: response.data.inventoryAlerts || [],
          recentCateringOrders: response.data.recentCateringOrders || []
        });
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoading(false);
    }
  };

  const formatSafeDate = (start, end) => {
    if (!start) return "N/A";
    const sDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (end && end !== start) {
      const eDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${sDate} - ${eDate}`;
    }
    return sDate;
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-pink-600 font-bold animate-pulse">
        Generating Report...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto transition-colors duration-300">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Real-time summary of event logistics, guest volume, and inventory health.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Total Bookings</p>
              <h3 className="text-3xl font-black text-gray-800 dark:text-white mt-1">
                {reportData.summary.total_events}
              </h3>
            </div>
            <div className="bg-pink-50 dark:bg-gray-700 p-3 rounded-full text-pink-600 dark:text-pink-400">
              <FaCalendarCheck size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">All recorded reservations</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Total Guests Catered</p>
              <h3 className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {Number(reportData.summary.total_guests_served).toLocaleString()} Pax
              </h3>
            </div>
            <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-full text-purple-600 dark:text-purple-400">
              <FaUsers size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Cumulative guest headcount</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Total Revenue Collected</p>
              <h3 className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">
                ₱{Number(reportData.summary.revenue).toLocaleString()}
              </h3>
            </div>
            <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-full text-green-600 dark:text-green-400">
              <FaMoneyBillWave size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Total confirmed payments</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Completed Event</p>
              <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {reportData.summary.completed_events}
              </h3>
            </div>
            <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400">
              <FaCheckDouble size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            {reportData.summary.upcoming_events} upcoming events
          </p>
        </div>
      </div>

      {/* Operational Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Events by Occasion */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaGlassCheers className="text-pink-500" /> Event Distribution by Occasion
          </h2>
          <div className="space-y-4">
            {reportData.eventsByType.length > 0 ? (
              reportData.eventsByType.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-white capitalize">{item.event_type}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">
                      {item.total_guests} total guests
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 rounded-full text-xs font-bold">
                    {item.count} {item.count === 1 ? 'event' : 'events'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">No event category records found.</p>
            )}
          </div>
        </div>

        {/* Low Inventory & Equipment Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <FaExclamationTriangle /> Critical Equipment Stock (&le; 20 units)
          </h2>
          <div className="space-y-3">
            {reportData.inventoryAlerts.length > 0 ? (
              reportData.inventoryAlerts.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                    {item.quantity} {item.unit} remaining
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400 font-bold p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                All catering utensils and warehouse equipment are sufficiently stocked.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Catering Event Schedule Log */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaClock className="text-gray-500" /> Recent Event Logistics
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Occasion</th>
                <th className="p-4">Event Date</th>
                <th className="p-4">Pax Capacity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {reportData.recentCateringOrders.length > 0 ? (
                reportData.recentCateringOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 font-bold text-gray-800 dark:text-white">
                      {order.client_name || 'Client'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {order.event_type}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {formatSafeDate(order.preferred_date, order.end_date)}
                    </td>
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                      {order.guest_count} Pax
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                        order.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-gray-800 dark:text-white">
                      ₱{Number(order.total_cost || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">No event records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;