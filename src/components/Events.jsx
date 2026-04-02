import React from 'react';
import weddingImg from '../assets/wedding.jpg';
import birthdayImg from '../assets/birthday.jpg';
import corporateImg from '../assets/corporate.jpg';
import familyImg from '../assets/family.jpg';

const events = [
  { title: "Wedding", image: weddingImg },
  { title: "Birthday", image: birthdayImg },
  { title: "Corporate Event", image: corporateImg },
  { title: "Family Gathering", image: familyImg },
];

const Events = ({ handleEventSelection }) => {
  return (
    <section id="events" className="py-16 bg-pink-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Events We Cater</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">We provide exceptional catering for a wide variety of special occasions.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border dark:border-gray-700">
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
              <div className="p-4 flex flex-col flex-grow text-center">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-lg transition-colors duration-300">{event.title}</h3>
                <div className="mt-auto">
                  <button 
                    onClick={() => handleEventSelection(event.title)} 
                    className="bg-pink-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-gray-600 w-full py-2 rounded font-bold hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white transition-colors duration-300"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;