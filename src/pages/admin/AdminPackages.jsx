import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '', price: '', pax_capacity: '' });
  
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${apiUrl}/fetch_packages`);
      if (res.data.success) setPackages(res.data.packages);
    } catch (err) { console.error("Error fetching packages", err); }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = formData.id ? '/admin_update_package' : '/admin_add_package';
    try {
      const res = await axios.post(`${apiUrl}${endpoint}`, formData);
      if (res.data.success) {
        setIsModalOpen(false);
        fetchPackages();
      }
    } catch (err) { alert("Error saving package"); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this package?")) {
      try {
        await axios.post(`${apiUrl}/admin_delete_package`, { id });
        fetchPackages();
      } catch (err) { alert("Error deleting package"); }
    }
  };

  const openModal = (pkg = null) => {
    if (pkg) {
      setFormData({ id: pkg.id, name: pkg.package_name, description: pkg.description, price: pkg.price, pax_capacity: pkg.pax_capacity });
    } else {
      setFormData({ id: null, name: '', description: '', price: '', pax_capacity: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-700">Package Management</h2>
        <button onClick={() => openModal()} className="bg-pink-600 text-white px-4 py-2 rounded shadow hover:bg-pink-700 transition">+ Add Package</button>
      </div>

      <div className="bg-white shadow rounded p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-pink-50 text-left text-gray-700">
              <th className="p-3 border-b">Package Name</th>
              <th className="p-3 border-b">Description</th>
              <th className="p-3 border-b">Price</th>
              <th className="p-3 border-b">Capacity</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id} className="hover:bg-gray-50 transition">
                <td className="p-3 border-b font-bold text-pink-600">{pkg.package_name}</td>
                <td className="p-3 border-b text-sm text-gray-600">{pkg.description}</td>
                <td className="p-3 border-b font-bold text-gray-800">₱{pkg.price}</td>
                <td className="p-3 border-b text-gray-600">{pkg.pax_capacity} Pax</td>
                <td className="p-3 border-b text-center space-x-2">
                  <button onClick={() => openModal(pkg)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">Edit</button>
                  <button onClick={() => handleDelete(pkg.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{formData.id ? 'Edit Package' : 'New Package'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Package Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (₱)</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border p-2 rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Max Pax Capacity</label>
                  <input type="number" value={formData.pax_capacity} onChange={(e) => setFormData({...formData, pax_capacity: e.target.value})} className="w-full border p-2 rounded" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" required></textarea>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;