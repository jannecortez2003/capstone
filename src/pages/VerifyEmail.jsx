import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); 
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage("No verification token provided.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    })
    .catch(() => {
      setStatus('error');
      setMessage("Server connection failed.");
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border dark:border-gray-700">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-pink-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Verifying Email...</h2>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-5xl text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Verified!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <button onClick={() => navigate('/auth')} className="bg-pink-600 text-white font-bold px-8 py-2.5 rounded-full hover:bg-pink-700 transition">
              Go to Login
            </button>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <FaTimesCircle className="text-5xl text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <button onClick={() => navigate('/auth')} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold px-8 py-2.5 rounded-full hover:bg-gray-300 transition">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;