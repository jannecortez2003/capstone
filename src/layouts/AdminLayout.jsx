import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import { rtdb } from '../firebase';
import { ref, set, onDisconnect, onValue } from 'firebase/database';

const AdminLayout = () => {
  const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
  let isAdmin = false;

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (['admin', 'manager', 'staff'].includes(user.role) || user.username === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Error parsing user data for security check", e);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    try {
      const statusRef = ref(rtdb, `/status/admin`);
      const connectedRef = ref(rtdb, ".info/connected");
      
      const unsubscribe = onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          onDisconnect(statusRef).set({ state: "offline", lastChanged: Date.now() }).then(() => {
            set(statusRef, { state: "online", lastChanged: Date.now() });
          });
        }
      });

      return () => {
        unsubscribe();
        set(statusRef, { state: "offline", lastChanged: Date.now() }).catch(() => {});
      };
    } catch (err) {
      console.warn("Admin presence disabled - RTDB issue:", err);
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
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