import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
   FaCalendarCheck, FaUsers, FaExclamationTriangle, FaGlassCheers, 
   FaMoneyBillWave, FaCheckDouble, FaClock, FaPrint, FaBox, FaChartPie 
} from 'react-icons/fa';

const Reports = () => {
  const [reportData, setReportData] = useState({
    summary: { 
       revenue: 0, total_events: 0, total_guests_served: 0, completed_events: 0, 
       upcoming_events: 0, pending_events: 0, total_inventory_types: 0, total_physical_stock: 0 
     },
    eventsByType: [],
    inventoryAlerts: [],
    recentCateringOrders: [],
    recentPayments: []
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
          recentCateringOrders: response.data.recentCateringOrders || [],
          recentPayments: response.data.recentPayments || []
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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-6 text-center text-pink-600 font-bold animate-pulse">Compiling System Report...</div>;
  }

  const maxEvents = Math.max(...reportData.eventsByType.map(e => e.count), 1);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto transition-colors duration-300 print:p-0 print:m-0">
      
      {/* Report Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white print:text-black">Executive Report</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 print:text-gray-700">
            Comprehensive analytics on Bookings, Financials, and Inventory Health.
          </p>
          <p className="text-xs text-pink-600 font-bold mt-2 hidden print:block">
            Generated on: {new Date().toLocaleString()}
          </p>
        </div>
        <button 
            onClick={handlePrint}
            className="bg-gray-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition shadow-md print:hidden font-bold"
        >
            <FaPrint /> Export to PDF / Print
        </button>
      </div>

      {/* 1. EXECUTIVE SUMMARY (KPIs) */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700 print:text-black">1. Executive Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 print:grid-cols-4 print:gap-2">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-green-500 print:border print:shadow-none">
          <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Total Revenue</p>
          <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
             ₱{Number(reportData.summary.revenue).toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 mt-2">Gross income collected</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-pink-500 print:border print:shadow-none">
          <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Total Bookings</p>
          <h3 className="text-2xl font-black text-gray-800 dark:text-white mt-1">
            {reportData.summary.total_events}
          </h3>
          <p className="text-xs text-gray-500 mt-2">Lifetime events recorded</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-purple-500 print:border print:shadow-none">
          <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Guests Catered</p>
          <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {Number(reportData.summary.total_guests_served).toLocaleString()} Pax
          </h3>
          <p className="text-xs text-gray-500 mt-2">Total volume of attendees</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-blue-500 print:border print:shadow-none">
          <p className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400">Active Inventory</p>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {Number(reportData.summary.total_physical_stock).toLocaleString()}
          </h3>
          <p className="text-xs text-gray-500 mt-2">Across {reportData.summary.total_inventory_types} item categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 print:block print:space-y-8">
        
        {/* 2. BOOKING ANALYTICS */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 print:shadow-none print:break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 print:text-black">
            <FaChartPie className="text-pink-500" /> Event Distribution by Occasion
          </h2>
          <div className="space-y-4">
            {reportData.eventsByType.length > 0 ? (
              reportData.eventsByType.map((item, idx) => {
                const percentage = Math.round((item.count / maxEvents) * 100);
                return (
                  <div key={idx} className="relative pt-1">
                    <div className="flex mb-1 items-center justify-between">
                      <div>
                        <span className="text-sm font-bold inline-block text-gray-800 dark:text-white capitalize">
                          {item.event_type}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold inline-block text-pink-600">
                          {item.count} Events <span className="text-gray-400 text-xs font-normal">({item.total_guests} Guests)</span>
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-pink-100 dark:bg-gray-700">
                      <div style={{ width: `${percentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500"></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">No event category records found.</p>
            )}
          </div>
        </div>

        {/* 3. INVENTORY HEALTH REPORT */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border dark:border-gray-700 print:shadow-none print:break-inside-avoid">
          <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <FaExclamationTriangle /> Critical Inventory Alert (&le; 20 units)
          </h2>
          <div className="space-y-3">
            {reportData.inventoryAlerts.length > 0 ? (
              reportData.inventoryAlerts.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/20 rounded-lg print:border-red-400">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 print:text-black">{item.name}</span>
                  <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                    {item.quantity} {item.unit} remaining
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400 font-bold p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg text-center print:border-green-400">
                Healthy Stock: All catering utensils and equipment are sufficiently stocked.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL & RECENT BOOKINGS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden print:shadow-none print:border-none print:break-inside-avoid mb-8">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 print:bg-white print:border-b-2 print:border-black">
          <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 print:text-black">
            <FaMoneyBillWave className="text-green-500" /> Recent Payments Received
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm print:text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs print:bg-white print:text-black">
              <tr>
                <th className="p-4 border-b print:border-black">Date</th>
                <th className="p-4 border-b print:border-black">Client</th>
                <th className="p-4 border-b print:border-black">Method</th>
                <th className="p-4 border-b print:border-black text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-300">
              {reportData.recentPayments.length > 0 ? (
                reportData.recentPayments.map((payment, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 text-gray-600 dark:text-gray-300 print:text-black">
                      {new Date(payment.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-gray-800 dark:text-white print:text-black">
                      {payment.client_name || 'Client'}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 print:text-black">
                      {payment.payment_type}
                    </td>
                    <td className="p-4 text-right font-black text-green-600 dark:text-green-400 print:text-black">
                       + ₱{Number(payment.amount_paid || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-6 text-center text-gray-400">No recent payments.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden print:shadow-none print:border-none print:break-inside-avoid">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 print:bg-white print:border-b-2 print:border-black">
          <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 print:text-black">
            <FaClock className="text-gray-500" /> Recent Booking Logistics
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm print:text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs print:bg-white print:text-black">
              <tr>
                <th className="p-4 border-b print:border-black">Client</th>
                <th className="p-4 border-b print:border-black">Occasion</th>
                <th className="p-4 border-b print:border-black">Event Date</th>
                <th className="p-4 border-b print:border-black">Pax</th>
                <th className="p-4 border-b print:border-black text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-300">
              {reportData.recentCateringOrders.length > 0 ? (
                reportData.recentCateringOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4 font-bold text-gray-800 dark:text-white print:text-black">
                      {order.client_name || 'Client'}
                      <div className={`text-[10px] uppercase font-bold mt-1 print:hidden ${
                        order.status === 'Confirmed' ? 'text-green-500' : 
                        order.status === 'Completed' ? 'text-blue-500' : 'text-yellow-500'
                      }`}>{order.status}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 print:text-black">
                      {order.event_type}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300 print:text-black">
                      {formatSafeDate(order.preferred_date, order.end_date)}
                    </td>
                    <td className="p-4 font-bold text-gray-700 dark:text-gray-300 print:text-black">
                      {order.guest_count}
                    </td>
                    <td className="p-4 text-right font-black text-gray-800 dark:text-white print:text-black">
                       ₱{Number(order.total_cost || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-400">No event records available.</td>
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