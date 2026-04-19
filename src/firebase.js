import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // 1. MUST IMPORT THIS

const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  authDomain: "mommy-rosal-catering.firebaseapp.com",
  projectId: "mommy-rosal-catering",
  storageBucket: "mommy-rosal-catering.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // 2. MUST INITIALIZE THIS

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

// 3. MUST EXPORT BOTH auth AND db HERE
export { auth, db }; 
export default app;