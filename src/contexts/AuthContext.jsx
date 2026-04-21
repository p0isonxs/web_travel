import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseEnabled } from '../lib/supabase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(supabaseEnabled);

  function login(email, password) {
    if (!supabase) return Promise.reject(new Error('Supabase belum dikonfigurasi untuk login.'));
    return supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
      if (error) throw error;
      return data;
    });
  }

  function logout() {
    if (!supabase) return Promise.resolve();
    return supabase.auth.signOut();
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
