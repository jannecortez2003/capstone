import React, { useState, useEffect } from "react";
import { FaUserTie, FaPlus, FaPhone, FaEnvelope } from "react-icons/fa";
import Modal from '../../components/Modal';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({ name: "", role: "", email: "", phone: "" });

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_staff`);
      const data = await res.json();
      if (data.success) setStaff(data.staff);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  useEffect(() => {
    if (editingStaff) setFormData({ name: editingStaff.name, role: editingStaff.role, email: editingStaff.email, phone: editingStaff.phone });
    else setFormData({ name: "", role: "", email: "", phone: "" });
  }, [editingStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingStaff ? `${import.meta.env.VITE_API_URL}/admin_update_staff` : `${import.meta.env.VITE_API_URL}/admin_add_staff`;
    try {
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingStaff ? { ...formData, id: editingStaff.id } : formData) });
      setShowModal(false); setEditingStaff(null); fetchStaff();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to REMOVE this staff member?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/admin_delete_staff`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchStaff();
  };

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Staff Directory</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Manage your catering team members.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
          <h2 className="font-bold text-gray-700 dark:text-white transition-colors duration-300">Active Staff ({staff.length})</h2>
          <button onClick={() => { setEditingStaff(null); setShowModal(true); }} className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-pink-700 transition shadow-sm font-bold text-sm">
            <FaPlus /> ADD STAFF
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
              <tr>
                <th className="p-4 text-left">Staff Member</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Contact Info</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-pink-100 dark:bg-gray-600 p-2 rounded-full text-pink-600 dark:text-pink-300 transition-colors duration-300"><FaUserTie /></div>
                        <span className="font-bold text-gray-800 dark:text-white transition-colors duration-300">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-4"><span className="bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-2 py-1 rounded text-xs font-bold transition-colors duration-300">{member.role}</span></td>
                  <td className="p-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 transition-colors duration-300"><FaPhone className="text-gray-400 dark:text-gray-500" /> {member.phone}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1 transition-colors duration-300"><FaEnvelope className="text-gray-400 dark:text-gray-500" /> {member.email}</div>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button onClick={() => { setEditingStaff(member); setShowModal(true); }} className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition">EDIT</button>
                    <button onClick={() => handleDelete(member.id)} className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded text-xs font-bold hover:bg-red-200 transition">REMOVE</button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">No staff members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStaff ? "Edit Staff" : "Add Staff"}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2 text-gray-800 dark:text-gray-200">
            <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input name="name" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <select name="role" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required>
                    <option value="">Select Role...</option>
                    <option value="Chef">Chef</option>
                    <option value="Server">Server</option>
                    <option value="Driver">Driver</option>
                    <option value="Manager">Manager</option>
                    <option value="Coordinator">Coordinator</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1 block">Phone</label>
                    <input type="text" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <input type="email" className="w-full border dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none transition-colors" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
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
export default StaffPage;