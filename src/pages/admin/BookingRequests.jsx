import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaCheckCircle, FaListAlt } from "react-icons/fa";
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

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700';
            case 'Completed': return 'bg-blue-100 text-blue-700';
            case 'Cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700'; 
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Booking Requests</h1>
            <p className="text-gray-500 mb-8">Manage client appointments and statuses.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-300">
                    <div className="bg-yellow-50 p-3 rounded-full"><FaListAlt className="text-yellow-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.status === 'Pending').length}</div>
                        <div className="text-sm font-medium text-gray-600">Pending Requests</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-green-300">
                    <div className="bg-green-50 p-3 rounded-full"><FaCheckCircle className="text-green-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.status === 'Confirmed').length}</div>
                        <div className="text-sm font-medium text-gray-600">Confirmed Events</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-blue-300">
                    <div className="bg-blue-50 p-3 rounded-full"><FaCalendarAlt className="text-blue-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{bookings.filter(b => b.status === 'Completed').length}</div>
                        <div className="text-sm font-medium text-gray-600">Completed Events</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-700">All Bookings</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-xs">
                            <tr>
                                <th className="p-4 text-left">Customer</th>
                                <th className="p-4 text-left">Event Date</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? bookings.map((b) => (
                                <tr key={b.id} className="border-b hover:bg-pink-50 transition last:border-0">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{b.customer_name}</div>
                                        <div className="text-xs text-gray-500">{b.customer_email}</div>
                                    </td>
                                    <td className="p-4 text-gray-600">{b.preferred_date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusBadgeClass(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button 
                                            onClick={() => setSelectedBooking(b)} 
                                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 transition"
                                        >
                                            VIEW
                                        </button>
                                        
                                        {b.status === 'Pending' && (
                                            <>
                                                <button 
                                                    onClick={() => { setActionDetails({id: b.id, newStatus: 'Confirmed', customerName: b.customer_name}); setShowStatusModal(true); }} 
                                                    className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition"
                                                >
                                                    APPROVE
                                                </button>
                                                <button 
                                                    onClick={() => { setActionDetails({id: b.id, newStatus: 'Cancelled', customerName: b.customer_name}); setShowStatusModal(true); }} 
                                                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition"
                                                >
                                                    REJECT
                                                </button>
                                            </>
                                        )}
                                        
                                        {b.status === 'Confirmed' && (
                                            <button 
                                                onClick={() => { setActionDetails({id: b.id, newStatus: 'Completed', customerName: b.customer_name}); setShowStatusModal(true); }} 
                                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-bold hover:bg-purple-200 transition"
                                            >
                                                COMPLETE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="p-10 text-center text-gray-500 italic">No bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBooking && (
                <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                            <p><strong>Customer:</strong> {selectedBooking.customer_name}</p>
                            <p><strong>Event Type:</strong> {selectedBooking.event_type}</p>
                            <p><strong>Guests:</strong> {selectedBooking.guest_count}</p>
                            <p><strong>Package:</strong> {selectedBooking.package_type}</p>
                            <p className="col-span-2"><strong>Dishes:</strong> {selectedBooking.selected_dishes || 'None selected'}</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-700">Inventory Needed:</p>
                            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-2">
                                {selectedBooking.required_inventory ? 
                                    selectedBooking.required_inventory.split('; ').map((item, i) => <span key={i}>• {item}</span>) 
                                    : <i className="text-gray-400">Standard catering setup</i>
                                }
                            </div>
                        </div>
                        <button onClick={() => setSelectedBooking(null)} className="w-full bg-gray-800 text-white py-2 rounded mt-4 hover:bg-gray-700 transition">Close</button>
                    </div>
                </Modal>
            )}

            {showStatusModal && (
                <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Confirm Status Change">
                    <div className="p-4 text-center">
                        <p className="mb-6">Change status for <strong>{actionDetails.customerName}</strong> to <strong>{actionDetails.newStatus}</strong>?</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setShowStatusModal(false)} className="px-6 py-2 border rounded hover:bg-gray-50 transition">No</button>
                            <button onClick={handleStatusUpdate} className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition">Yes, Confirm</button>
                        </div>
                    </div>
                </Modal>
            )}
            
            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
        </div>
    );
};

export default BookingRequests;