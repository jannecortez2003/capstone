import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaCheckCircle, FaListAlt, FaBoxOpen } from "react-icons/fa";
import Modal, { SuccessModal } from '../../components/Modal';

const BookingRequests = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [actionDetails, setActionDetails] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // --- NEW: RECONCILIATION STATE ---
    const [showReconcileModal, setShowReconcileModal] = useState(false);
    const [reconcileBooking, setReconcileBooking] = useState(null);
    const [damagedItems, setDamagedItems] = useState({});

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_fetch_bookings`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    // Standard Status Update (Approve / Reject)
    const handleStatusUpdate = async () => {
        if (!actionDetails) return;
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_update_booking_status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: actionDetails.id, status: actionDetails.newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchBookings();
                setShowStatusModal(false);
                setSuccessMessage(data.message);
                setShowSuccessModal(true);
            }
        } catch (err) { alert("Update failed"); }
        finally { setLoading(false); }
    };

    // --- NEW: RECONCILIATION SUBMIT LOGIC ---
    const handleReconciliationSubmit = async () => {
        if (!reconcileBooking) return;
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_reconcile_booking`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    bookingId: reconcileBooking.id, 
                    damagedItems: damagedItems 
                }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchBookings();
                setShowReconcileModal(false);
                setReconcileBooking(null);
                setDamagedItems({});
                setSuccessMessage(data.message);
                setShowSuccessModal(true);
            }
        } catch (err) { alert("Reconciliation failed"); }
        finally { setLoading(false); }
    };

    const handleDamagedInputChange = (itemName, value) => {
        setDamagedItems(prev => ({
            ...prev,
            [itemName]: value
        }));
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400';
            case 'Completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400';
            case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400';
        }
    };

    return (
        <div className="p-6 transition-colors duration-300">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Booking Requests</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Manage client appointments and statuses.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-300 transition-colors duration-300">
                    <div className="bg-yellow-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaListAlt className="text-yellow-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{bookings.filter(b => b.status === 'Pending').length}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Pending Requests</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-green-300 transition-colors duration-300">
                    <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaCheckCircle className="text-green-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{bookings.filter(b => b.status === 'Confirmed').length}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Confirmed Events</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-blue-300 transition-colors duration-300">
                    <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaCalendarAlt className="text-blue-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{bookings.filter(b => b.status === 'Completed').length}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Completed Events</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                <div className="p-4 border-b dark:border-gray-700 transition-colors duration-300">
                    <h2 className="font-bold text-gray-700 dark:text-white transition-colors duration-300">All Bookings</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
                            <tr>
                                <th className="p-4 text-left">Customer</th>
                                <th className="p-4 text-left">Event Date</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {bookings.length > 0 ? bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 dark:text-white transition-colors duration-300">{b.customer_name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{b.customer_email}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{b.preferred_date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeClass(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => setSelectedBooking(b)} className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900 transition">
                                            VIEW
                                        </button>
                                        
                                        {b.status === 'Pending' && (
                                            <>
                                                <button onClick={() => { setActionDetails({id: b.id, newStatus: 'Confirmed', customerName: b.customer_name}); setShowStatusModal(true); }} className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition">
                                                    APPROVE
                                                </button>
                                                <button onClick={() => { setActionDetails({id: b.id, newStatus: 'Cancelled', customerName: b.customer_name}); setShowStatusModal(true); }} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition">
                                                    REJECT
                                                </button>
                                            </>
                                        )}
                                        {/* NEW: TRIGGER RECONCILIATION MODAL INSTEAD OF DIRECT UPDATE */}
                                        {b.status === 'Confirmed' && (
                                            <button 
                                                onClick={() => { 
                                                    setReconcileBooking(b); 
                                                    setDamagedItems({}); // clear old data
                                                    setShowReconcileModal(true); 
                                                }} 
                                                className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 px-3 py-1 rounded text-xs font-bold hover:bg-purple-200 transition"
                                            >
                                                COMPLETE & RECONCILE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="p-10 text-center text-gray-500 dark:text-gray-400 italic">No bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            {selectedBooking && (
                <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm border-b dark:border-gray-700 pb-4 text-gray-800 dark:text-gray-200">
                            <p><strong>Customer:</strong> {selectedBooking.customer_name}</p>
                            <p><strong>Event Type:</strong> {selectedBooking.event_type}</p>
                            <p><strong>Guests:</strong> {selectedBooking.guest_count}</p>
                            <p><strong>Package:</strong> {selectedBooking.package_type}</p>
                            <p className="col-span-2"><strong>Dishes:</strong> {selectedBooking.selected_dishes || 'None selected'}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-700 dark:text-gray-300">Inventory Allocated:</p>
                            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {selectedBooking.required_inventory ? 
                                     selectedBooking.required_inventory.split('; ').map((item, i) => <span key={i}>• {item}</span>)
                                     : <i className="text-gray-400">Standard catering setup</i>
                                }
                            </div>
                        </div>
                        <button onClick={() => setSelectedBooking(null)} className="w-full bg-gray-800 dark:bg-gray-700 text-white py-2 rounded mt-4 hover:bg-gray-700 dark:hover:bg-gray-600 transition">Close</button>
                    </div>
                </Modal>
            )}

            {/* Basic Status Modal */}
            {showStatusModal && (
                <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Confirm Status Change">
                    <div className="p-4 text-center text-gray-800 dark:text-gray-200">
                        <p className="mb-6">Approve booking for <strong>{actionDetails.customerName}</strong>?</p>
                        <p className="text-xs text-orange-500 mb-6 font-bold flex items-center justify-center gap-2">
                            <FaBoxOpen /> Note: This will automatically deduct required inventory from the warehouse.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowStatusModal(false)} className="px-6 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                            <button onClick={handleStatusUpdate} className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition">Yes, Approve</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* NEW: RECONCILIATION MODAL */}
            {showReconcileModal && reconcileBooking && (
                <Modal isOpen={showReconcileModal} onClose={() => setShowReconcileModal(false)} title="Post-Event Reconciliation">
                    <div className="p-2 text-gray-800 dark:text-gray-200">
                        <p className="text-sm mb-4">
                            Please record any damaged or missing inventory for <strong>{reconcileBooking.customer_name}'s</strong> event. 
                            The remaining items will be automatically returned to the warehouse.
                        </p>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto border dark:border-gray-700">
                            {reconcileBooking.required_inventory ? (
                                <div className="space-y-3">
                                    {reconcileBooking.required_inventory.split('; ').map((itemStr, i) => {
                                        const [itemName, allocatedQty] = itemStr.split(': ');
                                        return (
                                            <div key={i} className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                                                <div>
                                                    <p className="font-bold text-sm">{itemName}</p>
                                                    <p className="text-xs text-gray-500">Allocated: {allocatedQty}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs text-red-500 font-bold">Lost/Broken:</label>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max={allocatedQty}
                                                        placeholder="0"
                                                        value={damagedItems[itemName] || ''}
                                                        onChange={(e) => handleDamagedInputChange(itemName, e.target.value)}
                                                        className="w-16 p-1 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded text-center focus:ring-2 focus:ring-pink-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No specific inventory was allocated.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowReconcileModal(false)} className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                            <button onClick={handleReconciliationSubmit} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-bold transition">Reconcile & Complete</button>
                        </div>
                    </div>
                </Modal>
            )}

            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
        </div>
    );
};

export default BookingRequests;