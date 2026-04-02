import React, { useState, useEffect } from 'react';

const EventFormModal = ({ isOpen, onClose, userId, preSelectedPackage, preSelectedDishes, onBookingSuccess, preSelectedEventType }) => {
  const [formData, setFormData] = useState({ eventType: '', preferredDate: '', guestCount: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        eventType: preSelectedEventType || 'Wedding',
        preferredDate: '', guestCount: '', notes: ''
      }));
      setError(null);
    }
  }, [isOpen, preSelectedEventType]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/book_event`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, packageType: preSelectedPackage, selectedDishes: preSelectedDishes.join(', '), ...formData }),
      });
      const data = await res.json();
      if (data.success) { onBookingSuccess("Your event has been successfully booked! Please wait for admin confirmation."); } 
      else { setError(data.message || "Booking failed."); }
    } catch (err) { setError("Network error. Please try again."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl border dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Book Your Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
            {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded mb-4 text-sm font-bold">{error}</div>}
            
            {/* Package Summary */}
            <div className="mb-4 bg-pink-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm border dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300"><strong className="text-pink-600 dark:text-pink-400">Package:</strong> {preSelectedPackage}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-1"><strong className="text-pink-600 dark:text-pink-400">Menu:</strong> {preSelectedDishes?.join(', ')}</p>
            </div>

            <form id="bookingForm" onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500 transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Guests</label>
                    <input type="number" name="guestCount" placeholder="e.g. 100" value={formData.guestCount} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500 transition-colors" required />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Additional Notes</label>
                <textarea name="notes" rows="2" placeholder="Theme, color motif, special requests..." value={formData.notes} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500 transition-colors"></textarea>
              </div>
            </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex gap-3">
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