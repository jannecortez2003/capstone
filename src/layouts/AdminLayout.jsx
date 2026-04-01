import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';

const AdminLayout = () => {
  // 1. Grab the user data from local storage
  const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
  let isAdmin = false;

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      // 2. Check if they actually have the admin role
      if (user.role === 'admin' || user.username === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Error parsing user data for security check", e);
    }
  }

  // 3. THE BOUNCER: If they are NOT an admin, immediately kick them to the home page!
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 4. If they ARE an admin, let them see the dashboard!
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-64 pt-16">
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;