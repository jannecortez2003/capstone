// src/pages/admin/PaymentTracking.jsx
import React, { useState, useEffect } from "react";
import { FaMoneyCheckAlt, FaHistory, FaPlusCircle, FaMoneyBillWave, FaHandHoldingUsd, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import Modal from '../../components/Modal';

const PaymentTracking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("Downpayment");
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Stats State
  const [stats, setStats] = useState({
    totalExpected: 0,
    totalCollected: 0,
    totalBalance: 0,
    fullyPaidCount: 0
  });

  const fetchPaymentData = async () => {
    try {
      const res = await fetch("http://localhost/admin_fetch_bookings.php");
      const data = await res.json();
      if (data.success) {
        
        // FIX: Filter bookings to ONLY include Confirmed and Completed
        const activeBookings = data.bookings.filter(
            (b) => b.status === 'Confirmed' || b.status === 'Completed'
        );

        // Sanitize numbers based on the filtered list
        const sanitized = activeBookings.map(b => ({
            ...b,
            total_cost: parseFloat(b.total_cost || 0),
            amount_paid: parseFloat(b.amount_paid || 0),
            balance: parseFloat(b.balance || 0)
        }));
        
        setBookings(sanitized);

        // Calculate Totals for the Cards based on the filtered list
        const totalExpected = sanitized.reduce((acc, curr) => acc + curr.total_cost, 0);
        const totalCollected = sanitized.reduce((acc, curr) => acc + curr.amount_paid, 0);
        const totalBalance = sanitized.reduce((acc, curr) => acc + curr.balance, 0);
        const fullyPaidCount = sanitized.filter(b => b.balance <= 0).length;

        setStats({ totalExpected, totalCollected, totalBalance, fullyPaidCount });
      }
    } catch (err) { 
        console.error("Fetch Error:", err); 
    } finally { 
        setLoading(false); 
    }
  };

  const fetchHistory = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost/admin_fetch_payment_history.php?appointmentId=${bookingId}`);
      const data = await res.json();
      if (data.success) setPaymentHistory(data.history);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPaymentData(); }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    // Basic client-side validation
    if (parseFloat(paymentAmount) > selectedBooking.balance) {
      alert(`Error: Payment exceeds balance (₱${selectedBooking.balance.toLocaleString()}).`);
      return;
    }

    try {
      const res = await fetch("http://localhost/admin_process_payment.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedBooking.id,
          amount: paymentAmount,
          paymentType: paymentType,
          remarks: `Manual entry by Admin`
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setPaymentAmount("");
        fetchPaymentData(); // Refresh data/stats
      } else {
        alert("Payment failed: " + data.message);
      }
    } catch (err) { console.error(err); }
  };

  // Card Configuration (Matches Dashboard.jsx style)
  const statCards = [
    {
      label: "Total Revenue (Expected)",
      value: `₱${stats.totalExpected.toLocaleString()}`,
      icon: <FaMoneyBillWave className="text-blue-500 text-3xl" />,
      note: "Gross value of all bookings",
      noteColor: "text-blue-600",
      borderColor: "border-blue-300"
    },
    {
      label: "Total Collected",
      value: `₱${stats.totalCollected.toLocaleString()}`,
      icon: <FaHandHoldingUsd className="text-green-500 text-3xl" />,
      note: "Cash in hand",
      noteColor: "text-green-600",
      borderColor: "border-green-300"
    },
    {
      label: "Outstanding Balance",
      value: `₱${stats.totalBalance.toLocaleString()}`,
      icon: <FaExclamationCircle className="text-red-500 text-3xl" />,
      note: "Pending collections",
      noteColor: "text-red-600",
      borderColor: "border-red-300"
    },
    {
      label: "Fully Paid Accounts",
      value: stats.fullyPaidCount,
      icon: <FaCheckCircle className="text-pink-500 text-3xl" />,
      note: "Completed payments",
      noteColor: "text-pink-600",
      borderColor: "border-pink-300"
    },
  ];

  if (loading) return <div className="p-6 text-center text-gray-500">Loading payment data...</div>;

  return (
    <div className="p-6 fade-in">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Payment Tracking</h1>
      <p className="text-gray-500 mb-8">Monitor cash flow and manage client balances.</p>

      {/* Stats Grid - Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-sm hover:shadow-md p-6 flex items-center gap-4 transition border-l-4 ${stat.borderColor}`}>
            <div className={`p-3 rounded-full ${stat.borderColor.replace('border-', 'bg-').replace('300', '50')}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              <div className={`text-xs mt-1 ${stat.noteColor}`}>{stat.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Section - Dashboard Style */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <FaMoneyCheckAlt className="text-pink-500" /> Account List
            </h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-xs">
                <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Event Info</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Balance</th>
                <th className="p-4 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {bookings.length > 0 ? bookings.map((b) => (
                <tr key={b.id} className="border-b hover:bg-pink-50 transition last:border-0">
                    <td className="p-4 font-medium text-gray-800">
                        {b.customer_name}
                        <div className="text-xs text-gray-400">ID: {b.user_id}</div>
                    </td>
                    <td className="p-4">
                        <span className="capitalize">{b.event_type}</span>
                        <div className="text-xs text-gray-500">{new Date(b.preferred_date).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-semibold">₱{b.total_cost.toLocaleString()}</td>
                    <td className="p-4 text-green-600 font-semibold">₱{b.amount_paid.toLocaleString()}</td>
                    <td className="p-4">
                        <span className={`font-bold ${b.balance > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            ₱{b.balance.toLocaleString()}
                        </span>
                    </td>
                    <td className="p-4">
                    <div className="flex justify-center gap-2">
                        <button 
                        onClick={() => { setSelectedBooking(b); setShowModal(true); }}
                        disabled={b.balance <= 0}
                        className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition ${
                            b.balance > 0 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        >
                        <FaPlusCircle /> Pay
                        </button>
                        <button 
                        onClick={() => { setSelectedBooking(b); fetchHistory(b.id); setShowHistoryModal(true); }}
                        className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition text-xs font-bold"
                        >
                        <FaHistory /> History
                        </button>
                    </div>
                    </td>
                </tr>
                )) : (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No confirmed or completed bookings found.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedBooking(null); }} title="Record Manual Payment">
        {selectedBooking && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4 p-2">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Client: <strong className="text-gray-800">{selectedBooking.customer_name}</strong></p>
              <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">Current Balance:</span>
                  <span className="text-xl font-bold text-red-600">₱{selectedBooking.balance.toLocaleString()}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount to Pay (₱)</label>
              <input 
                type="number" 
                max={selectedBooking.balance}
                className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-pink-500 text-gray-800"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
            
            <div>
               <label className="block text-sm font-medium mb-1 text-gray-700">Payment Type</label>
               <select 
                 className="w-full border rounded p-2 text-gray-800 focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                 value={paymentType}
                 onChange={(e) => setPaymentType(e.target.value)}
               >
                 <option value="Downpayment">Downpayment</option>
                 <option value="Full Payment">Full Payment</option>
                 <option value="Additional Payment">Additional Payment</option>
               </select>
            </div>
            
            <div className="pt-2">
                <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded-lg font-bold hover:bg-pink-700 transition shadow-md flex justify-center items-center gap-2">
                    <FaCheckCircle /> Confirm Payment
                </button>
            </div>
          </form>
        )}
      </Modal>

      {/* History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => { setShowHistoryModal(false); setSelectedBooking(null); }} title="Transaction History">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 sticky top-0 text-gray-600 font-semibold">
              <tr>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Type</th>
                <th className="p-3 border-b text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length > 0 ? paymentHistory.map((h, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{new Date(h.transaction_date).toLocaleDateString()}</td>
                  <td className="p-3 text-gray-800 font-medium">{h.payment_type}</td>
                  <td className="p-3 text-right font-bold text-green-600">+₱{parseFloat(h.amount_paid || 0).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">No transactions recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentTracking;