import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaUserFriends } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from './Modal'; 

const EventFormModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  preSelectedPackage, 
  preSelectedDishes,
  onBookingSuccess 
}) => {
  const [formData, setFormData] = useState({
    eventType: '',
    packageType: preSelectedPackage || '', 
    preferredDate: new Date(),
    guestCount: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookedDates, setBookedDates] = useState([]); 

  useEffect(() => {
    if (isOpen) {
      const apiUrl = import.meta.env.VITE_API_URL;
      fetch(`${apiUrl}/fetch_booked_dates`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setBookedDates(data.bookedDates);
          }
        })
        .catch(err => console.error("Error fetching booked dates:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      packageType: preSelectedPackage || '',
    }));
  }, [preSelectedPackage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isTileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) return true;

      const dateString = date.toLocaleDateString('en-CA'); 
      return bookedDates.includes(dateString);
    }
    return false;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    const finalPackageType = formData.packageType || preSelectedPackage;
    const formattedDate = formData.preferredDate.toLocaleDateString('en-CA');

    if (!formData.eventType || !finalPackageType || !formattedDate || !formData.guestCount) {
      alert("Please fill out all required fields.");
      return;
    }
    
    setLoading(true);

    const payload = { 
      ...formData, 
      preferredDate: formattedDate,
      packageType: finalPackageType,
      selectedDishes: preSelectedDishes.join('; '),
      userId: userId, 
      notes: notes
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/book_event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Booking submission failed.");
      }

      onBookingSuccess(data.message); 

    } catch (error) {
      console.error("Booking submission error:", error);
      alert("Submission failed: " + error.message);
    } finally {
        setLoading(false);
    }
  };
    
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} size="max-w-xl">
        <div className="bg-pink-500 rounded-lg shadow-lg p-6 relative">
            <button
                className="absolute top-3 right-3 bg-white rounded-full p-1 text-gray-600 hover:text-red-600 z-10"
                onClick={onClose}
                aria-label="Close"
            >
                &times;
            </button>

            <div className="p-2 text-white">
                <h2 className="text-2xl font-bold text-center mb-6">Book Your Event</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-pink-600 p-4 rounded-md shadow-inner mb-4">
                        <p className="text-lg font-semibold mb-1">
                            Package: <span className="font-extrabold">{preSelectedPackage || 'Not Selected'}</span>
                        </p>
                        <p className="text-sm italic">
                            Dishes: {preSelectedDishes && preSelectedDishes.length > 0 ? preSelectedDishes.join(', ') : 'No dishes selected'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="eventType" className="block text-sm font-medium mb-1">Event Type</label>
                            <select
                                id="eventType"
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md bg-white text-gray-800 border-gray-300 focus:ring-pink-400"
                                required
                            >
                                <option value="">Select Event Type</option>
                                <option value="wedding">Wedding</option>
                                <option value="birthday">Birthday</option>
                                <option value="corporate">Corporate</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="guestCount" className="block text-sm font-medium mb-1">Number of Guests</label>
                            <div className="relative">
                                <FaUserFriends className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    id="guestCount"
                                    name="guestCount"
                                    value={formData.guestCount}
                                    onChange={handleChange}
                                    placeholder="Number of guests"
                                    className="w-full p-2 rounded-md bg-white text-gray-800 border-gray-300 pl-10 focus:ring-pink-400"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                           <FaCalendarAlt /> Select Preferred Date
                        </label>
                        <div className="calendar-container bg-white rounded-md p-2 flex justify-center shadow-md">
                            <Calendar
                                onChange={(date) => setFormData({ ...formData, preferredDate: date })}
                                value={formData.preferredDate}
                                minDate={new Date()}
                                tileDisabled={isTileDisabled}
                                className="w-full border-none rounded-md text-gray-800"
                            />
                        </div>
                        <p className="text-xs text-pink-100 mt-2 italic">
                            * Grayed out dates are already booked or in the past.
                        </p>
                    </div>
                    
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium mb-1">Additional Notes</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="2"
                            placeholder="e.g., allergies, special requests"
                            className="w-full p-2 rounded-md bg-white text-gray-800 border-gray-300 focus:ring-pink-400"
                        ></textarea>
                    </div>

                    <div className="text-center pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-pink-600 font-bold py-3 px-6 rounded-md text-lg hover:bg-gray-100 transition duration-300 shadow-md disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Confirm My Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Modal>
  );
};

export default EventFormModal;