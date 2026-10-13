import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getFriendlyErrorMessage } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: false,
  isConfigured: false,
  signInWithPassword: async () => {},
  signUpWithPassword: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session from local storage without making eager remote network calls if unauthenticated
    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('Supabase getSession error:', error.message);
      }
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      console.warn('Failed to retrieve Supabase session:', err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signUpWithPassword = useCallback(async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirectTo = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirectTo = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }
    const redirectTo = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      setSession(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out warning:', error.message);
    }
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        resetPassword,
        signOut,
        getFriendlyErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
