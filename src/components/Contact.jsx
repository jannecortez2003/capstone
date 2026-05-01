import React from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram } from "react-icons/fa";

const Contact = () => {
  return (
    <section id="contact" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Get in Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
            Have questions about our catering services? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-pink-100 dark:bg-gray-800 p-4 rounded-full text-pink-600 dark:text-pink-400 transition-colors duration-300">
                <FaMapMarkerAlt className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white text-lg transition-colors duration-300">Our Location</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">Batangas St, Brgy Casile 4024 <br />Binan, Laguna</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-pink-100 dark:bg-gray-800 p-4 rounded-full text-pink-600 dark:text-pink-400 transition-colors duration-300">
                <FaPhoneAlt className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white text-lg transition-colors duration-300">Phone Number</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">0998-925-9338</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-pink-100 dark:bg-gray-800 p-4 rounded-full text-pink-600 dark:text-pink-400 transition-colors duration-300">
                <FaEnvelope className="text-xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-white text-lg transition-colors duration-300">Email Address</h4>
                <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">laurencetenido1@gmail.com</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
              <h4 className="font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-600 dark:text-gray-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition">
                  <FaFacebook className="text-xl" />
                </a>
                <a href="#" className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full text-gray-600 dark:text-gray-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition">
                  <FaInstagram className="text-xl" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-pink-50 dark:bg-gray-800 rounded-2xl p-8 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-300">Send a Message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-pink-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-pink-400 transition-colors duration-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-lg border border-pink-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-pink-400 transition-colors duration-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Message</label>
                <textarea rows="4" placeholder="How can we help you?" className="w-full px-4 py-3 rounded-lg border border-pink-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-pink-400 transition-colors duration-300"></textarea>
              </div>
              <button type="button" className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition shadow-md">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;