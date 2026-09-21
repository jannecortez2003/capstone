// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { getDatabase } from "firebase/database"; // NEW IMPORT

const firebaseConfig = {
  apiKey: "AIzaSyCnj3wZDNuP6I9ijyoZj99QuZvj3LR8nJg",
  authDomain: "mommy-rosal-catering.firebaseapp.com",
  
  // ---> PASTE YOUR COPIED REALTIME DATABASE URL HERE: <---
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

// Explicitly initialize RTDB with our app
const rtdb = getDatabase(app); 

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

export { auth, db, rtdb }; 
export default app;