import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [reportData, setReportData] = useState({
    summary: { revenue: 0, expenses: 0, profit: 0, total_bookings: 0 },
    packages: [],
    lowStock: []
  });

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
          packages: response.data.packages,
          lowStock: response.data.lowStock
        });
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Mommy Rosal Catering - Administrative Report", 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Total Revenue: P${reportData.summary.revenue}`, 14, 25);
    doc.text(`Total Bookings: ${reportData.summary.total_bookings}`, 14, 32);

    doc.autoTable({
      startY: 40,
      head: [['Package Type', 'Booking Count']],
      body: reportData.packages.map(p => [p.package_type, p.count]),
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Low Stock Item', 'Remaining Quantity']],
      body: reportData.lowStock.map(i => [i.name, `${i.quantity} ${i.unit}`]),
    });

    doc.save("Mommy_Rosal_Report.pdf");
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet([reportData.summary]);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    const pkgSheet = XLSX.utils.json_to_sheet(reportData.packages);
    XLSX.utils.book_append_sheet(wb, pkgSheet, "Packages");

    const stockSheet = XLSX.utils.json_to_sheet(reportData.lowStock);
    XLSX.utils.book_append_sheet(wb, stockSheet, "Low Stock");

    XLSX.writeFile(wb, "Mommy_Rosal_Report.xlsx");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-700">Administrative Reports</h2>
        <div className="space-x-3">
          <button onClick={exportPDF} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition">Download PDF</button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">Download Excel</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-pink-500">
          <h3 className="text-gray-500 font-bold">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-800">₱{reportData.summary.revenue}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-pink-500">
          <h3 className="text-gray-500 font-bold">Total Bookings</h3>
          <p className="text-3xl font-bold text-gray-800">{reportData.summary.total_bookings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Package Popularity</h3>
          <ul>
            {reportData.packages.map((pkg, idx) => (
              <li key={idx} className="flex justify-between py-3 border-b">
                <span className="text-gray-600">{pkg.package_type}</span>
                <span className="font-bold text-pink-600">{pkg.count} bookings</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded shadow border-t-4 border-red-500">
          <h3 className="font-bold text-lg mb-4 text-red-600">Low Stock Alerts</h3>
          <ul>
            {reportData.lowStock.map((item, idx) => (
              <li key={idx} className="flex justify-between py-3 border-b text-red-600">
                <span>{item.name}</span>
                <span className="font-bold">{item.quantity} {item.unit} left</span>
              </li>
            ))}
            {reportData.lowStock.length === 0 && <p className="text-green-600 font-bold">All inventory levels are healthy.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;