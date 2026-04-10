import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

  function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
        return signOut(auth);
  }

  useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
                setCurrentUser(user);
                setLoading(false);
        });
        return unsubscribe;
  }, []);

  const value = {
        currentUser,
        loading,
        login,
        logout
  };

  return (
        <AuthContext.Provider value={value}>
          {!loading && children}
        </AuthContext.Provider>
      );
}
