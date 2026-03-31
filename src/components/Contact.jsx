import React from "react";
import { FaPhone, FaEnvelope, FaUser } from "react-icons/fa";

const Contact = () => {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10">
        
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            Have questions or ready to book your event? Get in touch with us and we'll help you plan the perfect catering experience.
          </p>
          <div className="space-y-4 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <FaUser className="text-pink-600" /> <strong>Mommy Rosal</strong> – Owner & Head Chef
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-pink-600" /> +1 (123) 456-7890
            </p>
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-pink-600" /> contact@mommyrosalcatering.com
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
