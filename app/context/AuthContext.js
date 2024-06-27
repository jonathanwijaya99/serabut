// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUser({ ...user, ...userDoc.data() });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await auth.signOut(); // Firebase sign out method
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
