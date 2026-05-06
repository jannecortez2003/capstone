import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaPlus, FaFileInvoiceDollar, FaHistory, FaWallet, FaCheckCircle, FaTimes } from 'react-icons/fa';

const PaymentTracking = () => {
    const [payments, setPayments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('balances'); // 'balances' or 'transactions'
    
    // Modals State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [historyModalBooking, setHistoryModalBooking] = useState(null); // Holds booking data to view history
    
    // Form State
    const [formData, setFormData] = useState({
        appointmentId: '',
        amount: '',
        paymentType: 'Cash',
        remarks: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchData = async () => {
        try {
            const [payRes, bookRes] = await Promise.all([
                fetch(`${apiUrl}/admin_fetch_all_payments`),
                fetch(`${apiUrl}/admin_fetch_bookings`)
            ]);
            const payData = await payRes.json();
            const bookData = await bookRes.json();

            if (payData.success) setPayments(payData.payments);
            if (bookData.success) setBookings(bookData.bookings);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiUrl}/admin_process_payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsPaymentModalOpen(false);
                setFormData({ appointmentId: '', amount: '', paymentType: 'Cash', remarks: '' });
                fetchData(); // Refresh table
            } else {
                alert(data.message || 'Failed to process payment');
            }
        } catch (error) {
            alert('Server error processing payment');
        }
    };

    const openPaymentModal = (bookingId = '') => {
        setFormData({ ...formData, appointmentId: bookingId });
        setIsPaymentModalOpen(true);
    };

    // Filtered Data
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
    const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const totalOutstanding = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.balance), 0);

    // Get specific payments for the history modal
    const getBookingPayments = (bookingId) => {
        return payments.filter(p => p.appointment_id === bookingId);
    };

    if (loading) return <div className="p-6 text-pink-600 font-bold animate-pulse">Loading financial records...</div>;

    return (
        <div className="p-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Financial Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track client balances, downpayments, and full transactions.</p>
                </div>
                <button 
                    onClick={() => openPaymentModal()}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md"
                >
                    <FaPlus /> Record New Payment
                </button>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-5 border-l-4 border-green-500 transition-colors duration-300">
                    <div className="bg-green-100 dark:bg-gray-700 p-4 rounded-full">
                        <FaMoneyBillWave className="text-green-600 text-3xl" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Collected</div>
                        <div className="text-3xl font-black text-gray-800 dark:text-white">₱{totalCollected.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-5 border-l-4 border-yellow-500 transition-colors duration-300">
                    <div className="bg-yellow-100 dark:bg-gray-700 p-4 rounded-full">
                        <FaWallet className="text-yellow-600 text-3xl" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Outstanding Balances</div>
                        <div className="text-3xl font-black text-gray-800 dark:text-white">₱{totalOutstanding.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700 transition-colors duration-300">
                <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 pt-4 gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('balances')}
                        className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'balances'
                                ? 'bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 border-t border-l border-r border-gray-200 dark:border-gray-700'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <FaWallet /> Client Balances
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                            activeTab === 'transactions'
                                ? 'bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 border-t border-l border-r border-gray-200 dark:border-gray-700'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <FaHistory /> All Transactions
                    </button>
                </div>

                {/* --- TAB CONTENT: CLIENT BALANCES --- */}
                {activeTab === 'balances' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b dark:border-gray-700">
                                <tr>
                                    <th className="p-4">Client Info</th>
                                    <th className="p-4">Event Details</th>
                                    <th className="p-4">Total Cost</th>
                                    <th className="p-4">Amount Paid</th>
                                    <th className="p-4">Remaining Balance</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {confirmedBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800 dark:text-white">{booking.customer_name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{booking.customer_email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{booking.event_type}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(booking.preferred_date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4 font-bold text-gray-700 dark:text-gray-300">₱{parseFloat(booking.total_cost).toLocaleString()}</td>
                                        <td className="p-4 font-bold text-green-600 dark:text-green-400">₱{parseFloat(booking.amount_paid).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                booking.balance <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                ₱{parseFloat(booking.balance).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            {booking.balance > 0 && (
                                                <button 
                                                    onClick={() => openPaymentModal(booking.id)}
                                                    className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded font-bold text-xs transition"
                                                >
                                                    Pay
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => setHistoryModalBooking(booking)}
                                                className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded font-bold text-xs transition"
                                            >
                                                History
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {confirmedBookings.length === 0 && (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No active client balances found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB CONTENT: ALL TRANSACTIONS --- */}
                {activeTab === 'transactions' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b dark:border-gray-700">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Method</th>
                                    <th className="p-4">Remarks</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {payments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                            {new Date(payment.transaction_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800 dark:text-white">{payment.customer_name}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold">
                                                {payment.payment_type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{payment.remarks || '-'}</td>
                                        <td className="p-4 text-right font-black text-green-600 dark:text-green-400">
                                            + ₱{parseFloat(payment.amount_paid).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No transactions recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* =========================================
                MODAL 1: ADD NEW PAYMENT
            ========================================= */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaFileInvoiceDollar className="text-pink-500"/> Record Payment
                            </h2>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl transition">&times;</button>
                        </div>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Select Client / Booking</label>
                                <select 
                                    required 
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-colors"
                                    value={formData.appointmentId} 
                                    onChange={e => setFormData({...formData, appointmentId: e.target.value})}
                                >
                                    <option value="">-- Choose Account --</option>
                                    {confirmedBookings.filter(b => b.balance > 0).map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.customer_name} - {b.event_type} (Owes: ₱{b.balance})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (₱)</label>
                                    <input 
                                        type="number" required min="1"
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-colors"
                                        value={formData.amount} 
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Method</label>
                                    <select 
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-colors"
                                        value={formData.paymentType} 
                                        onChange={e => setFormData({...formData, paymentType: e.target.value})}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Bank">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Remarks (Optional)</label>
                                <input 
                                    type="text" placeholder="e.g. Downpayment, Final Balance..."
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-colors"
                                    value={formData.remarks} 
                                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                                />
                            </div>

                            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                                Confirm Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================
                MODAL 2: VIEW SPECIFIC BOOKING HISTORY
            ========================================= */}
            {historyModalBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 dark:text-white">Transaction History</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {historyModalBooking.customer_name} • {historyModalBooking.event_type}
                                </p>
                            </div>
                            <button onClick={() => setHistoryModalBooking(null)} className="text-gray-400 hover:text-red-500 text-xl transition"><FaTimes /></button>
                        </div>

                        {/* Body - Payment List */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {getBookingPayments(historyModalBooking.id).length > 0 ? (
                                <div className="space-y-4">
                                    {getBookingPayments(historyModalBooking.id).map((txn, index) => (
                                        <div key={txn.id} className="flex justify-between items-center p-4 border dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-white">₱{parseFloat(txn.amount_paid).toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(txn.transaction_date).toLocaleDateString()} • {txn.payment_type}</p>
                                                    {txn.remarks && <p className="text-xs text-gray-400 italic mt-0.5">"{txn.remarks}"</p>}
                                                </div>
                                            </div>
                                            <FaCheckCircle className="text-green-500 text-xl" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-8 italic">No payments have been made for this booking yet.</div>
                            )}
                        </div>

                        {/* Footer Summary */}
                        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <span>Total Event Cost:</span>
                                <span className="font-bold text-gray-800 dark:text-white">₱{parseFloat(historyModalBooking.total_cost).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4 border-b dark:border-gray-700 pb-4">
                                <span>Total Paid:</span>
                                <span className="font-bold text-green-600 dark:text-green-400">₱{parseFloat(historyModalBooking.amount_paid).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black">
                                <span className="text-gray-800 dark:text-white">Remaining Balance:</span>
                                <span className={historyModalBooking.balance > 0 ? "text-red-500" : "text-green-500"}>
                                    ₱{parseFloat(historyModalBooking.balance).toLocaleString()}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default PaymentTracking;