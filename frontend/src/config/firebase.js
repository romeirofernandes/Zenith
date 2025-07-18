import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyALZ8yKLCY5h7PrJYZeM4lxwHfcuFMkXGI",
  authDomain: "rait-487bf.firebaseapp.com",
  projectId: "rait-487bf",
  storageBucket: "rait-487bf.firebasestorage.app",
  messagingSenderId: "656829104476",
  appId: "1:656829104476:web:75f5c164227632619ac199",
  measurementId: "G-1XGD1K9Y16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);