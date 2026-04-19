import React from 'react';

const PaymentTracking = () => {
  return (
    <div className="p-6 h-[calc(100vh-2rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
      <p className="text-gray-500 mb-6">Manage your catering business</p>
      
      <h2 className="text-xl font-bold mb-4">Payment Tracking</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Payment tracking functionality goes here...</p>
      </div>
    </div>
  );
};

export default PaymentTracking;