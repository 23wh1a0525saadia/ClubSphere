import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(profileData);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Update failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
