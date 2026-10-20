import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaArrowRight } from 'react-icons/fa';
import { regions, provinces, cities, barangays } from "select-philippines-address";

const EventFormModal = ({ isOpen, onClose, preSelectedPackage, packageCapacity, preSelectedEventType, onNext }) => {
  const [formData, setFormData] = useState({ 
      eventType: '', serviceType: 'Food and Decoration', preferredDate: '', eventTime: '', duration: 1, guestCount: '', notes: '' 
  });
  
  const [regionList, setRegionList] = useState([]);
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [barangayList, setBarangayList] = useState([]);
  
  const [addressData, setAddressData] = useState({
      regionCode: '', regionName: '',
      provinceCode: '', provinceName: '',
      cityCode: '', cityName: '',
      barangayCode: '', barangayName: '',
      street: ''
  });

  const [bookedDates, setBookedDates] = useState([]);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        eventType: preSelectedEventType || 'Wedding',
        serviceType: 'Food and Decoration',
        preferredDate: '', eventTime: '',
        duration: 1,
        guestCount: packageCapacity || '', 
        notes: ''
      }));
      setAddressData({
        regionCode: '', regionName: '', provinceCode: '', provinceName: '', cityCode: '', cityName: '', barangayCode: '', barangayName: '', street: ''
      });
      setError(null);
      setCurrentMonth(new Date());
      
      regions().then(response => setRegionList(response));

      fetch(`${import.meta.env.VITE_API_URL}/fetch_booked_dates`)
        .then(res => res.json())
        .then(data => { if (data.success) setBookedDates(data.bookedDates); })
        .catch(err => console.error("Failed to load booked dates", err));
    }
  }, [isOpen, preSelectedEventType, packageCapacity]);

  if (!isOpen) return null;

  const handleRegionChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressData(prev => ({...prev, regionCode: code, regionName: name, provinceCode: '', provinceName: '', cityCode: '', cityName: '', barangayCode: '', barangayName: ''}));
    provinces(code).then(response => setProvinceList(response));
    setCityList([]); setBarangayList([]);
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressData(prev => ({...prev, provinceCode: code, provinceName: name, cityCode: '', cityName: '', barangayCode: '', barangayName: ''}));
    cities(code).then(response => setCityList(response));
    setBarangayList([]);
  };

  const handleCityChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressData(prev => ({...prev, cityCode: code, cityName: name, barangayCode: '', barangayName: ''}));
    barangays(code).then(response => setBarangayList(response));
  };

  const handleBarangayChange = (e) => {
    const code = e.target.value;
    const name = e.target.options[e.target.selectedIndex].text;
    setAddressData(prev => ({...prev, barangayCode: code, barangayName: name}));
  };

  const handleStreetChange = (e) => {
    setAddressData(prev => ({...prev, street: e.target.value}));
  };

  const handleDateClick = (dateStr) => {
    let cur = new Date(dateStr);
    let isValid = true;
    for(let i=0; i<formData.duration; i++) {
        let checkStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        if (bookedDates.includes(checkStr)) { isValid = false; break; }
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
            if (bookedDates.includes(checkStr)) { isValid = false; break; }
            cur.setDate(cur.getDate() + 1);
        }
        if (!isValid) {
            setError(`Extending to ${value} days overlaps with an existing booking.`);
            newData.preferredDate = ''; 
        } else { setError(null); }
    }
    setFormData(newData);
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    if (!formData.preferredDate) {
        setError("Please select an available date from the calendar.");
        return;
    }
    
    const fullLocation = `${addressData.street}, Brgy. ${addressData.barangayName}, ${addressData.cityName}, ${addressData.provinceName}, ${addressData.regionName}`;
    
    const finalData = {
        ...formData,
        eventLocation: fullLocation
    };

    onNext(finalData);
  };

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();
    today.setHours(0,0,0,0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 3);
    const minDateStr = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;
    
    let selectedDates = [];
    if (formData.preferredDate) {
        let cur = new Date(formData.preferredDate);
        for(let i=0; i<formData.duration; i++) {
            selectedDates.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`);
            cur.setDate(cur.getDate() + 1);
        }
    }

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="p-2"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = dateStr < minDateStr;
      const isBooked = bookedDates.includes(dateStr);
      const isSelected = selectedDates.includes(dateStr);
      const isDisabled = isPast || isBooked;

      days.push(
        <button
          key={day} type="button" disabled={isDisabled} onClick={() => handleDateClick(dateStr)}
          className={`p-2 text-sm rounded-full mx-auto w-9 h-9 flex items-center justify-center transition-all duration-200 
            ${isSelected ? 'bg-pink-600 text-white font-bold shadow-md scale-110' : ''} 
            ${!isSelected && !isDisabled ? 'hover:bg-pink-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200' : ''} 
            ${isBooked ? 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400 cursor-not-allowed line-through font-bold' : ''} 
            ${isPast && !isBooked ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''}`}
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
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Step 1: Event Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold">{error}</div>}
            
            <form id="eventDetailsForm" onSubmit={handleNextClick} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Select Date <span className="text-red-500">*</span></label>
                <div className="border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={handlePrevMonth} className="text-gray-500 hover:text-pink-600 p-1"><FaChevronLeft /></button>
                    <span className="font-bold text-gray-800 dark:text-white">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button type="button" onClick={handleNextMonth} className="text-gray-500 hover:text-pink-600 p-1"><FaChevronRight /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-bold text-gray-400">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
                </div>
              </div>

              <div className="border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-inner">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Event Location <span className="text-red-500">*</span></label>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                      <select value={addressData.regionCode} onChange={handleRegionChange} className="w-full border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-pink-500" required>
                          <option value="">Select Region</option>
                          {regionList.map(r => <option key={r.region_code} value={r.region_code}>{r.region_name}</option>)}
                      </select>
                      
                      <select value={addressData.provinceCode} onChange={handleProvinceChange} disabled={!addressData.regionCode} className="w-full border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50" required>
                          <option value="">Select Province</option>
                          {provinceList.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}
                      </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                      <select value={addressData.cityCode} onChange={handleCityChange} disabled={!addressData.provinceCode} className="w-full border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50" required>
                          <option value="">Select City</option>
                          {cityList.map(c => <option key={c.city_code} value={c.city_code}>{c.city_name}</option>)}
                      </select>
                      
                      <select value={addressData.barangayCode} onChange={handleBarangayChange} disabled={!addressData.cityCode} className="w-full border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50" required>
                          <option value="">Select Barangay</option>
                          {barangayList.map(b => <option key={b.brgy_code} value={b.brgy_code}>{b.brgy_name}</option>)}
                      </select>
                  </div>

                  <input type="text" value={addressData.street} onChange={handleStreetChange} placeholder="Street, House No., Building Name..." className="w-full border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                    <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                    <select name="duration" value={formData.duration} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500" required>
                      <option value={1}>1 Day</option><option value={2}>2 Days</option><option value={3}>3 Days</option>
                    </select>
                  </div>
              </div>

              {/* NEW: SERVICE TYPE DROPDOWN */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                    <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5" required>
                      <option value="Wedding">Wedding</option><option value="Birthday">Birthday</option><option value="Corporate Event">Corporate Event</option><option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Service Type</label>
                    <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-pink-500" required>
                      <option value="Food and Decoration">Food and Decoration</option>
                      <option value="Food Service Only">Food Service Only</option>
                    </select>
                    {formData.serviceType === 'Food Service Only' && (
                        <p className="text-[10px] text-orange-500 font-bold mt-1 leading-tight">
                            * Tables, chairs, and styling assets are excluded.
                        </p>
                    )}
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Guests</label>
                  <input type="number" name="guestCount" value={formData.guestCount} readOnly className="w-full border dark:border-gray-600 bg-gray-200 dark:bg-gray-600 text-gray-500 rounded-lg p-2.5 cursor-not-allowed font-bold" />
              </div>

            </form>
        </div>
        <div className="p-4 border-t dark:border-gray-700 flex gap-3 bg-white dark:bg-gray-800 rounded-b-xl z-10">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition">Cancel</button>
          <button type="submit" form="eventDetailsForm" className="flex-1 px-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition flex items-center justify-center gap-2">
            Next: Choose Menu <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};
export default EventFormModal;