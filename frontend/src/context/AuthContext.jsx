import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshRequestRef = useRef(null);

  const refreshUser = useCallback(() => {
    if (refreshRequestRef.current) return refreshRequestRef.current;
    setLoading(true);
    const request = (async () => {
      try {
        const response = await api.get('/auth/me');
        const nextUser = response.data?.user || response.data?.data;
        if (response.data?.success && nextUser) {
          setUser(nextUser);
          setIsAuthenticated(true);
          return nextUser;
        }
        setUser(null);
        setIsAuthenticated(false);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        refreshRequestRef.current = null;
      }
      return null;
    })();
    refreshRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        setUser(response.data.user || response.data.data);
        setIsAuthenticated(true);
        return { success: true };
      }
      const message = response.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, error: message };
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
        setUser(response.data.user || response.data.data);
        setIsAuthenticated(true);
        return { success: true };
      }
      const message = response.data?.message || 'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
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
      setUser,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
      refreshUser,
      setError
    }}>      {children}
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
