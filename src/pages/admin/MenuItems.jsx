import React, { useState, useEffect } from "react";
import { FaPlus, FaUtensils, FaCoffee, FaIceCream, FaHamburger } from "react-icons/fa"; // Removed Edit/Trash icons
import Modal from '../../components/Modal';

const MenuItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", category: "", price: "", description: "" });

  const fetchMenu = async () => {
    try {
      const res = await fetch("http://localhost/admin_fetch_menu.php");
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
    const url = editingItem ? "http://localhost/admin_update_menu.php" : "http://localhost/admin_add_menu.php";
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData)
      });
      setShowModal(false);
      setEditingItem(null);
      fetchMenu();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this dish?")) return;
    await fetch("http://localhost/admin_delete_menu.php", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id })
    });
    fetchMenu();
  };

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const mainCount = items.filter(i => i.category === 'Main Course').length;
  const appCount = items.filter(i => i.category === 'Appetizer').length;
  const dessertCount = items.filter(i => i.category === 'Dessert').length;

  return (
    <div className="p-6 fade-in">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Menu Management</h1>
      <p className="text-gray-500 mb-8">Curate your catering offerings.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-pink-300">
            <div className="bg-pink-50 p-3 rounded-full"><FaUtensils className="text-pink-500 text-2xl" /></div>
            <div><div className="text-2xl font-bold text-gray-800">{mainCount}</div><div className="text-sm text-gray-600">Main Courses</div></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-300">
            <div className="bg-yellow-50 p-3 rounded-full"><FaHamburger className="text-yellow-500 text-2xl" /></div>
            <div><div className="text-2xl font-bold text-gray-800">{appCount}</div><div className="text-sm text-gray-600">Appetizers</div></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-purple-300">
            <div className="bg-purple-50 p-3 rounded-full"><FaIceCream className="text-purple-500 text-2xl" /></div>
            <div><div className="text-2xl font-bold text-gray-800">{dessertCount}</div><div className="text-sm text-gray-600">Desserts</div></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <input 
            type="text" placeholder="Search dishes..." 
            className="border p-2 rounded w-full max-w-md focus:ring-2 focus:ring-pink-500 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => { setEditingItem(null); setShowModal(true); }} 
            className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700 transition shadow-sm font-bold text-sm"
          >
            <FaPlus /> ADD DISH
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-xs">
              <tr>
                <th className="p-4 text-left">Dish Name</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-pink-50 transition last:border-0">
                  <td className="p-4 font-medium text-gray-800">{item.name}</td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{item.category}</span></td>
                  <td className="p-4 font-bold text-pink-600">₱{parseFloat(item.price).toLocaleString()}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button 
                        onClick={() => { setEditingItem(item); setShowModal(true); }} 
                        className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition"
                    >
                        EDIT
                    </button>
                    <button 
                        onClick={() => handleDelete(item.id)} 
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition"
                    >
                        DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? "Edit Dish" : "New Dish"}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div><label className="text-sm font-medium">Name</label><input name="name" className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none" value={formData.name} onChange={handleInputChange} required /></div>
            <div>
                <label className="text-sm font-medium">Category</label>
                <select name="category" className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none bg-white" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select...</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Dessert">Dessert</option>
                </select>
            </div>
            <div><label className="text-sm font-medium">Price (₱)</label><input type="number" name="price" className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none" value={formData.price} onChange={handleInputChange} required /></div>
            <div><label className="text-sm font-medium">Description</label><textarea name="description" className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none" rows="3" value={formData.description} onChange={handleInputChange} /></div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Save</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
export default MenuItems;