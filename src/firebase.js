import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDpJo1gj-88BOMAQjcdAIux0FLMqjFjPVQ",
  authDomain: "rrv-login.firebaseapp.com",
  projectId: "rrv-login",
  storageBucket: "rrv-login.firebasestorage.app",
  messagingSenderId: "463084346548",
  appId: "1:463084346548:web:f3e7a88bb9c77270b48be1",
  measurementId: "G-XQ5TWPTSE9"
};

// 🔥 INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
};

export default app;
