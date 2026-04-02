import React, { useState, useEffect } from "react";
import { FaChartLine, FaMoneyBillWave, FaCalendarCheck, FaBoxOpen } from "react-icons/fa";

const Reports = () => {
  const [reportData, setReportData] = useState({
      summary: { revenue: 0, expenses: 0, profit: 0, total_bookings: 0 },
      packages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_reports`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
            setReportData({ summary: data.summary, packages: data.packages || [] });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reports", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-10 text-gray-600 dark:text-gray-300 transition-colors duration-300">Loading reports...</div>;

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Financial Reports</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Business performance and financial summaries.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-green-400 transition-colors duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Total Revenue</p>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white mt-1 transition-colors duration-300">₱{parseFloat(reportData.summary.revenue || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaMoneyBillWave className="text-green-500 text-xl" /></div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-red-400 transition-colors duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Est. Expenses (40%)</p>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white mt-1 transition-colors duration-300">₱{parseFloat(reportData.summary.expenses || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-red-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaChartLine className="text-red-500 text-xl" /></div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-400 transition-colors duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Net Profit</p>
                    <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-300">₱{parseFloat(reportData.summary.profit || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaChartLine className="text-blue-500 text-xl" /></div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-purple-400 transition-colors duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">Total Bookings</p>
                    <h3 className="text-2xl font-black text-gray-800 dark:text-white mt-1 transition-colors duration-300">{reportData.summary.total_bookings}</h3>
                </div>
                <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaCalendarCheck className="text-purple-500 text-xl" /></div>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-8 transition-colors duration-300">
        <div className="p-4 border-b dark:border-gray-700 flex items-center gap-2 transition-colors duration-300">
            <FaBoxOpen className="text-pink-500" />
            <h2 className="font-bold text-gray-700 dark:text-white transition-colors duration-300">Package Popularity</h2>
        </div>
        <div className="p-6">
            <div className="space-y-4">
                {reportData.packages && reportData.packages.length > 0 ? reportData.packages.map((pkg, idx) => {
                    const percentage = Math.round((pkg.count / reportData.summary.total_bookings) * 100) || 0;
                    return (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-gray-700 dark:text-gray-200 transition-colors duration-300">{pkg.package_type}</span>
                                <span className="text-gray-500 dark:text-gray-400 transition-colors duration-300">{pkg.count} bookings ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 transition-colors duration-300">
                                <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic transition-colors duration-300">No package data available yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;