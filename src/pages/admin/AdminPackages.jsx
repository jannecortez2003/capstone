import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State matches the backend perfectly
  const [formData, setFormData] = useState({ 
    id: null, 
    package_name: '', 
    description: '', 
    price: '', 
    pax_capacity: '',
    dish_limit: '' 
  });
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${apiUrl}/fetch_packages`);
      if (res.data.success) {
        setPackages(res.data.packages);
      }
    } catch (err) { 
      console.error("Error fetching packages", err); 
    }
  };

  useEffect(() => { 
    fetchPackages(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = formData.id ? '/admin_update_package' : '/admin_add_package';
    try {
      const res = await axios.post(`${apiUrl}${endpoint}`, formData);
      if (res.data.success) {
        setIsModalOpen(false);
        fetchPackages();
      } else {
        alert("Failed to save package.");
      }
    } catch (err) { 
      console.error(err);
      alert("Error saving package. Please check your console."); 
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this package?")) {
      try {
        await axios.post(`${apiUrl}/admin_delete_package`, { id });
        fetchPackages(); 
      } catch (err) { 
        alert("Error deleting package"); 
      }
    }
  };

  const openModal = (pkg = null) => {
    if (pkg) {
      setFormData({ 
        id: pkg.id, 
        package_name: pkg.package_name, 
        description: pkg.description, 
        price: pkg.price, 
        pax_capacity: pkg.pax_capacity,
        dish_limit: pkg.dish_limit || '' 
      });
    } else {
      setFormData({ id: null, package_name: '', description: '', price: '', pax_capacity: '', dish_limit: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-700 dark:text-pink-400">Package Management</h2>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-pink-700 transition"
        >
          <FaPlus /> Add New Package
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-pink-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <th className="p-4 border-b dark:border-gray-600 font-bold">Package Name</th>
                <th className="p-4 border-b dark:border-gray-600 font-bold">Dish Limit</th>
                <th className="p-4 border-b dark:border-gray-600 font-bold">Price</th>
                <th className="p-4 border-b dark:border-gray-600 font-bold">Capacity</th>
                <th className="p-4 border-b dark:border-gray-600 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.length > 0 ? packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 border-b dark:border-gray-700 font-bold text-pink-600 dark:text-pink-400">
                    {pkg.package_name}
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1 max-w-xs truncate">{pkg.description}</div>
                  </td>
                  <td className="p-4 border-b dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-300">
                    {pkg.dish_limit} Menu Choices
                  </td>
                  <td className="p-4 border-b dark:border-gray-700 font-bold text-gray-800 dark:text-gray-200">₱{pkg.price}</td>
                  <td className="p-4 border-b dark:border-gray-700 text-gray-600 dark:text-gray-300">{pkg.pax_capacity} Pax</td>
                  <td className="p-4 border-b dark:border-gray-700 text-center space-x-3">
                    <button onClick={() => openModal(pkg)} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500 font-bold">No packages found. Create one above!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparent Blurred Modal Background */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg border dark:border-gray-700 relative">
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold transition leading-none"
            >
              &times;
            </button>

            <h3 className="text-2xl font-bold mb-5 text-gray-800 dark:text-white">
              {formData.id ? 'Edit Package' : 'Create New Package'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Package Name</label>
                <input 
                  type="text" 
                  value={formData.package_name} 
                  onChange={(e) => setFormData({...formData, package_name: e.target.value})} 
                  className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" 
                  required 
                  placeholder="e.g., Package 1"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price (₱)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" 
                    required 
                    placeholder="30000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    value={formData.pax_capacity} 
                    onChange={(e) => setFormData({...formData, pax_capacity: e.target.value})} 
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" 
                    required 
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Dish Limit</label>
                  <input 
                    type="number" 
                    value={formData.dish_limit} 
                    onChange={(e) => setFormData({...formData, dish_limit: e.target.value})} 
                    className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" 
                    required 
                    placeholder="7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Features / Inclusions</label>
                <textarea 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-pink-500" 
                  required
                  placeholder="Standard Setup, Tables & Chairs, Basic Styling..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t dark:border-gray-700 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 shadow-md transition"
                >
                  {formData.id ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;