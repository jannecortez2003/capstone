import React, { useState, useEffect } from "react";
import { FaBox, FaPlus, FaExclamationTriangle } from "react-icons/fa";
import Modal from '../../components/Modal';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", quantity: "", unit: "" });

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_inventory`);
      const data = await res.json();
      if (data.success && Array.isArray(data.inventory)) { setItems(data.inventory); } else { setItems([]); }
    } catch (err) { console.error("Error fetching inventory:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchInventory(); }, []);

  useEffect(() => {
    if (editingItem) setFormData({ name: editingItem.name, quantity: editingItem.quantity, unit: editingItem.unit });
    else setFormData({ name: "", quantity: "", unit: "" });
  }, [editingItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingItem ? `${import.meta.env.VITE_API_URL}/admin_update_inventory` : `${import.meta.env.VITE_API_URL}/admin_add_inventory`;
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData) });
      const data = await res.json();
      
      if (data.success) {
          fetchInventory(); 
          setShowModal(false); 
          setEditingItem(null);
      } else {
          alert(`⚠️ Warning: ${data.message}`);
      }
    } catch (err) { console.error("Error saving item:", err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this item?")) return;
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/admin_delete_inventory`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        fetchInventory();
    } catch (err) { alert("Delete failed"); }
  };

  const totalItems = items?.length || 0;
  const lowStock = items?.filter(i => i.quantity < 20).length || 0;

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Inventory Management</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Track your equipment and supplies.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-pink-300 transition-colors duration-300">
            <div className="bg-pink-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaBox className="text-pink-500 text-2xl" /></div>
            <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{totalItems}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Total Item Types</div>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-orange-300 transition-colors duration-300">
            <div className="bg-orange-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300"><FaExclamationTriangle className="text-orange-500 text-2xl" /></div>
            <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{lowStock}</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">Low Stock Alerts</div>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
            <h2 className="font-bold text-gray-700 dark:text-white transition-colors duration-300">Inventory List</h2>
            <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700 transition shadow-sm font-bold text-sm">
                <FaPlus /> ADD ITEM
            </button>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 m-4 rounded-r-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>💡 Reminder:</strong> Inventory item names must be entirely unique. The system will automatically block and reject duplicate entries to prevent stock tracking errors.
            </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
              <tr>
                <th className="p-4 text-left">Item Name</th>
                <th className="p-4 text-left">Quantity</th>
                <th className="p-4 text-left">Unit</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500 dark:text-gray-400">Loading inventory...</td></tr>
              ) : items.length === 0 ? (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500 dark:text-gray-400">No items found.</td></tr>
              ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                      <td className="p-4 font-medium text-gray-800 dark:text-white transition-colors duration-300">{item.name}</td>
                      <td className="p-4 font-bold text-gray-800 dark:text-white transition-colors duration-300">{item.quantity}</td>
                      <td className="p-4 text-gray-500 dark:text-gray-400 transition-colors duration-300">{item.unit}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.quantity < 20 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'}`}>
                            {item.quantity < 20 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900 transition">EDIT</button>
                        <button onClick={() => handleDelete(item.id)} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900 transition">DELETE</button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? "Edit Item" : "Add Inventory"}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2 text-gray-800 dark:text-gray-200">
            <div>
                <label className="block text-sm font-medium mb-1">Item Name</label>
                <input type="text" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 rounded p-2 focus:ring-2 focus:ring-pink-500 outline-none transition-colors" 
                     value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input type="number" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 rounded p-2 focus:ring-2 focus:ring-pink-500 outline-none transition-colors" 
                         value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Unit</label>
                    <input type="text" placeholder="pcs, packs" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 rounded p-2 focus:ring-2 focus:ring-pink-500 outline-none transition-colors placeholder-gray-400" 
                         value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} required />
                </div>
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

export default Inventory;