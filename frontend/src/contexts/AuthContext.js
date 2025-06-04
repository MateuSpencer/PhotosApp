import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on component mount
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Authentication check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    const response = await authAPI.login(username, password);
    const { key } = response.data;
    localStorage.setItem('authToken', key);
    
    // Get user data
    const userResponse = await authAPI.getCurrentUser();
    setCurrentUser(userResponse.data);
    setIsAuthenticated(true);
    return userResponse.data;
  };

  const register = async (username, email, password1, password2) => {
    const response = await authAPI.register(username, email, password1, password2);
    const { key } = response.data;
    localStorage.setItem('authToken', key);
    
    // Get user data
    const userResponse = await authAPI.getCurrentUser();
    setCurrentUser(userResponse.data);
    setIsAuthenticated(true);
    return userResponse.data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
