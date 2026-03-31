// src/pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaCalendarCheck, FaMoneyBillWave, FaHistory, FaClock, FaCheckCircle } from "react-icons/fa";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_bookings: 0, pending: 0, confirmed: 0, total_spent: 0 });
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' or 'transactions'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User Info from LocalStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      window.location.href = "/auth"; // Redirect if not logged in
      return;
    }
    setUser(storedUser);

    // 2. Fetch Data
    const fetchData = async () => {
      try {
        // Fetch Bookings
        const resBookings = await fetch(`http://localhost/fetch_user_appointments.php?user_id=${storedUser.id}`);
        const dataBookings = await resBookings.json();
        if (dataBookings.success) setBookings(dataBookings.appointments);

        // Fetch Transactions & Stats
        const resTrans = await fetch(`http://localhost/fetch_user_transactions.php?user_id=${storedUser.id}`);
        const dataTrans = await resTrans.json();
        if (dataTrans.success) {
            setTransactions(dataTrans.transactions);
            setStats(dataTrans.stats);
        }
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-600 font-bold">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* === LEFT SIDEBAR: USER INFO === */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border-t-4 border-pink-500">
            <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto flex items-center justify-center text-pink-500 text-4xl mb-4">
              <FaUser />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.fullName || user?.username}</h2>
            <p className="text-gray-500 text-sm mb-4">Valued Client</p>
            
            <div className="text-left space-y-3 mt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaEnvelope className="text-pink-400" /> 
                    <span className="truncate" title={user?.email}>{user?.email}</span>
                </div>
                {user?.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <FaPhone className="text-pink-400" /> <span>{user.phone}</span>
                    </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full ${user?.verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{user?.verified ? 'Account Verified' : 'Unverified'}</span>
                </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase">Lifetime Stats</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Total Spent</span>
                    <span className="font-bold text-green-600">₱{stats.total_spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Events Booked</span>
                    <span className="font-bold text-pink-600">{stats.total_bookings}</span>
                </div>
            </div>
          </div>
        </div>

        {/* === RIGHT SIDE: MAIN CONTENT === */}
        <div className="md:col-span-3">
            
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-6 flex overflow-hidden">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'overview' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <FaCalendarCheck /> Bookings & Status
                </button>
                <button 
                    onClick={() => setActiveTab('transactions')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'transactions' ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <FaMoneyBillWave /> Transactions
                </button>
            </div>

            {/* TAB 1: BOOKINGS OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Status Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-400 flex items-center gap-3">
                            <div className="bg-yellow-50 p-2 rounded-full text-yellow-500"><FaClock /></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.pending}</div>
                                <div className="text-xs text-gray-500">Pending Approval</div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-400 flex items-center gap-3">
                            <div className="bg-blue-50 p-2 rounded-full text-blue-500"><FaCalendarCheck /></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.confirmed}</div>
                                <div className="text-xs text-gray-500">Confirmed Events</div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-400 flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-full text-green-500"><FaCheckCircle /></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
                                <div className="text-xs text-gray-500">Completed</div>
                            </div>
                        </div>
                    </div>

                    {/* Booking List */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-bold text-gray-700">My Appointments</h3>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">You haven't booked any events yet.</div>
                        ) : (
                            <div className="divide-y">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-lg">{booking.event_type}</h4>
                                            <p className="text-sm text-gray-500">{new Date(booking.preferred_date).toLocaleDateString()} • {booking.package_type}</p>
                                            <div className="mt-1 flex gap-2">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Guests: {booking.guest_count}</span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Total: ₱{parseFloat(booking.total_cost).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {booking.status}
                                            </span>
                                            {/* Payment Progress Bar (Mockup Logic) */}
                                            <div className="w-24 hidden sm:block">
                                                <div className="text-xs text-right text-gray-500 mb-1">
                                                    {booking.status === 'Confirmed' ? '50% Paid' : '0% Paid'}
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div 
                                                        className="bg-green-500 h-1.5 rounded-full" 
                                                        style={{ width: booking.status === 'Confirmed' ? '50%' : '0%' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: TRANSACTIONS */}
            {activeTab === 'transactions' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Payment History</h3>
                        <button className="text-xs text-pink-600 font-bold hover:underline">Download Statement</button>
                    </div>
                    {transactions.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-3 text-gray-400">
                                <FaHistory className="text-2xl" />
                            </div>
                            <p className="text-gray-500">No transactions found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Event</th>
                                        <th className="p-4">Method</th>
                                        <th className="p-4 text-right">Amount</th>
                                        <th className="p-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-pink-50 transition">
                                            <td className="p-4 text-gray-600">{new Date(t.payment_date).toLocaleDateString()}</td>
                                            <td className="p-4 font-medium text-gray-800">
                                                {t.event_type} <span className="text-gray-400 text-xs block">{new Date(t.preferred_date).toLocaleDateString()}</span>
                                            </td>
                                            <td className="p-4">{t.payment_method || 'Cash/Bank Transfer'}</td>
                                            <td className="p-4 text-right font-bold text-gray-700">- ₱{t.amount_paid.toLocaleString()}</td>
                                            <td className="p-4 text-center">
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Success</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default UserProfile;