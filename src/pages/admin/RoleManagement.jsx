import React, { useState, useEffect } from 'react';
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaKey } from 'react-icons/fa';
import Modal, { SuccessModal } from '../../components/Modal';

const RoleManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Form Data
    const [formData, setFormData] = useState({
        id: null,
        username: '',
        password: '',
        role: 'staff'
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/admin_fetch_roles`);
            const data = await res.json();
            if (data.success) {
                setAdmins(data.admins);
            }
        } catch (error) {
            console.error("Failed to fetch admin accounts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const openModal = (account = null) => {
        if (account) {
            setEditingAccount(account);
            setFormData({
                id: account.id,
                username: account.username,
                password: '', // Leave blank when editing unless they want to change it
                role: account.role
            });
        } else {
            setEditingAccount(null);
            setFormData({ id: null, username: '', password: '', role: 'staff' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent changing primary admin role
        if (editingAccount && editingAccount.username.toLowerCase() === 'admin' && formData.role !== 'admin') {
            alert("Security Restriction: You cannot change the role of the primary 'admin' account.");
            return;
        }

        const endpoint = editingAccount ? '/admin_update_role' : '/admin_add_role';
        
        try {
            const res = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.success) {
                setIsModalOpen(false);
                setSuccessMessage(data.message);
                setShowSuccessModal(true);
                fetchAdmins();
            } else {
                alert(`Action Failed: ${data.message}`);
            }
        } catch (error) {
            alert("Network Error. Could not save account.");
        }
    };

    const handleDelete = async (account) => {
        if (account.username.toLowerCase() === 'admin') {
            alert("Security Restriction: You cannot delete the primary 'admin' account.");
            return;
        }

        if (window.confirm(`Are you sure you want to permanently delete the account for '${account.username}'?`)) {
            try {
                const res = await fetch(`${apiUrl}/admin_delete_role`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: account.id, username: account.username })
                });
                const data = await res.json();
                if (data.success) {
                    setSuccessMessage(data.message);
                    setShowSuccessModal(true);
                    fetchAdmins();
                }
            } catch (error) {
                alert("Network Error. Could not delete account.");
            }
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'staff': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return <div className="p-6 text-pink-600 font-bold animate-pulse">Loading Access Control...</div>;

    return (
        <div className="p-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Access Control</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage system access, roles, and permissions for your team.</p>
                </div>
                <button 
                    onClick={() => openModal()}
                    className="bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md"
                >
                    <FaPlus /> Create New Access
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border dark:border-gray-700 transition-colors duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b dark:border-gray-700">
                            <tr>
                                <th className="p-4">Username</th>
                                <th className="p-4">Assigned Role</th>
                                <th className="p-4">Permissions Overview</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {admins.map(account => (
                                <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="p-4 font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full text-gray-500">
                                            <FaUserShield />
                                        </div>
                                        {account.username}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleBadge(account.role)} uppercase tracking-wider`}>
                                            {account.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                                        {account.role === 'admin' && "Full System Access. Can manage roles, settings, and delete records."}
                                        {account.role === 'manager' && "Can approve bookings, view financial reports, and manage inventory."}
                                        {account.role === 'staff' && "View-only access for bookings and inventory. Cannot approve or edit."}
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        <button 
                                            onClick={() => openModal(account)}
                                            className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 px-3 py-1.5 rounded font-bold text-xs transition"
                                        >
                                            <FaEdit className="inline mr-1"/> Edit
                                        </button>
                                        
                                        {/* Hide delete button for the main admin account */}
                                        {account.username.toLowerCase() !== 'admin' && (
                                            <button 
                                                onClick={() => handleDelete(account)}
                                                className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 px-3 py-1.5 rounded font-bold text-xs transition"
                                            >
                                                <FaTrash className="inline mr-1"/> Revoke
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FaKey className="text-pink-500"/> 
                                {editingAccount ? 'Edit Access Record' : 'Create New Access'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-2xl transition">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Username</label>
                                <input 
                                    type="text" 
                                    required 
                                    disabled={editingAccount && editingAccount.username.toLowerCase() === 'admin'}
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-colors disabled:opacity-50"
                                    value={formData.username} 
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                                    Password {editingAccount && <span className="text-pink-500 lowercase normal-case">(Leave blank to keep current)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    required={!editingAccount} 
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-colors"
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Assign Role</label>
                                <select 
                                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none transition-colors disabled:opacity-50"
                                    value={formData.role} 
                                    disabled={editingAccount && editingAccount.username.toLowerCase() === 'admin'}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="admin">Administrator (Full Access)</option>
                                    <option value="manager">Manager (Approve & Edit)</option>
                                    <option value="staff">Staff (View Only)</option>
                                </select>
                            </div>
                            
                            <button type="submit" className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors mt-6 shadow-md">
                                {editingAccount ? 'Save Changes' : 'Grant Access'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} message={successMessage} />
        </div>
    );
};

export default RoleManagement;