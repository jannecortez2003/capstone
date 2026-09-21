import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const EventFormModal = ({ isOpen, onClose, userId, preSelectedPackage, packageCapacity, preSelectedDishes, onBookingSuccess, preSelectedEventType }) => {
  const [formData, setFormData] = useState({ eventType: '', preferredDate: '', duration: 1, guestCount: '', notes: '' });
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        eventType: preSelectedEventType || 'Wedding',
        preferredDate: '', 
        duration: 1,
        guestCount: packageCapacity || '', 
        notes: ''
      }));
      setError(null);
      setCurrentMonth(new Date());

      fetch(`${import.meta.env.VITE_API_URL}/fetch_booked_dates`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBookedDates(data.bookedDates);
          }
        })
        .catch(err => console.error("Failed to load booked dates", err));
    }
  }, [isOpen, preSelectedEventType, packageCapacity]);

  if (!isOpen) return null;

  const handleDateClick = (dateStr) => {
    let cur = new Date(dateStr);
    let isValid = true;
    for(let i=0; i<formData.duration; i++) {
        let checkStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        if (bookedDates.includes(checkStr)) {
            isValid = false;
            break;
        }
        cur.setDate(cur.getDate() + 1);
    }
    
    if (!isValid) {
        setError(`Cannot select ${dateStr} for ${formData.duration} days because it overlaps with an existing booking.`);
        return;
    }
    
    setFormData({ ...formData, preferredDate: dateStr });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newData = { ...formData, [name]: value };
    
    if (name === 'duration' && newData.preferredDate) {
        let cur = new Date(newData.preferredDate);
        let isValid = true;
        for(let i=0; i<newData.duration; i++) {
            let checkStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
            if (bookedDates.includes(checkStr)) {
                isValid = false;
                break;
            }
            cur.setDate(cur.getDate() + 1);
        }
        if (!isValid) {
            setError(`Extending to ${value} days overlaps with an existing booking. Please choose another start date.`);
            newData.preferredDate = ''; 
        } else {
            setError(null);
        }
    }
    setFormData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.preferredDate) {
        setError("Please select an available date from the calendar.");
        return;
    }
    
    setLoading(true); setError(null);
    try {
      const payload = { 
        userId, 
        packageType: preSelectedPackage, 
        selectedDishes: preSelectedDishes.join('; '), 
        ...formData 
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/book_event`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
         onBookingSuccess("Your event has been successfully booked! Please wait for admin confirmation.");
       } else {
         setError(data.message || "Booking failed.");
       }
    } catch (err) {
       setError("Network error. Please try again.");
     } finally {
       setLoading(false);
     }
  };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // 3 Days advance locking logic
    const today = new Date();
    today.setHours(0,0,0,0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 3);
    const minDateStr = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;

    // Highlight selected range
    let selectedDates = [];
    if (formData.preferredDate) {
        let cur = new Date(formData.preferredDate);
        for(let i=0; i<formData.duration; i++) {
            selectedDates.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`);
            cur.setDate(cur.getDate() + 1);
        }
    }

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isPast = dateStr < minDateStr;
      const isBooked = bookedDates.includes(dateStr);
      const isSelected = selectedDates.includes(dateStr);
      const isDisabled = isPast || isBooked;

      days.push(
        <button
          key={day}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDateClick(dateStr)}
          title={isBooked ? "Fully Booked" : isPast ? "3 Days Advance Required" : "Available"}
          className={`p-2 text-sm rounded-full mx-auto w-9 h-9 flex items-center justify-center transition-all duration-200
            ${isSelected ? 'bg-pink-600 text-white font-bold shadow-md scale-110' : ''}
            ${!isSelected && !isDisabled ? 'hover:bg-pink-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200' : ''}
            ${isBooked ? 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400 cursor-not-allowed line-through font-bold' : ''}
            ${isPast && !isBooked ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}
          `}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl border dark:border-gray-700 flex flex-col max-h-[95vh]">
        
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Book Your Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar">
            {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded mb-4 text-sm font-bold">{error}</div>}
            
            <div className="mb-5 bg-pink-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm border dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300"><strong className="text-pink-600 dark:text-pink-400">Package:</strong> {preSelectedPackage}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1"><strong className="text-pink-600 dark:text-pink-400">Menu:</strong> {preSelectedDishes?.join(', ')}</p>
            </div>

            <form id="bookingForm" onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Start Date <span className="text-red-500">*</span></label>
                <div className="border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-inner transition-colors duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={handlePrevMonth} className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition p-1"><FaChevronLeft /></button>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button type="button" onClick={handleNextMonth} className="text-gray-500 hover:text-pink-600 dark:hover:text-pink-400 transition p-1"><FaChevronRight /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-bold text-gray-400 dark:text-gray-400">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendarDays()}
                  </div>
                </div>
                
                <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-pink-600"></span> Selected</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/40 border border-red-400"></span> Booked</div>
                  <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></span> Blocked (3-day advance)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                    <select name="duration" value={formData.duration} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500 transition-colors" required>
                      <option value={1}>1 Day</option>
                      <option value={2}>2 Days</option>
                      <option value={3}>3 Days</option>
                      <option value={4}>4 Days</option>
                      <option value={5}>5 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                    <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500 transition-colors" required>
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Corporate Event">Corporate Event</option>
                      <option value="Family Gathering">Family Gathering</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Total Guests</label>
                    <input 
                        type="number" 
                        name="guestCount" 
                        value={formData.guestCount} 
                        readOnly
                        className="w-full border dark:border-gray-600 bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg p-2.5 outline-none cursor-not-allowed font-bold" 
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
                <textarea name="notes" rows="2" placeholder="Theme, color motif, special requests..." value={formData.notes} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500 transition-colors"></textarea>
              </div>

            </form>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex gap-3 bg-white dark:bg-gray-800 rounded-b-xl z-10">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancel</button>
          <button type="submit" form="bookingForm" disabled={loading} className="flex-1 px-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition disabled:opacity-50">
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventFormModal;