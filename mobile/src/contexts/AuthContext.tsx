/**
 * Authentication Context – powered by Supabase Auth.
 * Works on both native (Expo) and web platforms.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { Profile } from '../../lib/types';

// Lightweight user object exposed to the rest of the app
export interface AppUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; username: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Map a Supabase auth user + profile row into our lightweight AppUser. */
function toAppUser(authUser: SupabaseUser, profile?: Profile | null): AppUser {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    username: profile?.username ?? authUser.email ?? '',
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ----- Bootstrap session on mount & listen for changes -----
  useEffect(() => {
    // 1. Get existing session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        await loadProfile(s.user);
      }
      setLoading(false);
    });

    // 2. Subscribe to auth changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s?.user) {
          await loadProfile(s.user);
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /** Fetch the profile row and merge with auth user. */
  const loadProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setUser(toAppUser(authUser, profile as Profile | null));
    } catch {
      // Profile may not exist yet (e.g. right after sign-up before trigger fires)
      setUser(toAppUser(authUser, null));
    }
  };

  // ----- Auth actions -----

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (data: {
    email: string;
    password: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
        },
      },
    });
    if (error) throw error;

    // Upsert the profile row so it exists immediately
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        username: data.username,
        email: data.email,
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
      });
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadProfile(authUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
