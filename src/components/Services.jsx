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
    <section id="services" className="py-16 bg-pink-100">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 text-center">Our Services</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            // Dashboard Card UI Style applied here
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 flex items-center gap-4 transition border-l-4 border-pink-300"
            >
              {/* Icon Container (Bubble) */}
              <div className="bg-pink-50 p-3 rounded-full shrink-0">
                {service.icon}
              </div>
              
              {/* Text Content */}
              <div>
                <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-snug">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;