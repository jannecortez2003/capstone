import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaCalendarAlt, FaMoneyBillWave, FaUtensils, FaUsers, 
    FaChevronLeft, FaChevronRight, FaSun, FaMoon, FaCheckCircle, 
    FaClock, FaMapMarkerAlt 
} from 'react-icons/fa';
import Modal from '../../components/Modal';

const Dashboard = ({ theme, toggleTheme }) => {
  const [stats, setStats] = useState({ bookings: 0, revenue: 0, menuItems: 0, customers: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  
  // NEW: State to hold the detailed booking information
  const [detailedBookings, setDetailedBookings] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filter, setFilter] = useState('All');
  
  // Calendar Popup States
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch the standard dashboard stats
    fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_dashboard_stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setUpcomingEvents(data.upcomingEvents || []);
        }
      })
      .catch(err => console.error(err));

    // 2. Fetch the detailed bookings so the calendar modal has full context
    fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_bookings`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setDetailedBookings(data.bookings || []);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
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

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const filteredEvents = upcomingEvents.filter(event => {
    if (filter === 'All') return true;
    return event.status === filter;
  });

  const handleDateClick = (dateStr, dayEvents) => {
    setSelectedDate(dateStr);
    
    // Map the basic calendar events to their detailed counterparts
    const detailedDayEvents = dayEvents.map(calendarEvent => {
        return detailedBookings.find(b => b.id === calendarEvent.id) || calendarEvent;
    });
    
    setSelectedDayEvents(detailedDayEvents);
    setIsModalOpen(true);
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 text-center text-transparent">0</div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const m = String(month + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const dateStr = `${year}-${m}-${d}`;
      
      const dayEvents = upcomingEvents.filter(e => {
        if (e.status !== 'Confirmed' && e.status !== 'Pending') return false;
        if (!e.preferred_date) return false;
        
        const start = e.preferred_date.split('T')[0];
        const end = e.end_date ? e.end_date.split('T')[0] : start;
        return dateStr >= start && dateStr <= end;
      });

      const hasEvent = dayEvents.length > 0;
      const isToday = todayStr === dateStr;

      days.push(
        <div 
          key={day} 
          onClick={() => hasEvent ? handleDateClick(dateStr, dayEvents) : null}
          className={`p-2 text-center text-sm rounded-lg mx-auto w-full h-12 flex flex-col items-center justify-center font-medium transition-all duration-200
            ${hasEvent ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-bold border border-pink-200 dark:border-pink-800 cursor-pointer hover:bg-pink-200 dark:hover:bg-pink-800/60 shadow-sm' : 'text-gray-700 dark:text-gray-300'}
            ${isToday && !hasEvent ? 'border-2 border-pink-500 text-pink-600 dark:text-pink-400' : ''}
          `}
        >
          <span>{day}</span>
          {hasEvent && (
              <span className="text-[9px] mt-0.5 bg-pink-600 text-white px-1.5 rounded-full">
                  {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
              </span>
          )}
        </div>
      );
    }
    return days;
  };

  if (loading) return <div className="text-center mt-10 dark:text-white">Loading dashboard...</div>;

  return (
    <div className="fade-in transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Dashboard Overview</h1>
        <button onClick={toggleTheme} className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 p-3 rounded-full shadow-sm hover:text-pink-600 dark:hover:text-pink-400 transition border dark:border-gray-700">
          {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-pink-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Total Bookings</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">{stats.bookings}</div>
            </div>
            <div className="bg-pink-100 dark:bg-gray-700 p-3 rounded-full text-pink-600 dark:text-pink-400 transition-colors duration-300">
              <FaCalendarAlt className="text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Total Revenue</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">₱ {parseFloat(stats.revenue || 0).toLocaleString()}</div>
            </div>
            <div className="bg-green-100 dark:bg-gray-700 p-3 rounded-full text-green-600 dark:text-green-400 transition-colors duration-300">
              <FaMoneyBillWave className="text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Menu Items</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">{stats.menuItems}</div>
            </div>
            <div className="bg-yellow-100 dark:bg-gray-700 p-3 rounded-full text-yellow-600 dark:text-yellow-400 transition-colors duration-300">
              <FaUtensils className="text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase transition-colors duration-300">Verified Customers</h3>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mt-2 transition-colors duration-300">{stats.customers}</div>
            </div>
            <div className="bg-blue-100 dark:bg-gray-700 p-3 rounded-full text-blue-600 dark:text-blue-400 transition-colors duration-300">
              <FaUsers className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300 h-fit">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-bold text-gray-800 dark:text-white transition-colors duration-300">Event Overview</h2>
            
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {['All', 'Pending', 'Confirmed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                    filter === status
                      ? 'bg-white dark:bg-gray-800 text-pink-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm uppercase transition-colors duration-300">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Event Type</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      No {filter !== 'All' ? filter.toLowerCase() : ''} events found.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="p-4 font-medium text-gray-800 dark:text-white transition-colors duration-300">
                        {formatSafeDateRange(event.preferred_date, event.end_date)}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 transition-colors duration-300">{event.event_type}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          event.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          event.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
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

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300 h-fit">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition"><FaChevronLeft /></button>
            <h2 className="font-bold text-gray-800 dark:text-white transition-colors">
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </h2>
            <button onClick={handleNextMonth} className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition"><FaChevronRight /></button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs font-bold text-gray-400 dark:text-gray-500">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
          
          <div className="mt-6 border-t dark:border-pink-700 pt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 bg-pink-700 border border-pink-600 rounded"></div>
            <span>Click shaded dates to view events</span>
          </div>
        </div>
      </div>

      {/* DETAILED CALENDAR EVENT MODAL */}
      <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={selectedDate ? `Events on ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Event Details'}
          size="max-w-2xl"
      >
          <div className="space-y-6 text-gray-800 dark:text-gray-200 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2">
              {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map(ev => (
                      <div key={ev.id} className="p-5 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm flex flex-col gap-4">
                          
                          <div className="flex justify-between items-start border-b dark:border-gray-700 pb-3">
                              <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                                      {ev.customer_name || 'Guest Client'}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{ev.customer_email || 'No email provided'}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                                  ev.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                  {ev.status}
                              </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-2">
                                  <p className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                      <span className="bg-pink-100 dark:bg-gray-700 p-1.5 rounded text-pink-600 dark:text-pink-400 mt-0.5"><FaCalendarAlt /></span>
                                      <span className="leading-tight">
                                          <strong>{ev.event_type}</strong><br/>
                                          {formatSafeDateRange(ev.preferred_date, ev.end_date)} <br/>
                                          <span className="text-pink-500 font-bold">{formatTime12Hour(ev.event_time)}</span>
                                      </span>
                                  </p>
                                  <p className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                      <span className="bg-pink-100 dark:bg-gray-700 p-1.5 rounded text-pink-600 dark:text-pink-400 mt-0.5"><FaUsers /></span>
                                      <span className="leading-tight mt-1"><strong>{ev.guest_count}</strong> Guests Expected</span>
                                  </p>
                              </div>
                              
                              <div className="space-y-2">
                                  <p className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                      <span className="bg-pink-100 dark:bg-gray-700 p-1.5 rounded text-pink-600 dark:text-pink-400 mt-0.5"><FaMapMarkerAlt /></span>
                                      <span className="leading-tight">
                                          <strong>Location:</strong><br/>
                                          {ev.event_location || 'Not specified'}
                                      </span>
                                  </p>
                              </div>
                          </div>

                          {ev.service_type && (
                              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-700 text-xs">
                                  <strong className="text-gray-700 dark:text-gray-300 mb-1 block">Inclusions:</strong>
                                  <div className="flex flex-wrap gap-1">
                                      {ev.service_type.split(', ').map((inc, i) => (
                                          <span key={i} className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 px-2 py-1 rounded font-bold border border-pink-100 dark:border-pink-800/50">
                                              {inc}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}

                          {ev.selected_dishes && (
                              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border dark:border-gray-700 text-xs">
                                  <strong className="text-gray-700 dark:text-gray-300 mb-1 block">Menu Selection:</strong>
                                  <div className="flex flex-wrap gap-1">
                                      {ev.selected_dishes.split('; ').map((dish, i) => (
                                          <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-medium border dark:border-gray-700">
                                              {dish}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                              <span className="text-xs font-bold text-gray-500 uppercase">Package: {ev.package_type || 'Custom'}</span>
                              <span className="font-black text-green-600 dark:text-green-400">Total: ₱{parseFloat(ev.total_cost || 0).toLocaleString()}</span>
                          </div>

                      </div>
                  ))
              ) : (
                  <p className="text-center text-gray-500 py-4">No events scheduled for this day.</p>
              )}
              
          </div>
          <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-end">
              <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-8 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-sm"
              >
                  Close
              </button>
          </div>
      </Modal>
    </div>
  );
};

export default Dashboard;