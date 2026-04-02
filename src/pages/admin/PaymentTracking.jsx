import React, { useState, useEffect } from "react";
import { FaMoneyCheckAlt, FaSearch } from "react-icons/fa";
import Modal, { SuccessModal } from '../../components/Modal';

const PaymentTracking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_bookings`);
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_process_payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: selectedBooking.id, amount: paymentAmount, paymentMethod: paymentMethod })
      });
      const data = await res.json();
      if (data.success) {
        setShowPaymentModal(false);
        setPaymentAmount("");
        setShowSuccess(true);
        fetchBookings();
      } else { alert("Payment failed to save."); }
    } catch (err) { console.error(err); }
  };

  const viewHistory = async (booking) => {
    setSelectedBooking(booking);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_payment_history?appointmentId=${booking.id}`);
      const data = await res.json();
      if (data.success) {
        setPaymentHistory(data.history);
        setShowHistoryModal(true);
      }
    } catch (err) { console.error(err); }
  };

  const filteredBookings = bookings.filter(b => b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Payment Tracking</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Manage client balances and record payments.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b dark:border-gray-700 flex items-center transition-colors duration-300">
            <div className="relative w-full max-w-md">
                <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search customer name..." 
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white pl-10 p-2 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-colors duration-300 placeholder-gray-400"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
              <tr>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Event Info</th>
                <th className="p-4 text-right">Total Cost</th>
                <th className="p-4 text-right">Paid</th>
                <th className="p-4 text-right">Balance</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="p-4 font-bold text-gray-800 dark:text-white transition-colors duration-300">{b.customer_name}</td>
                  <td className="p-4">
                    <div className="text-gray-800 dark:text-gray-200 font-medium transition-colors duration-300">{b.event_type}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{b.preferred_date}</div>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">₱{parseFloat(b.total_cost || 0).toLocaleString()}</td>
                  <td className="p-4 text-right text-green-600 dark:text-green-400 font-bold transition-colors duration-300">₱{parseFloat(b.amount_paid || 0).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={`font-bold ${b.balance <= 0 ? 'text-gray-400 dark:text-gray-500' : 'text-red-500 dark:text-red-400'} transition-colors duration-300`}>
                        ₱{Math.max(0, parseFloat(b.balance || 0)).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                        onClick={() => viewHistory(b)} 
                        className="bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-3 py-1 rounded text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
                    >
                        HISTORY
                    </button>
                    {b.balance > 0 && (
                        <button 
                            onClick={() => { setSelectedBooking(b); setPaymentAmount(b.balance); setShowPaymentModal(true); }} 
                            className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition-colors duration-300"
                        >
                            PAY
                        </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">No active bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Entry Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Process Payment">
        <form onSubmit={handleProcessPayment} className="p-2 text-gray-800 dark:text-gray-200">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-4 text-sm transition-colors duration-300">
                <p><strong>Customer:</strong> {selectedBooking?.customer_name}</p>
                <p className="text-red-600 dark:text-red-400 font-bold mt-1 transition-colors duration-300">Current Balance: ₱{parseFloat(selectedBooking?.balance || 0).toLocaleString()}</p>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">Amount to Pay (₱)</label>
                    <input 
                        type="number" step="0.01" max={selectedBooking?.balance}
                        className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors duration-300" 
                        value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required 
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Payment Method</label>
                    <select 
                        className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors duration-300"
                        value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required
                    >
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-6">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2 font-bold"><FaMoneyCheckAlt /> Save Payment</button>
            </div>
        </form>
      </Modal>

      {/* Payment History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} title={`History: ${selectedBooking?.customer_name}`}>
        <div className="p-2 text-gray-800 dark:text-gray-200">
            {paymentHistory.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-6 italic transition-colors duration-300">No payments recorded yet.</p>
            ) : (
                <div className="space-y-3">
                    {paymentHistory.map(ph => (
                        <div key={ph.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded border dark:border-gray-600 transition-colors duration-300">
                            <div>
                                <div className="font-bold text-green-600 dark:text-green-400 transition-colors duration-300">₱{parseFloat(ph.amount_paid).toLocaleString()}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">{new Date(ph.payment_date).toLocaleString()}</div>
                            </div>
                            <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-bold transition-colors duration-300">{ph.payment_method}</span>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={() => setShowHistoryModal(false)} className="w-full mt-6 bg-gray-800 dark:bg-gray-700 text-white py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300">Close</button>
        </div>
      </Modal>

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message="Payment recorded successfully!" />
    </div>
  );
};

export default PaymentTracking;