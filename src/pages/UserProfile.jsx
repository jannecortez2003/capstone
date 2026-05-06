import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaCalendarCheck, FaMoneyBillWave, FaHistory, FaClock, FaCheckCircle, FaMoneyCheckAlt } from "react-icons/fa";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_bookings: 0, pending: 0, confirmed: 0, completed: 0, total_spent: 0 });
  const [activeTab, setActiveTab] = useState("overview"); 
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false); 

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setShouldRedirect(true);
      return;
    }
    setUser(storedUser);

    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;

        // 1. Fetch Bookings
        const resBookings = await fetch(`${apiUrl}/fetch_user_appointments?user_id=${storedUser.id}`);
        const dataBookings = await resBookings.json();
        
        let pendingCount = 0;
        let confirmedCount = 0;
        let completedCount = 0;

        if (dataBookings.success) {
            setBookings(dataBookings.appointments);
            // Calculate booking stats
            pendingCount = dataBookings.appointments.filter(b => b.status === 'Pending').length;
            confirmedCount = dataBookings.appointments.filter(b => b.status === 'Confirmed').length;
            completedCount = dataBookings.appointments.filter(b => b.status === 'Completed').length;
        }

        // 2. Fetch Payments using the new route
        const resTrans = await fetch(`${apiUrl}/fetch_user_payments?user_id=${storedUser.id}`);
        const dataTrans = await resTrans.json();
        
        let totalSpent = 0;

        if (dataTrans.success) {
            setTransactions(dataTrans.payments);
            // Calculate total spent
            totalSpent = dataTrans.payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
        }

        // Update all stats at once
        setStats({
            total_bookings: dataBookings.appointments?.length || 0,
            pending: pendingCount,
            confirmed: confirmedCount,
            completed: completedCount,
            total_spent: totalSpent
        });

      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (shouldRedirect) return <Navigate to="/auth" replace />;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-600 dark:bg-gray-900 font-bold transition-colors duration-300">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* === LEFT SIDEBAR: USER INFO === */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 text-center border-t-4 border-pink-500 transition-colors duration-300">
            <div className="w-24 h-24 bg-pink-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center text-pink-500 text-4xl mb-4 transition-colors duration-300">
              <FaUser />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{user?.fullName || user?.username}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 transition-colors duration-300">Valued Client</p>
            
            <div className="text-left space-y-3 mt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    <FaEnvelope className="text-pink-400" /> 
                    <span className="truncate" title={user?.email}>{user?.email}</span>
                </div>
                {user?.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <FaPhone className="text-pink-400" /> <span>{user.phone}</span>
                    </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    <div className={`w-2 h-2 rounded-full ${user?.verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{user?.verified ? 'Account Verified' : 'Unverified'}</span>
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 transition-colors duration-300">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4 text-sm uppercase transition-colors duration-300">Lifetime Stats</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Total Spent</span>
                    <span className="font-bold text-green-600 dark:text-green-400 transition-colors duration-300">₱{stats.total_spent?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Events Booked</span>
                    <span className="font-bold text-pink-600 dark:text-pink-400 transition-colors duration-300">{stats.total_bookings || 0}</span>
                </div>
            </div>
          </div>
        </div>

        {/* === RIGHT SIDE: MAIN CONTENT === */}
        <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 flex overflow-hidden transition-colors duration-300">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-300 ${activeTab === 'overview' ? 'bg-pink-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <FaCalendarCheck /> Bookings & Status
                </button>
                <button 
                    onClick={() => setActiveTab('transactions')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-300 ${activeTab === 'transactions' ? 'bg-pink-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <FaMoneyBillWave /> Transactions
                </button>
            </div>

            {/* TAB 1: BOOKINGS OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-yellow-400 flex items-center gap-3 transition-colors duration-300">
                            <div className="bg-yellow-50 dark:bg-gray-700 p-2 rounded-full text-yellow-500 transition-colors duration-300"><FaClock /></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{stats.pending || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Pending Approval</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-blue-400 flex items-center gap-3 transition-colors duration-300">
                            <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded-full text-blue-500 transition-colors duration-300"><FaCalendarCheck /></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{stats.confirmed || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Confirmed Events</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-green-400 flex items-center gap-3 transition-colors duration-300">
                            <div className="bg-green-50 dark:bg-gray-700 p-2 rounded-full text-green-500 transition-colors duration-300"><FaCheckCircle /></div>
                            <div>
                                <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{stats.completed || 0}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">Completed</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                            <h3 className="font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">My Appointments</h3>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">You haven't booked any events yet.</div>
                        ) : (
                            <div className="divide-y dark:divide-gray-700">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white text-lg transition-colors duration-300">{booking.event_type}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{new Date(booking.preferred_date).toLocaleDateString()} • {booking.package_type}</p>
                                            <div className="mt-2 flex gap-2">
                                                <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded transition-colors duration-300">Guests: {booking.guest_count}</span>
                                                <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded transition-colors duration-300">Total: ₱{parseFloat(booking.total_cost || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${
                                                booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                                                booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' :
                                                booking.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400'
                                            }`}>
                                                {booking.status}
                                            </span>
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center transition-colors duration-300">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">Payment History</h3>
                    </div>
                    {transactions.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                                <FaHistory className="text-2xl" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">No transactions found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-semibold border-b dark:border-gray-700 transition-colors duration-300">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Event</th>
                                        <th className="p-4">Method</th>
                                        <th className="p-4 text-right">Amount Paid</th>
                                        <th className="p-4">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                                            <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                                {new Date(t.transaction_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 font-medium text-gray-800 dark:text-gray-200 transition-colors duration-300">
                                                {t.event_type}
                                            </td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold flex items-center gap-1 w-max transition-colors duration-300">
                                                    <FaMoneyCheckAlt/> {t.payment_type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-green-600 dark:text-green-400 transition-colors duration-300">
                                                + ₱{parseFloat(t.amount_paid).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                                {t.remarks || '-'}
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