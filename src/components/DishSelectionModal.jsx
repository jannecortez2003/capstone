import React, { useState, useEffect } from 'react';
import { FaUtensils, FaTimes, FaArrowRight, FaCheck } from 'react-icons/fa';

const DishSelectionModal = ({ isOpen, onClose, packageData, onConfirm }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const limit = packageData?.dishLimit || 7;

  useEffect(() => {
    if (isOpen) {
      setSelectedDishes([]); // Reset selections when modal opens
      fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_menu`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMenuItems(data.items);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load menu", err);
          setLoading(false);
        });
    }
  }, [isOpen, packageData]);

  if (!isOpen || !packageData) return null;

  // Toggle selection
  const handleToggleDish = (dishName) => {
    if (selectedDishes.includes(dishName)) {
      // If already selected, remove it
      setSelectedDishes(selectedDishes.filter(d => d !== dishName));
    } else {
      // If not selected, check limit before adding
      if (selectedDishes.length >= limit) {
        alert(`You can only select up to ${limit} dishes for ${packageData.title}.`);
        return;
      }
      setSelectedDishes([...selectedDishes, dishName]);
    }
  };

  const handleNext = () => {
    if (selectedDishes.length < limit) {
      alert(`Please select exactly ${limit} dishes. You still need ${limit - selectedDishes.length} more.`);
      return;
    }
    // Pass the finalized array of dishes to the main Event Form
    onConfirm(selectedDishes);
  };

  // Group menu items by their category for a clean UI
  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border dark:border-gray-700 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 bg-pink-50 dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaUtensils className="text-pink-500" /> Build Your Menu
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {packageData.title}: Select <strong>{limit}</strong> items from the options below.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors text-xl"><FaTimes /></button>
        </div>

        {/* Progress Bar Area */}
        <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-gray-700 dark:text-gray-300">Selected Dishes</span>
            <span className={`${selectedDishes.length === limit ? 'text-green-500' : 'text-pink-500'}`}>
              {selectedDishes.length} / {limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${selectedDishes.length === limit ? 'bg-green-500' : 'bg-pink-500'}`} 
              style={{ width: `${(selectedDishes.length / limit) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Scrollable Menu List */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-gray-50 dark:bg-gray-900/50">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8 font-bold animate-pulse">Loading amazing food...</div>
          ) : Object.keys(groupedMenu).length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">No menu items found. Please ask admin to add dishes.</div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedMenu).map((category, idx) => (
                <div key={idx}>
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 border-b-2 border-pink-200 dark:border-pink-500/30 pb-1 inline-block">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupedMenu[category].map(item => {
                      const isSelected = selectedDishes.includes(item.name);
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => handleToggleDish(item.name)}
                          className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between
                            ${isSelected 
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-sm' 
                              : 'border-transparent bg-white dark:bg-gray-800 shadow-sm hover:border-pink-300 dark:hover:border-gray-600'}
                          `}
                        >
                          <div>
                            <p className={`font-bold text-sm ${isSelected ? 'text-pink-700 dark:text-pink-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                            ${isSelected ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-300 dark:border-gray-600'}
                          `}>
                            {isSelected && <FaCheck className="text-xs" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-b-xl z-10">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            Cancel
          </button>
          
          <button 
            onClick={handleNext} 
            disabled={selectedDishes.length < limit}
            className={`px-8 py-2.5 font-bold rounded-lg transition flex items-center gap-2 shadow-md
              ${selectedDishes.length === limit 
                ? 'bg-pink-600 text-white hover:bg-pink-700 cursor-pointer' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Confirm Menu <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishSelectionModal;