import React, { useState, useEffect } from "react";
import { FaUserTie, FaPlus } from "react-icons/fa";
import Modal from '../../components/Modal';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({ name: "", role: "", email: "", phone: "" });

    const fetchStaff = async () => {
        try {
            const res = await fetch("http://localhost/admin_fetch_staff.php");
            const data = await res.json();
            if (data.success) setStaff(data.staff);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchStaff(); }, []);

    useEffect(() => {
        if (editingStaff) setFormData({ name: editingStaff.name, role: editingStaff.role, email: editingStaff.email, phone: editingStaff.phone });
        else setFormData({ name: "", role: "", email: "", phone: "" });
    }, [editingStaff]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingStaff ? "http://localhost/admin_update_staff.php" : "http://localhost/admin_add_staff.php";
        try {
            await fetch(url, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingStaff ? { ...formData, id: editingStaff.id } : formData)
            });
            setShowModal(false);
            setEditingStaff(null);
            fetchStaff();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this staff member?")) return;
        await fetch("http://localhost/admin_delete_staff.php", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id })
        });
        fetchStaff();
    };

    return (
        <div className="p-6 fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">Staff Management</h1>
            <p className="text-gray-500 mb-8">Manage your team and roles.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-blue-300">
                    <div className="bg-blue-50 p-3 rounded-full"><FaUserTie className="text-blue-500 text-2xl" /></div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800">{staff.length}</div>
                        <div className="text-sm font-medium text-gray-600">Active Staff Members</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="font-bold text-gray-700">Team Directory</h2>
                    <button onClick={() => { setEditingStaff(null); setShowModal(true); }} className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700 transition shadow-sm font-bold text-sm">
                        <FaPlus /> ADD STAFF
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase font-semibold text-xs">
                            <tr>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Role</th>
                                <th className="p-4 text-left">Contact Info</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((s) => (
                                <tr key={s.id} className="border-b hover:bg-pink-50 transition last:border-0">
                                    <td className="p-4 font-bold text-gray-800">{s.name}</td>
                                    <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{s.role}</span></td>
                                    <td className="p-4 text-gray-600">
                                        <div className="text-xs">{s.email}</div>
                                        <div className="text-xs">{s.phone}</div>
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button 
                                            onClick={() => { setEditingStaff(s); setShowModal(true); }} 
                                            className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-bold hover:bg-green-200 transition"
                                        >
                                            EDIT
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(s.id)} 
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

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingStaff ? "Edit Staff" : "Add Staff"}>
                <form onSubmit={handleSubmit} className="space-y-4 p-2">
                    <div><label className="text-sm font-medium">Full Name</label><input className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                    <div><label className="text-sm font-medium">Role</label><input className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required /></div>
                    <div><label className="text-sm font-medium">Email</label><input type="email" className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                    <div><label className="text-sm font-medium">Phone</label><input className="w-full border p-2 rounded focus:ring-2 focus:ring-pink-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required /></div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default StaffPage;