import React from 'react';
import cateringImage from "../assets/pic1.jpg";

const Hero = ({ isLoggedIn, setActiveForm, startBookingFlow }) => {
  return (
    <section id="hero" className="bg-pink-100 py-12 pt-24">
      <div className="container mx-auto px-4 grid md:grid-cols-2 items-center gap-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Delicious Catering for Your Special Events
          </h2>
          <p className="text-gray-700 mb-6">
            Mommy Rosal Catering Services provides exceptional food and service for weddings, birthdays, corporate events, and more.
          </p>
          <div className="space-x-4">
            <button 
              onClick={startBookingFlow}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              Book an Event
            </button>
          </div>
        </div>
        <div>
          <img src={cateringImage} alt="Catering" className="rounded-lg shadow-lg" />
        </div>
      </div>
    </section>
  );
};

export default Hero;