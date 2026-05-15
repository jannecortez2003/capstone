import React, { useState, useEffect, useMemo } from "react";
import { FaBox, FaPlus, FaExclamationTriangle, FaHistory, FaArrowDown, FaArrowUp, FaListAlt } from "react-icons/fa";
import Modal from '../../components/Modal';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]); 
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", quantity: "", unit: "" });
  const [selectedHistory, setSelectedHistory] = useState(null);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const [invRes, logsRes] = await Promise.all([
          fetch(`${apiUrl}/admin_fetch_inventory`),
          fetch(`${apiUrl}/admin_fetch_inventory_logs`)
      ]);

      const invData = await invRes.json();
      const logsData = await logsRes.json();

      if (invData.success && Array.isArray(invData.inventory)) setItems(invData.inventory);
      if (logsData.success && Array.isArray(logsData.logs)) setLogs(logsData.logs);

    } catch (err) { console.error("Error fetching data:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInventoryData(); }, []);

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
          fetchInventoryData(); 
          setShowModal(false); 
          setEditingItem(null);
      } else { alert(`⚠️ Warning: ${data.message}`); }
    } catch (err) { console.error("Error saving item:", err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this item?")) return;
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/admin_delete_inventory`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        fetchInventoryData();
    } catch (err) { alert("Delete failed"); }
  };

  const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const groupedHistory = useMemo(() => {
      const groups = [];
      const bookingMap = new Map();

      logs.forEach(log => {
          const bookingMatch = log.remarks?.match(/Booking #(\d+)/);
          if (bookingMatch) {
              const bId = bookingMatch[1];
              if (!bookingMap.has(bId)) {
                  const newGroup = {
                      id: `booking-${bId}`,
                      title: `Event Booking #${bId}`,
                      date: log.created_at, 
                      isBooking: true,
                      bookingId: bId,
                      logs: []
                  };
                  bookingMap.set(bId, newGroup);
                  groups.push(newGroup);
              }
              bookingMap.get(bId).logs.push(log);
          } else {
              groups.push({
                  id: `manual-${log.id}`,
                  title: log.action_type || 'Manual Adjustment',
                  date: log.created_at,
                  isBooking: false,
                  logs: [log]
              });
          }
      });
      return groups.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs]);

  const totalItems = items?.length || 0;
  const lowStock = items?.filter(i => i.quantity < 20).length || 0;

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Inventory Management</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Track your equipment, supplies, and stock history.</p>

      {/* STATS GRID */}
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
        
        {/* TAB CONTROLS */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center overflow-x-auto">
            <div className="flex space-x-2">
                <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-pink-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'}`}>
                    <FaBox /> Current Stock
                </button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'history' ? 'bg-pink-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'}`}>
                    <FaHistory /> Grouped History Logs
                </button>
            </div>
            {activeTab === 'inventory' && (
                <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700 transition shadow-sm font-bold text-sm shrink-0 ml-4">
                    <FaPlus /> ADD ITEM
                </button>
            )}
        </div>

        {/* INVENTORY LIST TAB */}
        {activeTab === 'inventory' && (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm mt-2">
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
        )}

        {/* GROUPED HISTORY LOGS TAB */}
        {activeTab === 'history' && (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
                    <tr>
                        <th className="p-4 text-left">Date</th>
                        <th className="p-4 text-left">Transaction Details</th>
                        <th className="p-4 text-left">Records Found</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {loading ? (
                        <tr><td colSpan="4" className="p-6 text-center text-gray-500 dark:text-gray-400">Loading history...</td></tr>
                    ) : groupedHistory.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-gray-500 dark:text-gray-400">No history logs found yet.</td></tr>
                    ) : (
                        groupedHistory.map((group) => (
                            <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                                <td className="p-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{formatDate(group.date)}</td>
                                <td className="p-4 font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    {group.isBooking ? <FaListAlt className="text-purple-500" /> : <FaHistory className="text-gray-500" />}
                                    {group.title}
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-600 font-bold">
                                        {group.logs.length} Item Updates
                                    </span>
                                </td>
                                <td className="p-4 flex justify-center">
                                    <button onClick={() => setSelectedHistory(group)} className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900 transition shadow-sm">
                                        VIEW DETAILS
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        )}

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

      {/* 🔥 FIX: SPLIT TRANSACTION DETAILS MODAL 🔥 */}
      {selectedHistory && (
          <Modal isOpen={!!selectedHistory} onClose={() => setSelectedHistory(null)} title={selectedHistory.title} size="max-w-2xl">
              <div className="p-2 md:p-4 text-gray-800 dark:text-gray-200">
                  <p className="text-sm text-gray-500 mb-4 font-medium border-b dark:border-gray-700 pb-2">
                      First Event Date: {formatDate(selectedHistory.date)}
                  </p>
                  
                  <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                      
                      {/* SECTION 1: ITEMS DEDUCTED */}
                      {selectedHistory.logs.filter(log => log.quantity_change < 0).length > 0 && (
                          <div>
                              <h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                                  <FaArrowDown /> Items Allocated (Deducted)
                              </h4>
                              <div className="space-y-2">
                                  {selectedHistory.logs.filter(log => log.quantity_change < 0).map((log) => (
                                      <div key={log.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50">
                                          <div>
                                              <p className="font-bold text-gray-900 dark:text-white">{log.item_name}</p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">{log.action_type} • {formatDate(log.created_at)}</p>
                                          </div>
                                          <div className="flex items-center gap-2 font-black text-lg text-red-500">
                                              <FaArrowDown /> {Math.abs(log.quantity_change)}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* SECTION 2: ITEMS RETURNED */}
                      {selectedHistory.logs.filter(log => log.quantity_change > 0).length > 0 && (
                          <div>
                              <h4 className="text-sm font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                                  <FaArrowUp /> Items Reconciled (Returned)
                              </h4>
                              <div className="space-y-2">
                                  {selectedHistory.logs.filter(log => log.quantity_change > 0).map((log) => (
                                      <div key={log.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50">
                                          <div>
                                              <p className="font-bold text-gray-900 dark:text-white">{log.item_name}</p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">{log.action_type} • {formatDate(log.created_at)}</p>
                                          </div>
                                          <div className="flex items-center gap-2 font-black text-lg text-green-500">
                                              <FaArrowUp /> {Math.abs(log.quantity_change)}
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                      
                  </div>

                  <div className="mt-6 flex justify-end">
                      <button onClick={() => setSelectedHistory(null)} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition shadow-sm">
                          Close Viewer
                      </button>
                  </div>
              </div>
          </Modal>
      )}

    </div>
  );
};

export default Inventory;