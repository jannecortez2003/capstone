import React, { useState, useEffect } from 'react';

const AppointmentStatus = ({ userId }) => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    if (!userId) {
        setError("User not logged in or ID missing.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
        const res = await fetch("http://localhost/fetch_user_appointments.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        
        if (data.success) {
            const mappedEvents = data.appointments.map(app => ({
                id: app.id,
                eventName: app.event_type,
                date: app.preferred_date,
                status: app.status,
                details: `Package: ${app.package_type}, Guests: ${app.guest_count}`,
            }));
            setBookedEvents(mappedEvents);
        } else {
            setError(data.message || "Failed to load appointment status.");
        }
    } catch (err) {
        setError("Network error or server misconfiguration: " + err.message);
    } finally {
        setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) return <div className="text-center text-gray-400">Loading your appointments...</div>;
  if (error) return <div className="text-center text-red-500 text-sm">Error: {error}</div>;

  return (
    <section id="appointment-status" className="py-2">
      <div className="container mx-auto px-1">
        <h2 className="text-xl font-bold text-center text-white mb-4">My Booking Status</h2>

        {bookedEvents.length > 0 ? (
          <div className="space-y-4">
            {bookedEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between items-start">
                <div className="mb-2 w-full">
                  <h3 className="text-lg font-semibold text-gray-800">{event.eventName}</h3>
                  <p className="text-gray-600 text-sm">Date: {event.date}</p>
                  <p className="text-gray-600 text-xs">{event.details}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/80 text-sm">You have no active bookings.</p>
        )}
      </div>
    </section>
  );
};

export default AppointmentStatus;