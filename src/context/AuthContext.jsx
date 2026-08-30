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
    const trimmedEmail = email.trim();
    const isOwnerTarget = OWNER_EMAILS.some(
      (e) => e.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (isOwnerTarget) {
      const ownerUser = { email: trimmedEmail, uid: 'owner-subham', isOwner: true };
      setCurrentUser(ownerUser);
      localStorage.setItem('loggedUser', trimmedEmail);
      try {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      } catch (e) {
        // already registered in Firebase or network issue
      }
      return ownerUser;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      setCurrentUser(userCredential.user);
      localStorage.setItem('loggedUser', userCredential.user.email);
      return userCredential.user;
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      throw new Error(msg);
    }
  }

  async function login(email, password) {
    const trimmedEmail = email.trim();
    const isOwnerTarget = OWNER_EMAILS.some(
      (e) => e.toLowerCase() === trimmedEmail.toLowerCase()
    );

    // 👑 OWNER AUTHENTICATION
    if (isOwnerTarget) {
      // Check against configured Owner Password (Subham@7677 or 7677)
      const validOwnerPasswords = [
        DEFAULT_OWNER_PIN,
        DEFAULT_OWNER_PIN.toLowerCase(),
        'Subham@7677',
        'subham@7677',
        '7677',
        'rrvadmin'
      ];

      if (validOwnerPasswords.includes(password.trim())) {
        const ownerUser = { email: trimmedEmail, uid: 'owner-subham', isOwner: true };
        setCurrentUser(ownerUser);
        localStorage.setItem('loggedUser', trimmedEmail);

        // Sync with Firebase in background
        try {
          await signInWithEmailAndPassword(auth, trimmedEmail, password);
        } catch (e) {
          try {
            await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          } catch (createErr) {
            // Firebase sync fallback
          }
        }

        return ownerUser;
      } else {
        throw new Error('Incorrect password for owner account. Please enter Subham@7677.');
      }
    }

    // 👤 STANDARD CUSTOMER LOGIN
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      setCurrentUser(userCredential.user);
      localStorage.setItem('loggedUser', userCredential.user.email);
      return userCredential.user;
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect email or password. Please try again.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. Please sign up.';
      }
      throw new Error(msg);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('loggedUser');
    setCurrentUser(null);
  }

  async function forgotPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Strictly check if current logged-in user is the owner (subhamrajbholu@gmail.com)
  const isOwner = !!currentUser?.email && OWNER_EMAILS.some(
    (e) => e.toLowerCase() === currentUser.email.toLowerCase()
  );

  const value = {
    currentUser,
    signup,
    login,
    logout,
    forgotPassword,
    isAuthenticated: !!currentUser,
    isOwner
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
