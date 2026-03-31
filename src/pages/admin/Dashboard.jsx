import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaMoneyBillWave, FaUtensils, FaUsers, FaClock } from "react-icons/fa";

const Dashboard = () => {
  const [stats, setStats] = useState({
    bookings: 0,
    revenue: 0,
    menuItems: 0,
    customers: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost/admin_fetch_dashboard_stats.php")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setUpcomingEvents(data.upcomingEvents);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Bookings",
      value: stats.bookings,
      icon: <FaCalendarAlt className="text-pink-500 text-3xl" />,
      note: "All time records",
      noteColor: "text-gray-500",
      borderColor: "border-pink-200"
    },
    {
      label: "Total Revenue",
      value: `₱${parseFloat(stats.revenue || 0).toLocaleString()}`,
      icon: <FaMoneyBillWave className="text-green-500 text-3xl" />,
      note: "Verified payments",
      noteColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      label: "Menu Items",
      value: stats.menuItems,
      icon: <FaUtensils className="text-pink-500 text-3xl" />,
      note: "Active dishes",
      noteColor: "text-gray-500",
      borderColor: "border-pink-200"
    },
    {
      label: "Verified Customers",
      value: stats.customers,
      icon: <FaUsers className="text-blue-400 text-3xl" />,
      note: "Registered users",
      noteColor: "text-blue-500",
      borderColor: "border-blue-200"
    },
  ];

  return (
    <div className="p-6 fade-in">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back! Here is your catering business overview.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-white rounded-xl shadow-sm hover:shadow-md p-6 flex items-center gap-4 transition border-l-4 ${stat.borderColor}`}>
            <div className="bg-pink-50 p-3 rounded-full">
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {loading ? "..." : stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              <div className={`text-xs mt-1 ${stat.noteColor}`}>{stat.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6 col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaClock className="text-pink-500" /> Upcoming Events
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-2">Event Type</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="py-4 text-center">Loading events...</td></tr>
                ) : upcomingEvents.length === 0 ? (
                  <tr><td colSpan="3" className="py-4 text-center text-gray-500">No upcoming events found.</td></tr>
                ) : (
                  upcomingEvents.map((event) => (
                    <tr key={event.id} className="border-b last:border-0 hover:bg-pink-50 transition">
                      <td className="py-3 font-medium capitalize">{event.event_type}</td>
                      <td className="py-3 text-gray-600">{event.preferred_date}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          event.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          event.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Quick Calendar</h2>
            <div className="bg-pink-50 p-4 rounded-lg text-center border border-pink-100">
                <p className="text-pink-600 font-bold text-lg mb-2">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </p>
                <div className="grid grid-cols-7 gap-1 text-xs text-gray-600 font-medium">
                    {['S','M','T','W','T','F','S'].map(d => <div key={d} className="py-1">{d}</div>)}
                    {[...Array(30)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`aspect-square flex items-center justify-center rounded-sm ${
                                (i + 1) === new Date().getDate() ? 'bg-pink-500 text-white font-bold shadow-md' : 'hover:bg-pink-200 cursor-pointer'
                            }`}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;