import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const DishSelectionModal = ({ isOpen, onClose, packageInfo, onConfirmSelection }) => {
    const dishLimit = packageInfo?.dishes || 0;
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [error, setError] = useState('');
    
    const [allDishes, setAllDishes] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_menu`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setAllDishes(data.items);
                    } else {
                        console.error("Failed to load menu items");
                    }
                })
                .catch(err => console.error("Error fetching menu:", err));
        }
    }, [isOpen]);

    const allowedCategories = ["Appetizer", "Main Course", "Dessert"];

    const dishesByCategory = allDishes
        .filter(dish => allowedCategories.includes(dish.category))
        .reduce((acc, dish) => {
            const { category } = dish;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(dish);
            return acc;
        }, {});

    const handleDishToggle = (dishId) => {
        const id = parseInt(dishId);
        const isSelected = selectedDishes.includes(id);
        setError('');

        if (isSelected) {
            setSelectedDishes(selectedDishes.filter(item => item !== id));
        } else if (selectedDishes.length < dishLimit) {
            setSelectedDishes([...selectedDishes, id]);
        } else {
            setError(`Limit reached. You can only select ${dishLimit} dishes for the ${packageInfo.title}.`);
        }
    };

    const handleConfirm = () => {
        if (selectedDishes.length !== dishLimit) {
            setError(`Action blocked. You must select exactly ${dishLimit} dishes.`);
            return;
        }
        
        const selectedNames = selectedDishes.map(id => {
            const dish = allDishes.find(d => parseInt(d.id) === id);
            return dish ? dish.name : "Unknown Dish";
        });

        onConfirmSelection(packageInfo.title, selectedNames);
        onClose(); 
    };
    
    const confirmButtonDisabled = selectedDishes.length !== dishLimit;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={null} 
            size="max-w-4xl" 
        >
            <div className="bg-pink-500 rounded-lg shadow-lg p-6 relative">
                
                <button
                    className="absolute top-3 right-3 bg-white  p-2 text-gray-600 hover:text-red-600 rounded-full"
                    onClick={onClose}
                    aria-label="Close"
                >
                    &times;
                </button>
                
                <div className="p-2">
                    
                    <div className="text-center mb-6 text-white">
                        <h3 className="text-2xl font-bold">
                            Dish Selection for {packageInfo?.title || ''}
                        </h3>
                        <p className="text-lg mt-2">
                            You must select exactly <span className="font-extrabold text-white text-3xl">{dishLimit}</span> dishes.
                        </p>
                        <p className="text-sm">
                            Selected: <span className="font-semibold">{selectedDishes.length} / {dishLimit}</span>
                        </p>
                        {error && <div className="text-red-200 mt-2 text-sm font-semibold">{error}</div>}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto space-y-8 p-4 rounded-lg bg-white shadow-inner">
                        {allDishes.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">Loading menu items...</p>
                        ) : Object.keys(dishesByCategory).length === 0 ? (
                             <p className="text-center text-gray-500 py-10">No dishes available in the selected categories.</p>
                        ) : (
                            allowedCategories.map((category) => {
                                const dishes = dishesByCategory[category];
                                if (!dishes) return null;

                                return (
                                    <div key={category}>
                                        <h4 className="text-lg font-bold text-pink-600 border-b-2 border-pink-100 pb-1 mb-3 uppercase tracking-wider">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {dishes.map((dish) => {
                                                const dishId = parseInt(dish.id);
                                                const isSelected = selectedDishes.includes(dishId);
                                                const isDisabled = selectedDishes.length >= dishLimit && !isSelected;
                                                
                                                const dishClasses = isSelected 
                                                    ? 'bg-pink-600 text-white border-pink-700 shadow-md transform scale-105' 
                                                    : isDisabled 
                                                        ? 'bg-gray-200 text-gray-500 border-gray-300 opacity-60'
                                                        : 'bg-white text-gray-700 hover:bg-pink-100 border-gray-300 hover:border-pink-500';

                                                return (
                                                    <button
                                                        key={dishId}
                                                        onClick={() => handleDishToggle(dishId)}
                                                        className={`p-3 rounded-lg text-sm font-medium transition duration-200 border text-center ${dishClasses}`}
                                                        disabled={isDisabled}
                                                    >
                                                        {dish.name} {isSelected && '✓'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleConfirm}
                            disabled={confirmButtonDisabled}
                            className={`w-full py-3 rounded-lg text-pink-600 bg-white font-bold transition duration-300 shadow-lg border border-white ${confirmButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        >
                            {confirmButtonDisabled 
                                ? `Please Select ${dishLimit - selectedDishes.length} More Dish(es)`
                                : 'Confirm Selection and Proceed'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default DishSelectionModal;