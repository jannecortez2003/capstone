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

    // --- RECONCILIATION STATE ---
    const [showReconcileModal, setShowReconcileModal] = useState(false);
    const [reconcileBooking, setReconcileBooking] = useState(null);
    const [damagedItems, setDamagedItems] = useState({});

    // 🔥 NEW: TAB FILTER STATE 🔥
    const [filter, setFilter] = useState('All');

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

    // 🔥 BULLETPROOF DATE FORMATTER 🔥
    const formatSafeDate = (dateVal) => {
        if (!dateVal) return "N/A";
        try {
            let date = new Date(dateVal);
            if (isNaN(date.getTime())) {
                date = new Date(`${dateVal}T00:00:00`);
            }
            if (isNaN(date.getTime())) return "N/A"; 
            return date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch(e) {
            return "N/A";
        }
    };

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

    // --- RECONCILIATION SUBMIT LOGIC ---
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

    // 🔥 FILTER THE BOOKINGS FOR THE TABLE 🔥
    const filteredBookings = bookings.filter(b => {
        if (filter === 'All') return true;
        return b.status === filter;
    });

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
                
                {/* 🔥 NEW: FILTER TABS 🔥 */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex space-x-2 overflow-x-auto">
                    {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 whitespace-nowrap ${
                                filter === status
                                ? 'bg-pink-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
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
                            {filteredBookings.length > 0 ? filteredBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 dark:text-white transition-colors duration-300">{b.customer_name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{b.customer_email}</div>
                                    </td>
                                    
                                    {/* 🔥 APPLIED SAFE DATE HERE 🔥 */}
                                    <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                        {formatSafeDate(b.preferred_date || b.event_date)}
                                    </td>
                                    
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
                                <tr><td colSpan="4" className="p-10 text-center text-gray-500 dark:text-gray-400 italic">No {filter !== 'All' ? filter.toLowerCase() : ''} bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODERN TIMELINE VIEW MODAL --- */}
            {selectedBooking && (
                <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Overview" size="max-w-2xl">
                    <div className="px-2 py-4">
                        {/* Customer Header */}
                        <div className="mb-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBooking.customer_name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{selectedBooking.customer_email}</p>
                            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${getStatusBadgeClass(selectedBooking.status)}`}>
                                Status: {selectedBooking.status}
                            </span>
                        </div>

                        {/* Vertical Timeline */}
                        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-8 pb-4">
                            
                            {/* Step 1: Event Details */}
                            <div className="relative pl-6">
                                <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-blue-500 border-4 border-white dark:border-gray-800"></span>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">1. Event Specifics</h4>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700 grid grid-cols-3 gap-4">
                                    {/* 🔥 APPLIED SAFE DATE HERE 🔥 */}
                                    <div><p className="text-xs text-gray-500 uppercase font-bold">Date</p><p className="font-semibold dark:text-gray-200">{formatSafeDate(selectedBooking.preferred_date)}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase font-bold">Type</p><p className="font-semibold dark:text-gray-200">{selectedBooking.event_type}</p></div>
                                    <div><p className="text-xs text-gray-500 uppercase font-bold">Guests</p><p className="font-semibold dark:text-gray-200">{selectedBooking.guest_count} Pax</p></div>
                                </div>
                            </div>

                            {/* Step 2: Package & Menu */}
                            <div className="relative pl-6">
                                <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-pink-500 border-4 border-white dark:border-gray-800"></span>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">2. Package & Menu</h4>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700">
                                    <p className="font-black text-pink-600 dark:text-pink-400 mb-3">{selectedBooking.package_type}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedBooking.selected_dishes ? 
                                            selectedBooking.selected_dishes.split('; ').map((dish, i) => (
                                                <span key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-600 px-3 py-1 rounded-md text-xs font-medium dark:text-gray-300 shadow-sm">{dish}</span>
                                            ))
                                        : <span className="text-gray-400 italic text-sm">No dishes selected.</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Auto-Allocated Inventory */}
                            <div className="relative pl-6">
                                <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-purple-500 border-4 border-white dark:border-gray-800"></span>
                                <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">3. Auto-Allocated Inventory</h4>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700">
                                    {selectedBooking.required_inventory ? (
                                        <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            {selectedBooking.required_inventory.split('; ').map((item, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">Standard setup applies. No specific inventory recorded.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        <button onClick={() => setSelectedBooking(null)} className="w-full mt-4 bg-gray-800 dark:bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 transition shadow-md">
                            Close Timeline
                        </button>
                    </div>
                </Modal>
            )}

            {/* Basic Status Modal Modernized */}
            {showStatusModal && (
                <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Confirm Status Change">
                    <div className="p-4 text-center text-gray-800 dark:text-gray-200">
                        <p className="mb-6 text-lg">Approve booking for <strong className="text-pink-600 dark:text-pink-400">{actionDetails.customerName}</strong>?</p>
                        
                        <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-xl mb-6 border border-orange-100 dark:border-orange-800/50">
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center gap-2">
                                <FaBoxOpen className="text-xl" /> Note: This will automatically deduct required inventory from the warehouse.
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowStatusModal(false)} className="px-6 py-3 border dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                            <button onClick={handleStatusUpdate} className="px-6 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition shadow-md">Yes, Approve Event</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* RECONCILIATION MODAL MODERNIZED */}
            {showReconcileModal && reconcileBooking && (
                <Modal isOpen={showReconcileModal} onClose={() => setShowReconcileModal(false)} title="Post-Event Reconciliation">
                    <div className="p-2 text-gray-800 dark:text-gray-200">
                        <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                            Please record any damaged or missing inventory for <strong className="text-gray-900 dark:text-white">{reconcileBooking.customer_name}'s</strong> event. 
                            The remaining items will be automatically returned to the warehouse.
                        </p>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-60 overflow-y-auto border dark:border-gray-700 custom-scrollbar">
                            {reconcileBooking.required_inventory ? (
                                <div className="space-y-4">
                                    {reconcileBooking.required_inventory.split('; ').map((itemStr, i) => {
                                        const [itemName, allocatedQty] = itemStr.split(': ');
                                        return (
                                            <div key={i} className="flex justify-between items-center border-b dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{itemName}</p>
                                                    <p className="text-xs text-gray-500 font-medium">Allocated: {allocatedQty}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <label className="text-xs text-red-500 font-bold uppercase tracking-wider">Lost/Broken:</label>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max={allocatedQty}
                                                        placeholder="0"
                                                        value={damagedItems[itemName] || ''}
                                                        onChange={(e) => handleDamagedInputChange(itemName, e.target.value)}
                                                        className="w-20 p-2 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-center font-bold focus:ring-2 focus:ring-pink-500 outline-none transition"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic text-center py-4">No specific inventory was allocated.</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowReconcileModal(false)} className="px-5 py-2.5 border dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                            <button onClick={handleReconciliationSubmit} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md transition">Reconcile & Complete</button>
                        </div>
                    </div>
                </Modal>
            )}

            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
        </div>
    );
};

export default BookingRequests;