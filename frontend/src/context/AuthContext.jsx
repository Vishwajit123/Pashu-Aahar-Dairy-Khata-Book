import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  isGuest: false,
  continueAsGuest: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return sessionStorage.getItem('pashu_guest_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Get initial active session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.warn('Supabase getSession failed, continuing without session:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const continueAsGuest = () => {
    setIsGuest(true);
    try {
      sessionStorage.setItem('pashu_guest_mode', 'true');
    } catch {
      // ignore
    }
  };

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase Anon Key is not yet configured. Please add VITE_SUPABASE_ANON_KEY to your frontend/.env file.'
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setIsGuest(false);
    try {
      sessionStorage.removeItem('pashu_guest_mode');
    } catch {
      // ignore
    }
    return data;
  };

  const signUp = async ({ email, password, fullName }) => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase Anon Key is not yet configured. Please add VITE_SUPABASE_ANON_KEY to your frontend/.env file.'
      );
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    setIsGuest(false);
    try {
      sessionStorage.removeItem('pashu_guest_mode');
    } catch {
      // ignore
    }
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        isGuest,
        continueAsGuest,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
