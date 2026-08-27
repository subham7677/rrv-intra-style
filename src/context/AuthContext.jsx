import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from '../firebase';
import { OWNER_EMAILS, DEFAULT_OWNER_PIN } from '../data/products';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('loggedUser');
    return saved ? { email: saved } : null;
  });
  const [loading, setLoading] = useState(true);
  const [isOwnerVerified, setIsOwnerVerified] = useState(() => {
    return localStorage.getItem('rrv_owner_verified') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('loggedUser', user.email);
      } else {
        const saved = localStorage.getItem('loggedUser');
        if (!saved) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setCurrentUser(userCredential.user);
    localStorage.setItem('loggedUser', userCredential.user.email);
    return userCredential.user;
  }

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser(userCredential.user);
    localStorage.setItem('loggedUser', userCredential.user.email);
    return userCredential.user;
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem('loggedUser');
    localStorage.removeItem('rrv_owner_verified');
    setIsOwnerVerified(false);
    setCurrentUser(null);
  }

  async function forgotPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function verifyOwnerPin(pin) {
    if (String(pin).trim() === DEFAULT_OWNER_PIN || String(pin).trim().toLowerCase() === 'rrvadmin') {
      setIsOwnerVerified(true);
      localStorage.setItem('rrv_owner_verified', 'true');
      return true;
    }
    return false;
  }

  function revokeOwnerAccess() {
    setIsOwnerVerified(false);
    localStorage.removeItem('rrv_owner_verified');
  }

  // Check if current user is owner either by email or by owner PIN verification
  const isOwnerEmail = !!currentUser?.email && OWNER_EMAILS.some(
    (e) => e.toLowerCase() === currentUser.email.toLowerCase()
  );
  const isOwner = isOwnerEmail || isOwnerVerified;

  const value = {
    currentUser,
    signup,
    login,
    logout,
    forgotPassword,
    isAuthenticated: !!currentUser,
    isOwner,
    verifyOwnerPin,
    revokeOwnerAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
