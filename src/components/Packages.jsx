import React, { useState, useEffect } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import axios from "axios";

const Packages = ({ handlePackageSelection }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live packages from the database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/fetch_packages`);
        if (response.data.success) {
          setPackages(response.data.packages);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return <div className="text-center py-16 text-pink-600 font-bold">Loading packages...</div>;
  }

  return (
    <section id="packages" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">Catering Packages</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
            Choose the perfect catering package for your event. All packages include standard setup, tables, chairs, and basic styling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, index) => {
            // Highlights the middle package (index 1) as the popular one for UI design
            const isPopular = index === 1; 
            
            // Splits your admin description by commas so they show up as nice bullet points
            const features = pkg.description ? pkg.description.split(',').map(f => f.trim()) : [];

            return (
            <div key={pkg.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${isPopular ? 'border-pink-400 shadow-pink-100 dark:shadow-none relative' : 'border-pink-100 dark:border-gray-700'} p-8 hover:shadow-md transition-all duration-300 flex flex-col h-full`}>
              {isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                  <FaStar /> MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{pkg.package_name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-black text-pink-600 dark:text-pink-400 transition-colors duration-300">₱{pkg.price}</span>
                </div>
                <span className="inline-block bg-pink-50 dark:bg-gray-700 text-pink-700 dark:text-pink-300 px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-300">
                  Max {pkg.pax_capacity} Persons
                </span>
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">Inclusions:</p>
                <ul className="space-y-3 mb-8">
                  {/* Dynamically renders the dish limit you set in the admin panel */}
                  <li className="flex items-center gap-3 text-pink-600 dark:text-pink-400 text-sm transition-colors duration-300 font-bold">
                    <FaCheckCircle className="text-pink-500 shrink-0" />
                    <span>{pkg.dish_limit} Menu Choices</span>
                  </li>
                  
                  {/* Maps through your description bullet points */}
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                      <FaCheckCircle className="text-pink-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handlePackageSelection({
                    title: pkg.package_name,
                    price: pkg.price,
                    guestCount: pkg.pax_capacity,
                    dishLimit: pkg.dish_limit // Sends the dynamic limit to your Modal
                })}
                className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${isPopular ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-pink-50 dark:bg-gray-700 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-gray-600'}`}
              >
                Select Package
              </button>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};

export default Packages;