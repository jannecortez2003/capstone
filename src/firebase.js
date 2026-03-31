import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  authDomain: "mommy-rosal-catering.firebaseapp.com",
  projectId: "mommy-rosal-catering",
  storageBucket: "mommy-rosal-catering.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

// Call createDefaultAdmin when the app initializes
createDefaultAdmin();

export { auth };
export default app; 