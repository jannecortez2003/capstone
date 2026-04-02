import React from 'react';
import cateringImage from "../assets/pic1.jpg";

const Hero = ({ isLoggedIn, setActiveForm, startBookingFlow }) => {
  return (
    // Added dark:bg-gray-900 and transition
    <section id="hero" className="bg-pink-100 dark:bg-gray-900 py-12 pt-24 transition-colors duration-300">
      <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-10">
        <div>
          {/* Added dark:text-white */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">
            Delicious Catering for Your Special Events
          </h2>
          {/* Added dark:text-gray-300 */}
          <p className="text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">
            Mommy Rosal Catering Services provides exceptional food and service for weddings, birthdays, corporate events, and more.
          </p>
          <div className="space-x-4">
            <button 
              onClick={startBookingFlow}
              // Button stays pink, but slightly adjustments can be made if needed. Pink looks great in dark mode!
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
            >
              Book an Event
            </button>
          </div>
        </div>
        <div>
          {/* Added dark:shadow-gray-800/50 to the image shadow */}
          <img src={cateringImage} alt="Catering" className="rounded-lg shadow-lg dark:shadow-gray-800/50" />
        </div>
      </div>
    </section>
  );
};

export default Hero;