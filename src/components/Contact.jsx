import React, { useState, useEffect } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

const Contact = ({ isLoggedIn, user }) => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ loading: false, message: "", isError: false });

  // Auto-fill the name and email if the user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || user.username || "",
        email: user.email || "",
      }));
    }
  }, [isLoggedIn, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", isError: false });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/contact-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setStatus({ loading: false, message: data.message, isError: false });
        // Clear only the message field, keep the name and email filled
        setFormData({ ...formData, message: "" }); 
      } else {
        setStatus({ loading: false, message: data.message, isError: true });
      }
    } catch (error) {
      setStatus({ loading: false, message: "Failed to send message. Check your connection.", isError: true });
    }
  };

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
          
          {/* Contact Form Container */}
          <div className="bg-pink-50 dark:bg-gray-800 rounded-2xl p-8 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 transition-colors duration-300">Send a Message</h3>
            
            {isLoggedIn ? (
              <>
                {status.message && (
                  <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${status.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-pink-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-pink-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="w-full px-4 py-3 rounded-lg border border-pink-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-pink-400 transition-colors duration-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Message</label>
                    <textarea rows="4" name="message" value={formData.message} onChange={handleChange} required placeholder="How can we help you?" className="w-full px-4 py-3 rounded-lg border border-pink-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-pink-400 transition-colors duration-300"></textarea>
                  </div>
                  <button type="submit" disabled={status.loading} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition shadow-md disabled:opacity-70">
                    {status.loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-full mb-4 transition-colors duration-300">
                  <FaLock className="text-3xl text-gray-500 dark:text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Login Required</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">Please sign in to your account to send us a direct message.</p>
                <Link to="/auth" className="bg-pink-600 text-white font-bold py-2.5 px-8 rounded-full hover:bg-pink-700 transition shadow-md">
                  Sign In / Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;