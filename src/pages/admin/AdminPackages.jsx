import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
          className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-pink-700 hover:shadow-lg transition-all duration-300 font-bold"
        >
          <FaPlus /> Add New Package
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-pink-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <th className="p-4 border-b border-pink-100 dark:border-gray-600 font-bold">Package Name</th>
                <th className="p-4 border-b border-pink-100 dark:border-gray-600 font-bold text-center">Dish Limit</th>
                <th className="p-4 border-b border-pink-100 dark:border-gray-600 font-bold">Price</th>
                <th className="p-4 border-b border-pink-100 dark:border-gray-600 font-bold">Capacity</th>
                <th className="p-4 border-b border-pink-100 dark:border-gray-600 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.length > 0 ? packages.map(pkg => (
                <tr key={pkg.id} className="hover:bg-pink-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold text-pink-600 dark:text-pink-400">
                    {pkg.package_name}
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1 max-w-xs truncate">{pkg.description}</div>
                  </td>
                  <td className="p-4 border-b border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-300 text-center">
                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300 border dark:border-gray-600">
                      {pkg.dish_limit} Dishes
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-100 dark:border-gray-700 font-extrabold text-gray-800 dark:text-gray-200">₱{pkg.price}</td>
                  <td className="p-4 border-b border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium">{pkg.pax_capacity} Pax</td>
                  
                  {/* MODERNIZED ACTION BUTTONS */}
                  <td className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => openModal(pkg)} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold text-sm rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm border border-blue-100 dark:border-blue-800"
                        title="Edit Package"
                      >
                        <FaEdit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(pkg.id)} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold text-sm rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm border border-red-100 dark:border-red-800"
                        title="Delete Package"
                      >
                        <FaTrash size={14} /> Delete
                      </button>
                    </div>
                  </td>

                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 font-bold bg-gray-50 dark:bg-gray-800/50">
                    No packages found. Click "Add New Package" above to create your first one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Transparent Blurred Modal Background */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 p-4 transition-all duration-300">
          <div className="bg-white/95 dark:bg-gray-800/95 p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-lg border border-white/20 dark:border-gray-600 relative backdrop-blur-xl">
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500 text-2xl font-bold transition leading-none"
            >
              &times;
            </button>

            <h3 className="text-2xl font-black mb-6 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">
              {formData.id ? 'Edit Package Details' : 'Create New Package'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Package Name</label>
                <input 
                  type="text" 
                  value={formData.package_name} 
                  onChange={(e) => setFormData({...formData, package_name: e.target.value})} 
                  className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-shadow shadow-inner" 
                  required 
                  placeholder="e.g., Premium Wedding Package"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Price (₱)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-shadow shadow-inner" 
                    required 
                    placeholder="30000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Capacity</label>
                  <input 
                    type="number" 
                    value={formData.pax_capacity} 
                    onChange={(e) => setFormData({...formData, pax_capacity: e.target.value})} 
                    className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-shadow shadow-inner" 
                    required 
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-pink-600 dark:text-pink-400 mb-1.5">Dish Limit</label>
                  <input 
                    type="number" 
                    value={formData.dish_limit} 
                    onChange={(e) => setFormData({...formData, dish_limit: e.target.value})} 
                    className="w-full border border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-pink-900/20 text-pink-800 dark:text-pink-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-shadow shadow-inner font-bold" 
                    required 
                    placeholder="e.g., 7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Features / Inclusions <span className="text-xs font-normal text-gray-500">(comma separated)</span></label>
                <textarea 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 transition-shadow shadow-inner" 
                  required
                  placeholder="Standard Setup, Tables & Chairs, Basic Styling..."
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-5 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 shadow-lg hover:shadow-pink-500/30 transition-all transform hover:-translate-y-0.5"
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