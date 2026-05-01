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
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
        {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">Loading accounts...</div>
        ) : users.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">No accounts found.</div>
        ) : (
            <div className="space-y-6">
                {users.map((u, idx) => (
                    <div key={u.id} className="flex gap-4">
                        {/* Icon and Timeline Line */}
                        <div className="flex flex-col items-center">
                            <div className="bg-blue-50 dark:bg-gray-700 text-blue-500 p-3 rounded-full shadow-sm z-10 transition-colors duration-300">
                                <FaUserCircle className="text-xl" />
                            </div>
                            {idx !== users.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2 transition-colors duration-300"></div>}
                        </div>
                        
                        {/* Content Area */}
                        <div className="pt-2 pb-6 flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white text-lg transition-colors duration-300">{u.username}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">{u.email}</p>
                                </div>
                                <div>
                                    {u.is_verified ? 
                                        <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max transition-colors duration-300">
                                            <FaCheckCircle/> Verified
                                        </span> : 
                                        <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max transition-colors duration-300">
                                            <FaTimesCircle/> Unverified
                                        </span>
                                    }
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-3 block transition-colors duration-300">
                                Joined: {new Date(u.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AccountList;