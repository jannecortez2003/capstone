// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // MUST IMPORT AUTH
import { getFirestore } from "firebase/firestore"; // MUST IMPORT FIRESTORE

// Your web app's real Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnj3wZDNuP6I9ijyoZj99QuZvj3LR8nJg",
  authDomain: "mommy-rosal-catering.firebaseapp.com",
  projectId: "mommy-rosal-catering",
  storageBucket: "mommy-rosal-catering.firebasestorage.app",
  messagingSenderId: "1088700671157",
  appId: "1:1088700671157:web:36ca0d6d3385ab90088afc",
  measurementId: "G-1RJD12RTFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Firestore database
const auth = getAuth(app);
const db = getFirestore(app);

// Create default admin account if it doesn't exist
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@mommyrosal.com";
    const adminPassword = "Admin@123";
    
    await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("Default admin account created successfully");
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("Admin account already exists");
    } else {
      console.error("Error creating admin account:", error);
    }
  }
};

createDefaultAdmin();

// MUST EXPORT BOTH auth AND db HERE so the rest of the app can use them
export { auth, db }; 
export default app;