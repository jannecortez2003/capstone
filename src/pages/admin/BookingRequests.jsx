import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaCheckCircle, FaListAlt, FaBoxOpen, FaEdit, FaTimes, FaCheck, FaExclamationTriangle, FaPrint } from "react-icons/fa";
import Modal, { SuccessModal } from '../../components/Modal';

const BookingRequests = () => {
    const adminUser = JSON.parse(sessionStorage.getItem('adminUser') || '{}');
    const userRole = adminUser.role || 'admin';
    
    const [bookings, setBookings] = useState([]);
    const [menuItems, setMenuItems] = useState([]); 
    const [packages, setPackages] = useState([]); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    
    // Approval / Status Action Details
    const [actionDetails, setActionDetails] = useState(null);
    const [agreedPrice, setAgreedPrice] = useState("");
    const [calculatedMath, setCalculatedMath] = useState("");
    
    // Edit Booking State
    const [editModalBooking, setEditModalBooking] = useState(null);

    // Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Themed Error/Restriction Modal State
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [showReconcileModal, setShowReconcileModal] = useState(false);
    const [reconcileBooking, setReconcileBooking] = useState(null);
    const [damagedItems, setDamagedItems] = useState({});

    const [filter, setFilter] = useState('All');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_fetch_bookings`);
            const data = await res.json();
            if (data.success) setBookings(data.bookings);
            else setError(data.message);
        } catch (err) {
            setError("Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchBookings(); 
        
        fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_menu`)
            .then(res => res.json())
            .then(data => { if (data.success) setMenuItems(data.items); })
            .catch(err => console.error(err));
            
        fetch(`${import.meta.env.VITE_API_URL}/fetch_packages`)
            .then(res => res.json())
            .then(data => { if (data.success) setPackages(data.packages); })
            .catch(err => console.error(err));
    }, []);

    const formatSafeDateRange = (start, end) => {
        if (!start) return "N/A";
        try {
            let sDate = new Date(start);
            if (isNaN(sDate.getTime())) sDate = new Date(`${start}T00:00:00`);
            const sStr = sDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            if (end && end !== start) {
                let eDate = new Date(end);
                if (isNaN(eDate.getTime())) eDate = new Date(`${end}T00:00:00`);
                const eStr = eDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                return `${sStr} - ${eStr}`;
            }
            return sStr;
        } catch(e) { return "N/A"; }
    };

    const formatTime12Hour = (time24) => {
        if (!time24) return "";
        const [hour, minute] = time24.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minute} ${ampm}`;
    };

    const handleStatusUpdate = async () => {
        if (!actionDetails) return;
        
        if (actionDetails.newStatus === 'Confirmed' && (!agreedPrice || parseFloat(agreedPrice) <= 0)) {
            setShowStatusModal(false);
            setErrorMessage("Please set a valid agreed price for this event before approving.");
            setShowErrorModal(true);
            return;
        }

        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_update_booking_status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    bookingId: actionDetails.id, 
                    status: actionDetails.newStatus,
                    agreedPrice: agreedPrice
                }),
            });
            const data = await res.json();
            
            if (data.success) {
                await fetchBookings();
                setShowStatusModal(false);
                setSuccessMessage(data.message);
                setShowSuccessModal(true);
            } else {
                setShowStatusModal(false);
                setErrorMessage(data.message);
                setShowErrorModal(true);
            }
        } catch (err) { 
            setShowStatusModal(false);
            setErrorMessage("Network error. Could not reach the server.");
            setShowErrorModal(true);
        }
        finally { setLoading(false); }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_update_booking_details`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editModalBooking),
            });
            const data = await res.json();
            if (data.success) {
                await fetchBookings();
                setEditModalBooking(null);
                setSuccessMessage(data.message);
                setShowSuccessModal(true);
            } else {
                setErrorMessage(`Update Failed: ${data.message}`);
                setShowErrorModal(true);
            }
        } catch (err) { 
            setErrorMessage("Network error. Could not reach the server.");
            setShowErrorModal(true);
        }
        finally { setLoading(false); }
    };

    const handleReconciliationSubmit = async () => {
        if (!reconcileBooking) return;
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_reconcile_booking`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: reconcileBooking.id, damagedItems: damagedItems || {} }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchBookings();
                setShowReconcileModal(false); setReconcileBooking(null); setDamagedItems({});
                setSuccessMessage(data.message); setShowSuccessModal(true);
            } else { 
                setErrorMessage(`Reconciliation Failed: ${data.message}`);
                setShowErrorModal(true);
            }
        } catch (err) { 
            setErrorMessage("Network error. Could not reach the server.");
            setShowErrorModal(true);
        }
        finally { setLoading(false); }
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm(`Are you sure you want to permanently delete Booking #${id}? This action cannot be undone.`)) return;
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_delete_booking`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchBookings();
                setSuccessMessage(`Booking #${id} successfully deleted.`);
                setShowSuccessModal(true);
            } else { 
                setErrorMessage(`Delete Failed: ${data.message}`);
                setShowErrorModal(true);
            }
        } catch (err) { 
            setErrorMessage("Network error. Could not reach the server.");
            setShowErrorModal(true);
        } 
        finally { setLoading(false); }
    };

    const handleDamagedInputChange = (itemName, value) => setDamagedItems(prev => ({ ...prev, [itemName]: value }));

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 print:border print:border-green-600 print:text-green-800 print:bg-white';
            case 'Completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 print:border print:border-blue-600 print:text-blue-800 print:bg-white';
            case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 print:border print:border-red-600 print:text-red-800 print:bg-white';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 print:border print:border-yellow-600 print:text-yellow-800 print:bg-white';
        }
    };

    const filteredBookings = bookings.filter(b => filter === 'All' ? true : b.status === filter);

    const currentDishes = editModalBooking?.selected_dishes ? editModalBooking.selected_dishes.split(';').map(d => d.trim()).filter(d => d) : [];
    const currentLimit = editModalBooking?.dish_limit || 7;

    const handleDishToggle = (dishName) => {
        if (currentDishes.includes(dishName)) {
            let newDishes = currentDishes.filter(d => d !== dishName);
            setEditModalBooking({...editModalBooking, selected_dishes: newDishes.join('; ')});
        } else {
            if (currentDishes.length >= currentLimit) {
                setErrorMessage(`You can only select up to ${currentLimit} dishes for this package.`);
                setShowErrorModal(true);
                return;
            }
            let newDishes = [...currentDishes, dishName];
            setEditModalBooking({...editModalBooking, selected_dishes: newDishes.join('; ')});
        }
    };

    const groupedMenu = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    let combinedInclusions = [];
    let currentServices = [];
    if (editModalBooking) {
        currentServices = editModalBooking.service_type ? editModalBooking.service_type.split(',').map(s => s.trim()).filter(Boolean) : [];
        
        const selectedPkg = packages.find(p => p.package_name === editModalBooking.package_type);
        let dynamicInclusions = [];
        
        if (selectedPkg && selectedPkg.description) {
            dynamicInclusions = selectedPkg.description.split(',').map(f => f.trim());
            if (selectedPkg.dish_limit > 0) {
                dynamicInclusions.unshift(`Food/Catering (${selectedPkg.dish_limit} Dishes)`);
            }
        } else {
            dynamicInclusions = [
                `Food/Catering (${editModalBooking.dish_limit || 7} Dishes)`, 
                'Tables & Chairs', 
                'Event Styling/Decoration', 
                'Lights & Sound System'
            ];
        }

        combinedInclusions = Array.from(new Set([...dynamicInclusions, ...currentServices])).filter(Boolean);
    }

    return (
        <div className="p-6 transition-colors duration-300 print:p-0 print:m-0 print:w-full print:bg-white text-black">
            
            {/* Header Area */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300 print:text-black">Booking Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300 print:hidden">Manage client appointments and statuses.</p>
                    
                    {/* Only shows on Print */}
                    <div className="hidden print:block mb-6">
                        <p className="text-sm text-gray-700 font-bold uppercase tracking-wider">Report Filter: {filter} Events</p>
                        <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => window.print()}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md print:hidden"
                >
                    <FaPrint /> Export Report
                </button>
            </div>
            
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4 print:mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-300 transition-colors duration-300 print:border print:shadow-none">
                    <div className="bg-yellow-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300 print:hidden"><FaListAlt className="text-yellow-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300 print:text-black">{bookings.filter(b => b.status === 'Pending').length}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300 print:text-gray-800">Pending Requests</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-green-300 transition-colors duration-300 print:border print:shadow-none">
                    <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300 print:hidden"><FaCheckCircle className="text-green-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300 print:text-black">{bookings.filter(b => b.status === 'Confirmed').length}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300 print:text-gray-800">Confirmed Events</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-blue-300 transition-colors duration-300 print:border print:shadow-none">
                    <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300 print:hidden"><FaCalendarAlt className="text-blue-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300 print:text-black">{bookings.filter(b => b.status === 'Completed').length}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300 print:text-gray-800">Completed Events</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300 print:shadow-none print:border-none">
                
                {/* FILTER TABS (Hidden on Print) */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex space-x-2 overflow-x-auto print:hidden">
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
                    <table className="min-w-full text-sm print:text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300 print:bg-white print:text-black print:border-b-2 print:border-black">
                            <tr>
                                <th className="p-4 text-left w-20">ID</th>
                                <th className="p-4 text-left">Customer</th>
                                <th className="p-4 text-left">Event / Package</th>
                                <th className="p-4 text-left">Event Date</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-center print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-300">
                            {filteredBookings.length > 0 ? filteredBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300 print:break-inside-avoid">
                                    <td className="p-4">
                                        <span className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-mono text-xs px-2 py-1 rounded border dark:border-gray-600 shadow-sm font-bold print:border-none print:p-0 print:text-black">
                                            #{b.id}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 dark:text-white transition-colors duration-300 print:text-black">{b.customer_name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300 print:text-gray-800">{b.customer_email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 dark:text-white transition-colors duration-300 print:text-black">{b.event_type}</div>
                                        <div className="text-xs text-pink-600 dark:text-pink-400 font-bold transition-colors duration-300 print:text-gray-800">{b.package_type || 'Custom Package'}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300 print:text-black">
                                        {formatSafeDateRange(b.preferred_date || b.event_date, b.end_date)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`shrink-0 whitespace-nowrap px-2 py-1 rounded text-xs font-bold ${getStatusBadgeClass(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex flex-wrap justify-center gap-2 print:hidden">
                                        <button onClick={() => setSelectedBooking(b)} className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900 transition">
                                            VIEW
                                        </button>

                                        {userRole !== 'staff' && b.status !== 'Completed' && b.status !== 'Cancelled' && (
                                            <button onClick={() => setEditModalBooking(b)} className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 px-3 py-1 rounded text-xs font-bold hover:bg-orange-200 dark:hover:bg-orange-900 transition flex items-center gap-1">
                                                <FaEdit /> EDIT
                                            </button>
                                        )}
                                        
                                        {userRole !== 'staff' && b.status === 'Pending' && (
                                            <>
                                                <button onClick={() => { 
                                                    const autoPrice = Number(b.guest_count) * 400; 
                                                    setActionDetails({id: b.id, newStatus: 'Confirmed', customerName: b.customer_name}); 
                                                    setAgreedPrice(b.total_cost > 0 ? b.total_cost : autoPrice);
                                                    setCalculatedMath(`${b.guest_count} Guests x ₱400 = ₱${autoPrice.toLocaleString()}`);
                                                    setShowStatusModal(true); 
                                                }} className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition">
                                                    APPROVE
                                                </button>
                                                <button onClick={() => { setActionDetails({id: b.id, newStatus: 'Cancelled', customerName: b.customer_name}); setShowStatusModal(true); }} className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 px-3 py-1 rounded text-xs font-bold hover:bg-yellow-200 transition">
                                                    REJECT
                                                </button>
                                            </>
                                        )}

                                        {userRole !== 'staff' && b.status === 'Confirmed' && (
                                            <button 
                                                onClick={() => { setReconcileBooking(b); setDamagedItems({}); setShowReconcileModal(true); }}
                                                className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 px-3 py-1 rounded text-xs font-bold hover:bg-purple-200 transition"
                                            >
                                                COMPLETE & RECONCILE
                                            </button>
                                        )}

                                        {userRole === 'admin' && (
                                            <button onClick={() => handleDeleteBooking(b.id)} className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded text-xs font-bold border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition">
                                                DELETE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="p-10 text-center text-gray-500 dark:text-gray-400 italic print:text-black">No {filter !== 'All' ? filter.toLowerCase() : ''} bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* VIEW BOOKING DETAILS MODAL */}
            {selectedBooking && (
                <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title={`Booking Overview (ID: #${selectedBooking.id})`} size="max-w-xl">
                    <div className="flex flex-col">
                        
                        {/* SCROLLABLE VIEW AREA */}
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="mb-2 text-center">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white break-words leading-tight">{selectedBooking.customer_name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 break-words mt-0.5">{selectedBooking.customer_email}</p>
                                <span className={`shrink-0 whitespace-nowrap mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusBadgeClass(selectedBooking.status)}`}>
                                    Status: {selectedBooking.status}
                                </span>
                            </div>

                            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-2 md:ml-3 space-y-3 pb-1 mt-4">
                                <div className="relative pl-5 md:pl-6">
                                    <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-[3px] border-white dark:border-gray-800"></span>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1 leading-tight">1. Event Specifics</h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="border-b sm:border-0 border-gray-200 dark:border-gray-700 pb-1 sm:pb-0">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold leading-none mb-1">Date & Time</p>
                                            <p className="font-semibold text-xs dark:text-gray-200 break-words leading-tight">{formatSafeDateRange(selectedBooking.preferred_date, selectedBooking.end_date)}</p>
                                            <p className="font-semibold text-pink-600 dark:text-pink-400 text-xs mt-1">{formatTime12Hour(selectedBooking.event_time)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold leading-none mb-1">Location & Details</p>
                                            <p className="font-semibold text-xs dark:text-gray-200 break-words leading-tight">{selectedBooking.event_location}</p>
                                            
                                            <p className="font-semibold text-xs text-gray-500 mt-1">{selectedBooking.event_type} - {selectedBooking.guest_count} Pax</p>
                                            <p className="font-bold text-pink-600 dark:text-pink-400 text-[10px]">{selectedBooking.package_type}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative pl-5 md:pl-6">
                                    <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-pink-500 border-[3px] border-white dark:border-gray-800"></span>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1 leading-tight">2. Package Inclusions & Menu</h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border dark:border-gray-700">
                                        
                                        <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b dark:border-gray-700">
                                            {selectedBooking.service_type ? 
                                                  selectedBooking.service_type.split(',').map((inc, i) => (
                                                    <span key={i} className="bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800/50 px-1.5 py-0.5 rounded text-[10px] font-bold text-pink-700 dark:text-pink-400 shadow-sm leading-tight">{inc.trim()}</span>
                                                ))
                                            : <span className="text-gray-400 italic text-[10px]">No inclusions specified.</span>}
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {selectedBooking.selected_dishes ? 
                                                  selectedBooking.selected_dishes.split('; ').map((dish, i) => (
                                                    <span key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-600 px-1.5 py-0.5 rounded text-[10px] font-medium dark:text-gray-300 shadow-sm leading-tight">{dish}</span>
                                                ))
                                            : <span className="text-gray-400 italic text-[10px]">No dishes selected.</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative pl-5 md:pl-6">
                                    <span className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-purple-500 border-[3px] border-white dark:border-gray-800"></span>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1 leading-tight">3. Auto-Allocated Inventory</h4>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border dark:border-gray-700">
                                        {selectedBooking.required_inventory ? (
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                                                {selectedBooking.required_inventory.split('; ').map((item, i) => (
                                                    <li key={i} className="flex items-center gap-1.5">
                                                        <div className="w-1 h-1 rounded-full bg-pink-500 shrink-0"></div> 
                                                        <span className="break-words leading-tight">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400 italic text-[10px]">Standard setup applies. No specific inventory recorded.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FIXED FOOTER BUTTON */}
                        <div className="mt-4 pt-4 border-t dark:border-gray-700 shrink-0">
                            <button onClick={() => setSelectedBooking(null)} className="w-full bg-gray-800 dark:bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition shadow-sm text-xs">
                                Close Timeline
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* EDIT BOOKING MODAL */}
            {editModalBooking && (
                <Modal isOpen={!!editModalBooking} onClose={() => setEditModalBooking(null)} title={`Edit Booking #${editModalBooking.id}`} size="max-w-2xl">
                    <form onSubmit={handleEditSubmit} className="flex flex-col text-gray-800 dark:text-gray-200">
                        
                        {/* SCROLLABLE BODY */}
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-500">Event Type</label>
                                    <input 
                                        type="text" 
                                        value={editModalBooking.event_type} 
                                        onChange={(e) => setEditModalBooking({...editModalBooking, event_type: e.target.value})} 
                                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 text-sm" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-500">Guest Count</label>
                                    <input 
                                        type="number" 
                                        value={editModalBooking.guest_count} 
                                        onChange={(e) => setEditModalBooking({...editModalBooking, guest_count: e.target.value})} 
                                        className="w-full p-2.5 border border-pink-300 dark:border-pink-800/50 bg-pink-50/50 dark:bg-pink-900/20 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 text-sm font-bold text-pink-700 dark:text-pink-400" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-500">Event Time</label>
                                    <input 
                                        type="time" 
                                        value={editModalBooking.event_time} 
                                        onChange={(e) => setEditModalBooking({...editModalBooking, event_time: e.target.value})} 
                                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 text-sm" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-500">Event Location</label>
                                    <input 
                                        type="text" 
                                        value={editModalBooking.event_location} 
                                        onChange={(e) => setEditModalBooking({...editModalBooking, event_location: e.target.value})} 
                                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 text-sm" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <label className="block text-xs font-bold mb-3 uppercase tracking-wider text-gray-500">
                                    Services & Inclusions <span className="text-pink-500 lowercase normal-case text-[10px] ml-2">({editModalBooking.package_type || 'Custom'})</span>
                                </label>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {combinedInclusions.map(option => {
                                        const isSelected = currentServices.includes(option);
                                        
                                        return (
                                            <label key={option} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-pink-50 border-pink-300 dark:bg-pink-900/30 dark:border-pink-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-pink-300'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected} 
                                                    onChange={() => {
                                                        let newServices;
                                                        if (isSelected) {
                                                            newServices = currentServices.filter(s => s !== option);
                                                        } else {
                                                            newServices = [...currentServices, option];
                                                        }
                                                        setEditModalBooking({...editModalBooking, service_type: newServices.join(', ')});
                                                    }} 
                                                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 accent-pink-600 cursor-pointer shrink-0" 
                                                />
                                                <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-pink-700 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {option}
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Menu / Food Choices</label>
                                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${currentDishes.length >= currentLimit ? 'bg-green-100 text-green-800' : 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300'}`}>
                                        {currentDishes.length} / {currentLimit} Selected
                                    </span>
                                </div>
                                
                                <div className="space-y-4">
                                    {Object.keys(groupedMenu).length > 0 ? (
                                        Object.keys(groupedMenu).map(category => (
                                            <div key={category} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700">
                                                <h4 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-2">{category}</h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {groupedMenu[category].map(item => {
                                                        const isSelected = currentDishes.includes(item.name);
                                                        return (
                                                        <label key={item.id} className={`flex items-start gap-2 text-sm p-2.5 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'}`}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isSelected} 
                                                                onChange={() => handleDishToggle(item.name)} 
                                                                className="mt-0.5 w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 shrink-0 accent-pink-600 cursor-pointer" 
                                                            />
                                                            <span className={`leading-tight ${isSelected ? 'font-bold text-pink-700 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.name}</span>
                                                        </label>
                                                    )})}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-sm text-gray-500 italic">No menu items found. Add some in the Menu page.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FIXED FOOTER */}
                        <div className="flex justify-end gap-3 pt-4 mt-2 border-t dark:border-gray-700 shrink-0">
                            <button type="button" onClick={() => setEditModalBooking(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-bold text-sm">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition shadow-md text-sm flex items-center gap-2"><FaEdit /> Save Changes</button>
                        </div>
                    </form>
                </Modal>
            )}

            {showStatusModal && (
                <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Confirm Status Change">
                    <div className="p-2 md:p-4 text-center text-gray-800 dark:text-gray-200">
                        <p className="mb-4 text-base md:text-lg">Approve booking for <strong className="text-pink-600 dark:text-pink-400 break-words">{actionDetails?.customerName}</strong>?</p>
                        
                        {actionDetails?.newStatus === 'Confirmed' && (
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-600 mb-6 text-left shadow-inner">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Set Agreed Price (₱) <span className="text-red-500">*</span></label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={agreedPrice} 
                                    onChange={(e) => setAgreedPrice(e.target.value)} 
                                    className="w-full p-3 border border-pink-200 dark:border-gray-600 bg-pink-50 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 text-pink-700 dark:text-pink-400 font-bold" 
                                    placeholder="Enter final negotiated price..."
                                />
                                {/* AUTO-CALCULATION TEXT INDICATOR */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium bg-gray-100 dark:bg-gray-900 p-2 rounded border dark:border-gray-600">
                                    💡 <strong className="text-pink-600 dark:text-pink-400">Suggested Price:</strong> {calculatedMath}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button onClick={() => setShowStatusModal(false)} className="w-full sm:w-auto px-6 py-2.5 border dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">Cancel</button>
                            <button onClick={handleStatusUpdate} className="w-full sm:w-auto px-6 py-2.5 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition shadow-md text-sm">Yes, Approve Event</button>
                        </div>
                    </div>
                </Modal>
            )}

            <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Action Restricted" size="max-w-md">
                <div className="p-4 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 border border-red-200 dark:border-red-800">
                        <FaExclamationTriangle className="text-3xl text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                        {errorMessage}
                    </p>
                    <button onClick={() => setShowErrorModal(false)} className="w-full bg-gray-800 dark:bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-900 dark:hover:bg-gray-600 transition shadow-md text-sm">
                        Understood
                    </button>
                </div>
            </Modal>

            {/* RECONCILE MODAL */}
            {showReconcileModal && reconcileBooking && (
                <Modal isOpen={showReconcileModal} onClose={() => setShowReconcileModal(false)} title="Post-Event Reconciliation">
                    <div className="flex flex-col text-gray-800 dark:text-gray-200">
                        
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <p className="text-xs md:text-sm mb-3 text-gray-600 dark:text-gray-400">
                                Please record any damaged or missing inventory for <strong className="text-gray-900 dark:text-white break-words">{reconcileBooking.customer_name}'s</strong> event. 
                                The remaining items will be automatically returned to the warehouse.
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 border dark:border-gray-700">
                                {reconcileBooking.required_inventory ? (
                                    <div className="space-y-3">
                                        {reconcileBooking.required_inventory.split('; ').map((itemStr, i) => {
                                            const [itemName, allocatedQty] = itemStr.split(': ');
                                            return (
                                                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b dark:border-gray-700 pb-2 last:border-0 last:pb-0 gap-2 sm:gap-0">
                                                    <div className="w-full sm:w-auto">
                                                        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm break-words">{itemName}</p>
                                                        <p className="text-[10px] md:text-xs text-gray-500 font-medium">Allocated: {allocatedQty}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 bg-gray-100 dark:bg-gray-800 p-2 sm:p-0 rounded-lg sm:bg-transparent">
                                                        <label className="text-[10px] md:text-xs text-red-500 font-bold uppercase tracking-wider">Lost/Broken:</label>
                                                        <input 
                                                            type="number" min="0" max={allocatedQty} placeholder="0"
                                                            value={damagedItems[itemName] || ''} onChange={(e) => handleDamagedInputChange(itemName, e.target.value)}
                                                            className="w-16 md:w-20 p-1.5 border dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-center font-bold focus:ring-2 focus:ring-pink-500 outline-none transition text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic text-center py-2">No specific inventory was allocated.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-4 border-t dark:border-gray-700 shrink-0">
                            <button onClick={() => setShowReconcileModal(false)} className="w-full sm:w-auto px-5 py-2 border dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">Cancel</button>
                            <button onClick={handleReconciliationSubmit} className="w-full sm:w-auto px-5 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-md transition text-sm">Reconcile & Complete</button>
                        </div>
                    </div>
                </Modal>
            )}

            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
        </div>
    );
}

export default BookingRequests;