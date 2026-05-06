import React, { useState, useEffect } from 'react';
import { FaUserCheck, FaUserTimes, FaUsers } from 'react-icons/fa';

const AccountList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All'); // State for tabs: 'All', 'Verified', 'Unverified'

    const fetchUsers = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const res = await fetch(`${apiUrl}/admin_fetch_users`);
            const data = await res.json();
            
            if (data.success) {
                setUsers(data.users);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Error connecting to the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Helper function to format the date nicely
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Filter users based on the selected tab
    const filteredUsers = users.filter(user => {
        if (filter === 'All') return true;
        if (filter === 'Verified') return user.is_verified === 1;
        if (filter === 'Unverified') return user.is_verified === 0;
        return true;
    });

    // Calculate stats for the header cards
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.is_verified === 1).length;
    const unverifiedUsers = users.filter(u => u.is_verified === 0).length;

    if (loading) return <div className="p-6 text-gray-500 font-semibold animate-pulse">Loading accounts...</div>;
    if (error) return <div className="p-6 text-red-500 font-bold bg-red-50 rounded-xl">{error}</div>;

    return (
        <div className="p-6 transition-colors duration-300">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">Registered Accounts</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">Manage and view all registered users in the system.</p>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-blue-400 transition-colors duration-300">
                    <div className="bg-blue-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300">
                        <FaUsers className="text-blue-500 text-2xl" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalUsers}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-green-400 transition-colors duration-300">
                    <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300">
                        <FaUserCheck className="text-green-500 text-2xl" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{verifiedUsers}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center gap-4 border-l-4 border-yellow-400 transition-colors duration-300">
                    <div className="bg-yellow-50 dark:bg-gray-700 p-3 rounded-full transition-colors duration-300">
                        <FaUserTimes className="text-yellow-500 text-2xl" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-white">{unverifiedUsers}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Unverified</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300 border dark:border-gray-700">
                
                {/* --- TABS --- */}
                <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 pt-4 gap-2 overflow-x-auto">
                    {['All', 'Verified', 'Unverified'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                                filter === tab
                                    ? 'bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 border-t border-l border-r border-gray-200 dark:border-gray-700 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab} Users
                        </button>
                    ))}
                </div>

                {/* --- TABLE --- */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b dark:border-gray-700 transition-colors duration-300">
                            <tr>
                                <th className="p-4">User ID</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Email Address</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="p-4 text-sm font-medium text-gray-900 dark:text-gray-100">#{user.id}</td>
                                        <td className="p-4 text-sm font-bold text-gray-800 dark:text-white">{user.username}</td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                user.is_verified === 1 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800' 
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                                            }`}>
                                                {user.is_verified === 1 ? <FaUserCheck size={10} /> : <FaUserTimes size={10} />}
                                                {user.is_verified === 1 ? 'Verified' : 'Unverified'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(user.created_at)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 dark:text-gray-400 italic">
                                        No {filter.toLowerCase()} users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccountList;