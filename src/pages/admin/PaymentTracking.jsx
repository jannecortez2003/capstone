import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

const PaymentTracking = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_all_payments`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPayments(data.payments);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching payments", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Payment Tracking</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Monitor all incoming client transactions.</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b dark:border-gray-700 transition-colors duration-300 flex items-center gap-2">
           <FaMoneyBillWave className="text-green-500" />
           <h2 className="font-bold text-gray-700 dark:text-white transition-colors duration-300">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Event</th>
                <th className="p-4 text-left">Method</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">Loading payments...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">No transactions found.</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-green-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(p.transaction_date).toLocaleDateString()}</td>
                    <td className="p-4 font-bold text-gray-800 dark:text-white">{p.customer_name || 'N/A'}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.event_type}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{p.payment_type}</td>
                    <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">₱ {parseFloat(p.amount_paid).toLocaleString()}</td>
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
export default PaymentTracking;