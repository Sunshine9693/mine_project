import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        // Silent catch: user is simply unauthenticated
        console.log('[AURA Auth] No active session found');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data && response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('[AURA Auth] Logout API error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
      setError
    }}>
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
