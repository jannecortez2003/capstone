import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AccountList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin_fetch_users`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 fade-in transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white transition-colors duration-300">Account Directory</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors duration-300">Manage all registered client accounts.</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase font-semibold text-xs transition-colors duration-300">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">Loading accounts...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">No accounts found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-300">
                    <td className="p-4 font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaUserCircle className="text-gray-400 text-xl" /> {u.username}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                    <td className="p-4">
                        {u.is_verified ? 
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max"><FaCheckCircle/> Verified</span> : 
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max"><FaTimesCircle/> Unverified</span>
                        }
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AccountList;