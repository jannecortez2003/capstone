import React, { useState, useEffect } from "react";
import { FaArrowUp, FaMoneyBillWave, FaChartBar, FaCalendarCheck } from "react-icons/fa";

const Reports = () => {
  const [reportData, setReportData] = useState({
    summary: { revenue: 0, expenses: 0, profit: 0, total_bookings: 0 },
    packages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_reports`);
        const data = await res.json();
        if (data.success) {
          setReportData(data);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading reports...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Business Intelligence</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">₱{reportData.summary.revenue.toLocaleString()}</h2>
            <FaMoneyBillWave className="text-green-200 text-4xl" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">{reportData.summary.total_bookings}</h2>
            <FaCalendarCheck className="text-blue-200 text-4xl" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-pink-500">
          <p className="text-gray-500 text-sm">Estimated Profit</p>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">₱{reportData.summary.profit.toLocaleString()}</h2>
            <FaArrowUp className="text-pink-500 text-2xl" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-bold mb-4 flex items-center gap-2"><FaChartBar /> Package Performance</h3>
        <div className="space-y-6">
          {reportData.packages.length > 0 ? reportData.packages.map((pkg, index) => {
            const percentage = ((pkg.count / reportData.summary.total_bookings) * 100).toFixed(1);
            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{pkg.package_type}</span>
                  <span className="font-bold">{percentage}% ({pkg.count} bookings)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          }) : (
            <p className="text-gray-500 text-center py-4">No booking data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;