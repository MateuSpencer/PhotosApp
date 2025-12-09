/**
 * Authentication Context for React Native
 * Manages user authentication state and token storage
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api, TokenStorage } from '../../shared/api/client';
import { User, AuthTokens, LoginResponse, RegisterRequest, RegisterResponse } from '../../shared/types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'narratives_access_token';
const REFRESH_TOKEN_KEY = 'narratives_refresh_token';
const USER_KEY = 'narratives_user';

// Platform-aware storage helper
// expo-secure-store doesn't work on web, so we use localStorage for web
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Implement TokenStorage using platform-aware storage
const secureTokenStorage: TokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return await storage.getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return await storage.getItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(tokens: AuthTokens): Promise<void> {
    await storage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    await storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  },
  async clearTokens(): Promise<void> {
    await storage.deleteItem(ACCESS_TOKEN_KEY);
    await storage.deleteItem(REFRESH_TOKEN_KEY);
  },
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configure API client with token storage
    api.setTokenStorage(secureTokenStorage);

    // Check for existing session on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await storage.getItem(ACCESS_TOKEN_KEY);
      const storedUser = await storage.getItem(USER_KEY);

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid by fetching profile
        try {
          const profile = await api.getProfile();
          setUser({
            id: profile.user.id,
            username: profile.username,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
          });
        } catch (error) {
          // Token invalid, clear storage
          await secureTokenStorage.clearTokens();
          await storage.deleteItem(USER_KEY);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login(username, password);
      setUser(response.user);
      await storage.setItem(USER_KEY, JSON.stringify(response.user));
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await api.register(data);
      setUser(response.user);
      await storage.setItem(USER_KEY, JSON.stringify(response.user));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.deleteItem(USER_KEY);
      setUser(null);
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await api.getProfile();
      const updatedUser = {
        id: profile.user.id,
        username: profile.username,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      };
      setUser(updatedUser);
      await storage.setItem(USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
