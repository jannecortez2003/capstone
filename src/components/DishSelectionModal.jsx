import React, { useState, useEffect } from 'react';
import { FaUtensils, FaTimes, FaArrowRight } from 'react-icons/fa';

const DishSelectionModal = ({ isOpen, onClose, packageData, onConfirm }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && packageData) {
      // Create empty slots for each required dish category
      const initialSelections = {};
      packageData.features.forEach(feature => {
        initialSelections[feature] = '';
      });
      setSelections(initialSelections);

      // Fetch the actual menu items from your backend
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

  const handleSelect = (feature, value) => {
    setSelections(prev => ({ ...prev, [feature]: value }));
  };

  const handleNext = () => {
    // Prevent user from skipping dishes
    const unselected = packageData.features.filter(f => !selections[f]);
    if (unselected.length > 0) {
      alert(`⚠️ Please select an option for: ${unselected.join(', ')}`);
      return;
    }
    
    // Pass the finalized array of dishes to the main Event Form
    const chosenDishes = Object.values(selections);
    onConfirm(chosenDishes);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl border dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaUtensils className="text-pink-500" /> Choose Your Menu
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors text-xl"><FaTimes /></button>
        </div>

        {/* Scrollable List */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
          <div className="bg-pink-50 dark:bg-gray-700/50 p-3 rounded-lg mb-5 border dark:border-gray-700 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-200 font-bold">{packageData.title} Selection</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please select one dish for each required category.</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8 font-bold animate-pulse">Loading menu options...</div>
          ) : (
            <div className="space-y-4">
              {packageData.features.map((feature, idx) => {
                // Look for menu items that match the category name (e.g., "Pork", "Chicken")
                const options = menuItems.filter(item => 
                    item.category && item.category.toLowerCase() === feature.toLowerCase()
                );

                return (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border dark:border-gray-600 transition-colors duration-300">
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                      {feature} (Choose 1) <span className="text-red-500">*</span>
                    </label>
                    {options.length > 0 ? (
                      <select 
                        value={selections[feature]} 
                        onChange={(e) => handleSelect(feature, e.target.value)}
                        className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded p-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500 transition-colors shadow-sm"
                      >
                        <option value="">-- Select {feature} Dish --</option>
                        {options.map(opt => (
                          <option key={opt.id} value={opt.name}>{opt.name}</option>
                        ))}
                      </select>
                    ) : (
                      // Backup input in case no dishes have been added to the database yet for this category
                      <input 
                        type="text"
                        placeholder={`Type preferred ${feature} dish`}
                        value={selections[feature]}
                        onChange={(e) => handleSelect(feature, e.target.value)}
                        className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded p-2 text-sm outline-none focus:ring-2 focus:ring-pink-500 transition-colors shadow-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-white dark:bg-gray-800 rounded-b-xl z-10 transition-colors duration-300">
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">Cancel</button>
          <button onClick={handleNext} className="px-6 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition flex items-center gap-2 shadow-md">
            Next <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishSelectionModal;