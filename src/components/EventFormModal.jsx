import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import { regions, provinces, cities, barangays } from "select-philippines-address";

const EventFormModal = ({ isOpen, onClose, packageCapacity, packageDishLimit, preSelectedEventType, onNext }) => {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({ 
      eventType: '', preferredDate: '', eventTime: '', duration: 1, guestCount: '', notes: '' 
  });
  
  // Dynamically generates the inclusion options based on the selected package's actual limit
  const getDynamicInclusions = () => [
      `Food/Catering (${packageDishLimit || 7} Dishes)`, 
      'Tables & Chairs', 
      'Event Styling/Decoration', 
      'Lights & Sound System'
  ];

  const [inclusions, setInclusions] = useState([]); 

  const [regionList, setRegionList] = useState([]);
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [barangayList, setBarangayList] = useState([]);
  
  const [addressData, setAddressData] = useState({
      regionCode: '', regionName: '', provinceCode: '', provinceName: '', cityCode: '', cityName: '', barangayCode: '', barangayName: '', street: ''
  });

  const [bookedDates, setBookedDates] = useState([]);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData(prev => ({
        ...prev,
        eventType: preSelectedEventType || 'Wedding',
        preferredDate: '', eventTime: '', duration: 1,
        guestCount: packageCapacity || '50', 
        notes: ''
      }));
      
      setInclusions(getDynamicInclusions()); 
      setAddressData({ regionCode: '', regionName: '', provinceCode: '', provinceName: '', cityCode: '', cityName: '', barangayCode: '', barangayName: '', street: '' });
      setError(null);
      setCurrentMonth(new Date());
      
      // RESTRICT TO CALABARZON ONLY & AUTO-SELECT IT
      regions().then(response => {
          const calabarzon = response.filter(r => r.region_name.toUpperCase().includes("CALABARZON"));
          const listToUse = calabarzon.length > 0 ? calabarzon : response;
          setRegionList(listToUse);
          
          if (listToUse.length === 1) {
              const rCode = listToUse[0].region_code;
              setAddressData(prev => ({ ...prev, regionCode: rCode, regionName: listToUse[0].region_name }));
              provinces(rCode).then(res => setProvinceList(res));
          }
      });

      fetch(`${import.meta.env.VITE_API_URL}/fetch_booked_dates`)
        .then(res => res.json())
        .then(data => { if (data.success) setBookedDates(data.bookedDates); });
    }
  }, [isOpen, preSelectedEventType, packageCapacity, packageDishLimit]);

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

  const handleStreetChange = (e) => setAddressData(prev => ({...prev, street: e.target.value}));

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

  const handleInclusionToggle = (option) => {
      setInclusions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const handlePhase1Submit = (e) => {
    e.preventDefault();
    if (!formData.preferredDate) {
        setError("Please select an available date from the calendar.");
        return;
    }
    setStep(2);
  };

  const handlePhase2Submit = () => {
    if (inclusions.length === 0) {
        alert("Please select at least one inclusion to build your package.");
        return;
    }
    
    const fullLocation = `${addressData.street}, Brgy. ${addressData.barangayName}, ${addressData.cityName}, ${addressData.provinceName}, ${addressData.regionName}`;
    const finalData = {
        ...formData,
        eventLocation: fullLocation,
        inclusions: inclusions
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
        
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-pink-50 dark:bg-gray-800 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Phase {step}: {step === 1 ? 'Event Logistics' : 'Package Inclusions'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold">{error}</div>}
            
            {step === 1 ? (
                <form id="phase1Form" onSubmit={handlePhase1Submit} className="space-y-4">
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
                          <select value={addressData.regionCode} onChange={handleRegionChange} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500" required>
                              <option value="" disabled>Select Region</option>
                              {regionList.map(r => <option key={r.region_code} value={r.region_code}>{r.region_name}</option>)}
                          </select>
                          <select value={addressData.provinceCode} onChange={handleProvinceChange} disabled={!addressData.regionCode} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50" required><option value="">Select Province</option>{provinceList.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}</select>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                          <select value={addressData.cityCode} onChange={handleCityChange} disabled={!addressData.provinceCode} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50" required><option value="">Select City</option>{cityList.map(c => <option key={c.city_code} value={c.city_code}>{c.city_name}</option>)}</select>
                          <select value={addressData.barangayCode} onChange={handleBarangayChange} disabled={!addressData.cityCode} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50" required><option value="">Select Barangay</option>{barangayList.map(b => <option key={b.brgy_code} value={b.brgy_code}>{b.brgy_name}</option>)}</select>
                      </div>
                      <input type="text" value={addressData.street} onChange={handleStreetChange} placeholder="Street, House No., Building Name..." className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500" required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                        <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 h-[42px] text-sm outline-none focus:ring-2 focus:ring-pink-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                        <select name="duration" value={formData.duration} onChange={handleChange} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 h-[42px] text-sm outline-none focus:ring-2 focus:ring-pink-500" required>
                          <option value={1}>1 Day</option><option value={2}>2 Days</option><option value={3}>3 Days</option><option value={4}>4 Days</option><option value={5}>5 Days</option>
                        </select>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                        <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 h-[42px] text-sm outline-none focus:ring-2 focus:ring-pink-500" required>
                          <option value="Wedding">Wedding</option><option value="Birthday">Birthday</option><option value="Corporate Event">Corporate Event</option><option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Total Guests</label>
                        <input type="number" min="10" name="guestCount" value={formData.guestCount} onChange={handleChange} className="w-full border border-pink-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg px-3 py-2 h-[42px] text-sm font-bold outline-none focus:ring-2 focus:ring-pink-500" required />
                      </div>
                  </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Please check the services you want included in your booking. Prices will be negotiated and finalized by the admin based on your selections.
                    </p>
                    <div className="space-y-3">
                        {getDynamicInclusions().map(option => {
                            const isChecked = inclusions.includes(option);
                            return (
                                <div 
                                    key={option} 
                                    onClick={() => handleInclusionToggle(option)}
                                    className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all duration-200 ${isChecked ? 'bg-pink-50 border-pink-500 dark:bg-pink-900/30' : 'bg-gray-50 border-transparent dark:bg-gray-700 hover:border-pink-300'}`}
                                >
                                    <div className={`text-xl ${isChecked ? 'text-pink-600' : 'text-gray-400'}`}>
                                        {isChecked ? <FaCheckSquare /> : <FaRegSquare />}
                                    </div>
                                    <span className={`font-bold ${isChecked ? 'text-pink-700 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {option}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex gap-3 bg-white dark:bg-gray-800 rounded-b-xl z-10">
          {step === 1 ? (
              <>
                  <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition">Cancel</button>
                  <button type="submit" form="phase1Form" className="flex-1 px-4 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition flex items-center justify-center gap-2">
                    Next: Build Package <FaArrowRight />
                  </button>
              </>
          ) : (
              <>
                  <button type="button" onClick={() => setStep(1)} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
                    <FaChevronLeft /> Back
                  </button>
                  <button type="button" onClick={handlePhase2Submit} className="flex-[2] px-4 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition flex items-center justify-center gap-2">
                    {inclusions.some(inc => inc.startsWith('Food/Catering')) ? 'Next: Choose Menu' : 'Submit Request'} <FaArrowRight />
                  </button>
              </>
          )}
        </div>
      </div>
    </div>
  );
};
export default EventFormModal;