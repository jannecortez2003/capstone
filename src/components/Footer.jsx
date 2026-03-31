import React from "react";

const Footer = () => {
  return (
    <footer className="bg-pink-600 text-white py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>&copy; 2010 Mommy Rosal Catering. All rights reserved.</p>
        <div className="mt-2 md:mt-0 space-x-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
