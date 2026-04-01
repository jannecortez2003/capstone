import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';

const AdminLayout = () => {
  // Grab the user data from local storage
  const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
  let isAdmin = false;

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      // Check if they actually have the admin role
      if (user.role === 'admin' || user.username === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Error parsing user data for security check", e);
    }
  }

  // If they are NOT an admin, immediately kick them to the home page!
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If they ARE an admin, let them see the dashboard!
  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">
      <Sidebar />
      
      {/* RESPONSIVE PADDING:
        - Mobile: pt-[70px] pushes content below the new top navbar.
        - Desktop (md): pl-64 pushes content to the right of the sidebar, pt-0 removes top spacing.
      */}
      <div className="flex-1 overflow-auto w-full pt-[70px] md:pt-0 md:pl-64">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;