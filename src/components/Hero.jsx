import React from 'react';
import cateringImage from "../assets/pic1.jpg";

const Hero = ({ handleHeroBooking }) => {
  return (
    <section id="hero" className="bg-pink-100 dark:bg-gray-900 py-12 pt-24 transition-colors duration-300">
      <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">
            Delicious Catering for Your Special Events
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">
            Mommy Rosal Catering Services provides exceptional food and service for weddings, birthdays, corporate events, and more.
          </p>
          <div className="space-x-4">
            <button 
              onClick={handleHeroBooking}
              className="bg-pink-600 text-white font-bold px-6 py-3 rounded-full hover:bg-pink-700 transition shadow-md shadow-pink-200 dark:shadow-none"
            >
              Book an Event
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          {/* Transparent Magic! mix-blend-multiply removes the white background */}
          <img 
            src={cateringImage} 
            alt="Catering" 
            className="w-full max-w-md rounded-2xl shadow-xl dark:shadow-gray-800/50 mix-blend-multiply dark:mix-blend-normal object-cover" 
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;