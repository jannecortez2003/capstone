import React, { useState } from 'react';
import Modal from './Modal'; 
import DishSelectionModal from './DishSelectionModal'; 

const packagesData = [
  {
    title: 'Package 1',
    dishes: 4,
    pax: 50,
    description: 'Perfect for smaller gatherings. Choose any 4 dishes from our specialty menu.',
    features: [
      'Professional Staff',
      'Setup & Cleanup',
      'Quality Tableware',
    ],
    highlight: 'Included with 50 Pax Package',
  },
  {
    title: 'Package 2',
    dishes: 7,
    pax: 100,
    description: 'Ideal for medium-sized events. Choose any 7 dishes from our specialty menu.',
    features: [
      'Professional Staff',
      'Setup & Cleanup',
      'Quality Tableware',
    ],
    highlight: 'Included with 100 Pax Package',
  },
  {
    title: 'Package 3',
    dishes: 10,
    pax: 200,
    description: 'Perfect for large celebrations. Choose any 10 dishes from our specialty menu.',
    features: [
      'Professional Staff',
      'Setup & Cleanup',
      'Quality Tableware',
    ],
    highlight: 'Included with 200 Pax Package',
  },
];

const PackageCard = ({ title, description, price, guests, features, isLoggedIn, setActiveForm, onChoose }) => {
  const handleChoosePackage = () => {
    if (!isLoggedIn) {
      setActiveForm('login');
    } else {
      onChoose(title);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center justify-between">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        {price && <p className="text-4xl font-extrabold text-pink-600 mb-4">{price}</p>}
        {guests && <p className="text-gray-500 mb-6">{guests} guests</p>}
        <ul className="text-left text-gray-700 space-y-2 w-full mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-pink-500 mr-2">&#x2192;</span> {feature}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleChoosePackage}
        className={`mt-auto bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition duration-300 ease-in-out transform hover:-translate-y-1 ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        Choose Package
      </button>
    </div>
  );
};


const Packages = ({ isLoggedIn, setActiveForm, isOpen, onClose, onConfirmBooking, startBookingFlow }) => {
  const [showDishModal, setShowDishModal] = useState(false);
  const [selectedPackageData, setSelectedPackageData] = useState(null);  

  const cardsData = [
    {
      title: '50 Pax Package',
      description: 'Perfect for intimate gatherings',
      price: '₱45,000',
      guests: '50',
      features: [
        'Event set up',
        'Table and chairs',
        'Foods and beverage',
        'Waiter and staff',
        'Sound system',
      ],
    },
    {
      title: '100 Pax Package',
      description: 'Ideal for medium-sized events',
      price: '₱95,000',
      guests: '100',
      features: [
        'Event set up',
        'Table and chairs',
        'Foods and beverage',
        'Waiter and staff',
        'Sound system',
        'Photobooth',
        'Dessert station',
      ],
    },
    {
      title: '200 Pax Package',
      description: 'Perfect for large celebrations',
      price: '₱150,000',
      guests: '200',
      features: [
        'Event set up',
        'Table and chairs',
        'Foods and beverage',
        'Waiter and staff',
        'Sound system',
        'Photobooth',
        'Dessert station',
        'Videographer',
        'Souvenirs',
        'Ice cream booth',
      ],
    },
  ];

  const handleChoose = (pkgTitle) => {
    startBookingFlow();
  };
  
  const handleSelectPackageOption = (pkgTitle) => {
      const specificPkgData = packagesData.find(p => p.title === pkgTitle); 

      if (specificPkgData) {
          setSelectedPackageData(specificPkgData);
          onClose();
          setShowDishModal(true); 
      }
  };
  
  const handleConfirmSelection = (pkgTitle, selectedDishes) => {
      setShowDishModal(false);
      onConfirmBooking(selectedPackageData, selectedDishes);
  };


  return (
    <>
      {!isOpen && (
          <section id="packages" className="py-16 bg-pink-100">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">Our Packages</h2>
              <p className="text-xl text-center text-gray-600 mb-12">Choose the perfect package for your event</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cardsData.map((pkg, index) => (
                  <PackageCard
                    key={index}
                    {...pkg}
                    isLoggedIn={isLoggedIn}
                    setActiveForm={setActiveForm}
                    onChoose={handleChoose}
                  />
                ))}
              </div>
            </div>
          </section>
      )}


      <Modal
        isOpen={isOpen}
        onClose={onClose} 
        title={null} 
        size="max-w-6xl" 
      >
        <div className="bg-[#f7f8fa] rounded-2xl p-8 shadow-2xl">
          
          <div className="flex gap-8 items-center border-b border-gray-200 pb-2 mb-6">
            <span className="text-pink-600 text-xl font-bold border-b-2 border-pink-500 pb-1">Package Options</span> 
            <span className="ml-auto text-gray-400 text-2xl cursor-pointer hover:text-red-500 transition" onClick={onClose}>&times;</span> 
          </div>
          
          <p className="mb-8 text-gray-700 text-center text-base">
            Choose from our carefully crafted packages designed to meet your event needs. Each package includes a selection of our finest dishes.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {packagesData.map((pkg, idx) => (
              <div
                key={idx}
                className="bg-white border border-pink-200 rounded-xl p-6 flex-1 max-w-sm shadow-lg flex flex-col items-center hover:shadow-xl transition-shadow" 
              >
                <h4 className="text-xl font-extrabold text-pink-600 mb-2">{pkg.title}</h4> 
                <div className="text-pink-500 font-semibold mb-3">
                  Select any {pkg.dishes} dishes
                </div>
                <p className="mb-4 text-gray-700 text-sm text-center">{pkg.description}</p>
                
                <ul className="mb-4 list-none pl-0 text-gray-700 text-left w-full text-sm space-y-1">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-pink-800">
                        <span className="mr-2 text-pink-400">✓</span> {feature}
                    </li> 
                  ))}
                </ul>
                
                <div className="mb-4 w-full text-center mt-auto">
                  <span className="inline-block bg-green-100 border border-green-400 text-green-700 font-bold text-xs rounded-full px-3 py-1 shadow-sm">
                    {pkg.highlight}
                  </span>
                </div>
                
                <button
                  className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition mt-2 text-base font-semibold"
                  onClick={() => handleSelectPackageOption(pkg.title)} 
                >
                  Select This Package
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      
      <DishSelectionModal
          isOpen={showDishModal}
          onClose={() => setShowDishModal(false)}
          packageInfo={selectedPackageData}
          onConfirmSelection={handleConfirmSelection}
      />
    </>
  );
};

export default Packages;  