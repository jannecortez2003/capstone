import React from "react";
import weddingImg from "../assets/wedding.jpg";
import birthdayImg from "../assets/birthday.jpg";
import corporateImg from "../assets/corporate.jpg";
import anniversaryImg from "../assets/anniversary.jpg";
import familyImg from "../assets/family.jpg";
import specialImg from "../assets/special.jpg";

const events = [
  {
    title: "Weddings",
    description: "Customized catering services for your wedding with special menu options.",
    image: weddingImg,
  },
  {
    title: "Birthdays",
    description: "Customized catering services for your birthdays with special menu options.",
    image: birthdayImg,
  },
  {
    title: "Corporate Events",
    description: "Customized catering services for your corporate events with special menu options.",
    image: corporateImg,
  },
  {
    title: "Anniversaries",
    description: "Customized catering services for your anniversaries with special menu options.",
    image: anniversaryImg,
  },
  {
    title: "Family Gatherings",
    description: "Customized catering services for your family gatherings with special menu options.",
    image: familyImg,
  },
  {
    title: "Special Occasions",
    description: "Customized catering services for your special occasions with special menu options.",
    image: specialImg,
  },
];

const Events = ({ isLoggedIn, setActiveForm, startBookingFlow }) => {
  const handleBookNow = () => {
    startBookingFlow();
  };

  return (
    <section id="events" className="bg-pink-100 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10">Events We Cater</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition"
            >
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
              <div className="p-4 text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                <button 
                  onClick={handleBookNow}
                  className="text-sm text-white bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;