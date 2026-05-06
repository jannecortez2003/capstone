import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaPlus, FaSearch, FaFileInvoiceDollar } from 'react-icons/fa';

const PaymentTracking = () => {
    const [payments, setPayments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
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
                setIsModalOpen(false);
                setFormData({ appointmentId: '', amount: '', paymentType: 'Cash', remarks: '' });
                fetchData(); // Refresh table
            } else {
                alert(data.message || 'Failed to process payment');
            }
        } catch (error) {
            alert('Server error processing payment');
        }
    };

    // 🔥 FIX: Only show 'Confirmed' bookings in the dropdown
    const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
    
    const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

    if (loading) return <div className="p-6 text-gray-500 animate-pulse">Loading payments...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payment Tracking</h1>
                    <p className="text-gray-500 mt-1">Manage and record client transactions.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md"
                >
                    <FaPlus /> Add Payment
                </button>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-5 border-l-4 border-green-500 mb-8 w-full md:w-1/3">
                <div className="bg-green-100 dark:bg-gray-700 p-4 rounded-full">
                    <FaMoneyBillWave className="text-green-600 text-3xl" />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Collected</div>
                    <div className="text-3xl font-black text-gray-800 dark:text-white">₱{totalCollected.toLocaleString()}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b dark:border-gray-700">
                            <tr>
                                <th className="p-4">Txn ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Event Type</th>
                                <th className="p-4">Method</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-mono text-xs text-gray-500">#{payment.id}</td>
                                    <td className="p-4 text-sm text-gray-800 dark:text-gray-200">
                                        {new Date(payment.transaction_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm font-bold text-gray-800 dark:text-white">{payment.customer_name}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{payment.event_type || 'N/A'}</td>
                                    <td className="p-4">
                                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full text-xs font-bold">
                                            {payment.payment_type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-green-600 dark:text-green-400">
                                        +₱{parseFloat(payment.amount_paid).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">{payment.remarks || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaFileInvoiceDollar className="text-blue-500"/> Record Payment
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleAddPayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Select Confirmed Booking</label>
                                <select 
                                    required 
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.appointmentId} 
                                    onChange={e => setFormData({...formData, appointmentId: e.target.value})}
                                >
                                    <option value="">-- Select a booking --</option>
                                    {confirmedBookings.map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.customer_name} - {b.event_type} (Balance: ₱{b.balance})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (₱)</label>
                                    <input 
                                        type="number" required min="1"
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.amount} 
                                        onChange={e => setFormData({...formData, amount: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                                    <select 
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.paymentType} 
                                        onChange={e => setFormData({...formData, paymentType: e.target.value})}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Remarks (Optional)</label>
                                <input 
                                    type="text" placeholder="e.g. Downpayment, Final Balance"
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.remarks} 
                                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                                />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                                Confirm & Save Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentTracking;