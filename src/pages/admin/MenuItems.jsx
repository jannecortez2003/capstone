import React, { useState, useEffect } from "react";
import { FaPlus, FaUtensils, FaCoffee, FaIceCream, FaHamburger } from "react-icons/fa"; 
import Modal from '../../components/Modal';

const MenuItems = () => {
  // ... [KEEP ALL YOUR STATE AND FETCH LOGIC EXACTLY THE SAME] ...
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", category: "", price: "", description: "" });

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_menu`);
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenu(); }, []);

  useEffect(() => {
    if (editingItem) setFormData({ ...editingItem, description: editingItem.description || "" });
    else setFormData({ name: "", category: "", price: "", description: "" });
  }, [editingItem]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingItem ? `${import.meta.env.VITE_API_URL}/admin_update_menu` : `${import.meta.env.VITE_API_URL}/admin_add_menu`;
    try {
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData) });
      setShowModal(false); setEditingItem(null); fetchMenu();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this dish?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/admin_delete_menu`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchMenu();
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const mainCount = items.filter(i => i.category === 'Main Course').length;
  const appCount = items.filter(i => i.category === 'Appetizer').length;
  const dessertCount = items.filter(i => i.category === 'Dessert').length;

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Menu Management</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Curate your catering offerings.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-pink-300 transition-colors duration-300">
            <div className="bg-pink-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaUtensils className="text-pink-500 text-2xl" /></div>
            <div><div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{mainCount}</div><div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Main Courses</div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-300 transition-colors duration-300">
            <div className="bg-yellow-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaHamburger className="text-yellow-500 text-2xl" /></div>
            <div><div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{appCount}</div><div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Appetizers</div></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-purple-300 transition-colors duration-300">
            <div className="bg-purple-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaIceCream className="text-purple-500 text-2xl" /></div>
            <div><div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{dessertCount}</div><div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Desserts</div></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors duration-300">
          <input 
            type="text" placeholder="Search dishes..." 
            className="border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded w-full max-w-md focus:ring-2 focus:ring-pink-500 outline-none transition-colors duration-300 placeholder-gray-400"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="w-full md:w-auto bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-pink-700 transition shadow-sm font-bold text-sm">
            <FaPlus /> ADD DISH
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
              <tr>
                <th className="p-4 text-left">Dish Name</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="p-4 font-medium text-gray-800 dark:text-white transition-colors duration-300">{item.name}</td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-2 py-1 rounded text-xs font-bold transition-colors duration-300">{item.category}</span></td>
                  <td className="p-4 font-bold text-pink-600 dark:text-pink-400 transition-colors duration-300">₱{parseFloat(item.price).toLocaleString()}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition">EDIT</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition">DELETE</button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">No menu items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? "Edit Dish" : "New Dish"}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2 text-gray-800 dark:text-gray-200">
            <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <input name="name" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select name="category" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select...</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Dessert">Dessert</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">Price (₱)</label>
                <input type="number" name="price" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" value={formData.price} onChange={handleInputChange} required />
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea name="description" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" rows="3" value={formData.description} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition">Save</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
export default MenuItems;