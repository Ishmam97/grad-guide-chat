// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1zjOBIMJZnVi30Gy6nGvoVzJLXiUri0U",
  authDomain: "ualr-grad-chat.firebaseapp.com",
  projectId: "ualr-grad-chat",
  storageBucket: "ualr-grad-chat.firebasestorage.app",
  messagingSenderId: "811139354570",
  appId: "1:811139354570:web:0f7503fb333f67e9f48933",
  measurementId: "G-9YBNG7PD6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;