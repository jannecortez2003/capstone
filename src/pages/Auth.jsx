import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaArrowLeft, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

const Auth = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", isError: false, callback: null });

  const showModal = (title, message, isError, callback = null) => {
    setModal({ isOpen: true, title, message, isError, callback });
  };

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
    if (modal.callback) modal.callback();
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, 
          name: user.displayName || 'Google User', 
          googleId: user.uid 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.user);
      } else {
        showModal("Google Login Failed", data.message, true);
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
         showModal("Authentication Error", error.message, true);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const isAdminAccount = loginEmail.includes("admin") || loginEmail.includes("manager") || loginEmail.includes("staff");

      if (isAdminAccount) {
         const res = await fetch(`${apiUrl}/adminlogin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: loginEmail, password: loginPassword })
         });
         const data = await res.json();
         if (data.success) onLogin(data.admin || { role: 'admin' });
         else showModal("Login Failed", data.message, true);
         return;
      }

      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        showModal("Login Failed", data.message || "Invalid credentials.", true);
      }
    } catch (error) {
      showModal("Error", "Failed to connect to the server.", true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      showModal("Registration Failed", "Passwords do not match.", true);
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();

      if (data.success) {
        showModal("Account Created", "You can now sign in with your credentials.", false, () => {
          setIsSignUp(false); 
          setRegName(""); setRegEmail(""); setRegPassword(""); setRegConfirmPassword("");
        });
      } else {
        showModal("Registration Failed", data.message, true);
      }
    } catch (error) {
      showModal("Error", "Failed to connect to the server.", true);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/60 backdrop-blur-sm transition-colors duration-300">
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center gap-2 text-white font-bold hover:text-pink-400 transition z-[70]">
        <FaArrowLeft /> Back to Home
      </button>

      <div className="relative w-full max-w-3xl h-[580px] md:h-[550px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20 dark:border-gray-700">
        
        {/* Left Side: Sign Up (Overlap fix: w-[51%]) */}
        <div className={`absolute top-0 left-0 h-full w-full md:w-[51%] transition-transform duration-700 ease-in-out z-10 ${isSignUp ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:opacity-0 md:z-0'}`}>
          <form onSubmit={handleRegister} className="bg-pink-600 h-full flex flex-col items-center justify-center px-8 py-4 text-center text-white">
            <h1 className="font-bold text-3xl mb-1">Create Account</h1>
            <span className="text-xs mb-4 text-pink-100">Join Mommy Rosal's Catering</span>
            
            <button type="button" onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 font-bold py-2 rounded-full hover:bg-gray-100 transition shadow-md mb-4 text-sm">
              <FaGoogle className="text-red-500" /> Sign up with Google
            </button>

            <div className="w-full bg-black/20 rounded-lg flex items-center mb-2 px-3 py-1.5">
              <FaUser className="text-pink-200 m-2 text-sm" />
              <input type="text" placeholder="Full Name" className="bg-transparent outline-none text-white placeholder-pink-200 w-full text-sm" value={regName} onChange={(e) => setRegName(e.target.value)} required />
            </div>
            <div className="w-full bg-black/20 rounded-lg flex items-center mb-2 px-3 py-1.5">
              <FaEnvelope className="text-pink-200 m-2 text-sm" />
              <input type="email" placeholder="Email" className="bg-transparent outline-none text-white placeholder-pink-200 w-full text-sm" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>
            <div className="w-full bg-black/20 rounded-lg flex items-center mb-2 px-3 py-1.5">
              <FaLock className="text-pink-200 m-2 text-sm" />
              <input type="password" placeholder="Password" className="bg-transparent outline-none text-white placeholder-pink-200 w-full text-sm" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            </div>
            <div className="w-full bg-black/20 rounded-lg flex items-center mb-4 px-3 py-1.5">
              <FaLock className="text-pink-200 m-2 text-sm" />
              <input type="password" placeholder="Confirm Password" className="bg-transparent outline-none text-white placeholder-pink-200 w-full text-sm" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="bg-white text-pink-600 font-bold py-2.5 px-10 rounded-full hover:bg-gray-100 transition shadow-lg w-full md:w-auto">SIGN UP</button>
            <p className="mt-4 text-sm md:hidden">Already have an account? <span onClick={() => setIsSignUp(false)} className="underline cursor-pointer font-bold hover:text-pink-200">Sign In</span></p>
          </form>
        </div>

        {/* Right Side: Login (Overlap fix: w-[51%]) */}
        <div className={`absolute top-0 right-0 h-full w-full md:w-[51%] transition-transform duration-700 ease-in-out z-10 ${!isSignUp ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:opacity-0 md:z-0'}`}>
          <form onSubmit={handleLogin} className="bg-white dark:bg-gray-900 h-full flex flex-col items-center justify-center p-8 text-center text-gray-800 dark:text-gray-100 transition-colors duration-300">
            <h1 className="font-bold text-3xl mb-1 text-pink-600 dark:text-pink-400">Sign In</h1>
            <span className="text-sm mb-6 text-gray-500 dark:text-gray-400">Welcome back! Please login to your account.</span>
            
            <button type="button" onClick={handleGoogleAuth} className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 font-bold py-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition shadow-sm mb-6">
              <FaGoogle className="text-red-500" /> Sign in with Google
            </button>

            <div className="w-full flex items-center gap-2 mb-4">
               <hr className="flex-1 border-gray-200 dark:border-gray-700" />
               <span className="text-xs text-gray-400 uppercase font-bold">Or</span>
               <hr className="flex-1 border-gray-200 dark:border-gray-700" />
            </div>

            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center mb-4 px-3 py-2 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <FaEnvelope className="text-pink-500 m-2" />
              <input type="text" placeholder="Email or Username" className="bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 w-full text-sm" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center mb-6 px-3 py-2 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <FaLock className="text-pink-500 m-2" />
              <input type="password" placeholder="Password" className="bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400 w-full text-sm" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            </div>

            <button type="submit" className="bg-pink-600 text-white font-bold py-2.5 px-10 rounded-full hover:bg-pink-700 transition shadow-lg w-full md:w-auto">SIGN IN</button>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 md:hidden">Don't have an account? <span onClick={() => setIsSignUp(true)} className="text-pink-600 dark:text-pink-400 underline cursor-pointer font-bold">Sign Up</span></p>
          </form>
        </div>

        {/* Sliding Overlay for Desktop (Kept at w-1/2 for perfect animation math) */}
        <div className={`hidden md:flex absolute top-0 left-0 h-full w-1/2 bg-pink-600/30 backdrop-blur-sm transition-transform duration-700 ease-in-out z-20 items-center justify-center text-white ${isSignUp ? 'translate-x-full' : 'translate-x-0'}`}>
            <div className="text-center p-8 bg-black/50 rounded-3xl backdrop-blur-md shadow-2xl mx-4 border border-white/10">
                <h2 className="text-2xl font-bold mb-3">{isSignUp ? "Welcome Back!" : "Hello, Friend!"}</h2>
                <p className="mb-6 text-sm text-gray-200">{isSignUp ? "To keep connected with us please login with your personal info" : "Enter your details and start your journey with Mommy Rosal's"}</p>
                <button onClick={() => setIsSignUp(!isSignUp)} className="border-2 border-white rounded-full px-8 py-2 font-bold text-sm hover:bg-white hover:text-pink-600 transition">
                    {isSignUp ? "SIGN IN" : "SIGN UP"}
                </button>
            </div>
        </div>

      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] bg-black/60 backdrop-blur-sm transition-colors duration-300">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center transform transition-all border dark:border-gray-700 mx-4">
            <h2 className={`text-2xl font-bold mb-4 ${modal.isError ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>{modal.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{modal.message}</p>
            <button onClick={closeModal} className={`px-6 py-2 rounded-full text-white font-bold transition shadow-md w-full ${modal.isError ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;