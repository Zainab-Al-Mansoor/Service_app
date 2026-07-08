'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'provider' | 'admin';
  is_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: User['role']) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await apiClient.getCurrentUser();

      if (!error && data) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.full_name,
          phone: data.user.phone,
          avatar_url: data.user.avatar_url,
          role: data.user.role,
          is_verified: data.user.is_verified,
          created_at: data.user.created_at,
        });
      } else if (error?.status === 401) {
        // Token is invalid - clear it and redirect happens in apiClient
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check if there's a token stored
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          await fetchProfile();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: User['role']) => {
    try {
      const result = await apiClient.register(email, password, fullName, role);

      if (result.error) {
        return { error: new Error(result.error.message) };
      }

      if (result.data?.user) {
        setUser({
          id: result.data.user.id,
          email: result.data.user.email,
          full_name: result.data.user.full_name,
          phone: result.data.user.phone || null,
          avatar_url: null,
          role: result.data.user.role,
          is_verified: result.data.user.is_verified,
          created_at: result.data.user.created_at,
        });
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };
const signIn = async (email: string, password: string) => {
  try {
    const result = await apiClient.login(email, password);

    if (result.error) {
      return { user: null, error: new Error(result.error.message) };
    }

    let loggedInUser: User | null = null;

    if (result.data?.user) {
      loggedInUser = {
        id: result.data.user.id,
        email: result.data.user.email,
        full_name: result.data.user.full_name,
        phone: result.data.user.phone || null,
        avatar_url: null,
        role: result.data.user.role,
        is_verified: result.data.user.is_verified,
        created_at: result.data.user.created_at,
      };
      setUser(loggedInUser);
    }

    return { user: loggedInUser, error: null }; // 👈 Ab hum user object bhi return kar rahe hain
  } catch (err) {
    return { user: null, error: err as Error };
  }
};

  const signOut = async () => {
    await apiClient.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
