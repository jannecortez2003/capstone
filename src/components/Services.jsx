import React from "react";
import { FaCalendarCheck, FaClipboardList, FaComments } from "react-icons/fa";

const services = [
  {
    title: "Easy Reservations",
    description: "Book your event with just a few clicks and receive instant confirmation.",
    icon: <FaCalendarCheck className="text-pink-500 text-3xl" />,
  },
  {
    title: "Live Chatting",
    description: "Chat with our team in real-time for quick assistance and personalized support.",
    icon: <FaComments className="text-pink-500 text-3xl" />,
  },
  {
    title: "Event Planning",
    description: "Get help with planning your event, from venue selection to decoration.",
    icon: <FaClipboardList className="text-pink-500 text-3xl" />,
  },
];

const Services = () => {
  return (
    // Alternating background to dark:bg-gray-800 to separate it from the Hero section
    <section id="services" className="py-16 bg-pink-100 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Added dark:text-white */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-10 text-center transition-colors duration-300">
          Our Services
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            // Changed card bg to dark:bg-gray-900 and updated the border to dark:border-pink-500
            <div 
              key={index} 
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-900 hover:shadow-md p-6 flex items-center gap-4 transition-all duration-300 border-l-4 border-pink-300 dark:border-pink-500"
            >
              {/* Changed icon bubble background to dark:bg-gray-800 */}
              <div className="bg-pink-50 dark:bg-gray-800 p-3 rounded-full shrink-0 transition-colors duration-300">
                {service.icon}
              </div>
              
              {/* Text Content */}
              <div>
                {/* Updated Title Text */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 transition-colors duration-300">
                  {service.title}
                </h3>
                {/* Updated Description Text */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-snug transition-colors duration-300">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;