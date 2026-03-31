import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartLine,
  FaCalendarAlt,
  FaBoxes,
  FaUtensils,
  FaComments,
  FaUsers,
  FaMoneyBillWave,
  FaChartBar,
  FaUserCheck
} from 'react-icons/fa';

const menuItems = [
  { icon: <FaChartLine />, text: 'Dashboard', path: '/admin' },
  { icon: <FaCalendarAlt />, text: 'Booking Requests', path: '/admin/booking-requests' },
  { icon: <FaBoxes />, text: 'Inventory', path: '/admin/inventory' },
  { icon: <FaUtensils />, text: 'Menu Items', path: '/admin/menu-items' },
  { icon: <FaComments />, text: 'Customer Chat', path: '/admin/customer-chat' },
  { icon: <FaUsers />, text: 'Staff Page', path: '/admin/staff' },
  { icon: <FaMoneyBillWave />, text: 'Payment Tracking', path: '/admin/payment-tracking' },
  { icon: <FaChartBar />, text: 'Reports', path: '/admin/reports' },
  { icon: <FaUserCheck />, text: 'User Verification', path: '/admin/verification' }
];

const Sidebar = () => {
  console.log("Rendering Sidebar component");
  return (
    <div className="fixed inset-y-0 left-0 bg-gray-900 text-white w-64">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-pink-500">Mommy Rosal</h1>
        <p className="text-sm text-gray-400">Admin Dashboard</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-pink-500 transition-colors"
          >
            <span className="mr-3">{item.icon}</span>
            {item.text}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 