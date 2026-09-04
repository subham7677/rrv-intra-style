import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDpJo1gj-88BOMAQjcdAIux0FLMqjFjPVQ",
  authDomain: "rrv-login.firebaseapp.com",
  projectId: "rrv-login",
  storageBucket: "rrv-login.firebasestorage.app",
  messagingSenderId: "463084346548",
  appId: "1:463084346548:web:f3e7a88bb9c77270b48be1",
  measurementId: "G-XQ5TWPTSE9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
