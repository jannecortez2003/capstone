import React from "react";
import Login from "./Account/Login";
import Register from "./Account/Register";
import AdminLogin from "./Account/AdminLogin";

export const SuccessModal = ({ isOpen, onClose, title, message, icon }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-2xl text-center border dark:border-gray-700 transition-colors duration-300">
                <div className="flex justify-center mb-4 text-pink-500">
                    {icon || (
                        <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">{title || "Success"}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

function Modal({ isOpen, onClose, title, children, modalType, handleLogin, handleRegister, handleAdminLogin, size = 'max-w-md' }) {
  if (!isOpen) return null;

  const modalSizeClass = `${size} w-full m-4`;
  
  const isCustomContainer = title === null;
  
  const contentClasses = isCustomContainer 
    ? `${modalSizeClass}`
    : `bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-8 border dark:border-gray-700 transition-colors duration-300 ${modalSizeClass}`;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-colors duration-300">
      <div className={`${contentClasses} shadow-xl`}>
        
        {title !== null && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"              
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {modalType === "login" && <Login onLogin={handleLogin} />}
        {modalType === "signup" && <Register onRegister={handleRegister} />}
        {modalType === "admin" && <AdminLogin onAdminLogin={handleAdminLogin} />} 
        {children}
      </div>
    </div>
  );
}

export default Modal;