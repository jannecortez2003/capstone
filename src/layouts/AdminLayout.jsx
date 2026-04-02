import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';

const AdminLayout = () => {
  const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
  let isAdmin = false;

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.role === 'admin' || user.username === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Error parsing user data for security check", e);
    }
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    // Changed bg-gray-100 to dark:bg-gray-900
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 flex-col md:flex-row transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 overflow-auto w-full pt-[70px] md:pt-0 md:pl-64">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;