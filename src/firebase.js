import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCnj3wZDNuP6I9ijyoZj99QuZvj3LR8nJg",
  authDomain: "mommy-rosal-catering.firebaseapp.com",
  databaseURL: "https://mommy-rosal-catering-default-rtdb.firebaseio.com",
  projectId: "mommy-rosal-catering",
  storageBucket: "mommy-rosal-catering.firebasestorage.app",
  messagingSenderId: "1088700671157",
  appId: "1:1088700671157:web:36ca0d6d3385ab90088afc",
  measurementId: "G-1RJD12RTFY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Initialize the Google Provider
const googleProvider = new GoogleAuthProvider();

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

// Export googleProvider so Auth.jsx can use it
export { auth, db, rtdb, googleProvider }; 
export default app;