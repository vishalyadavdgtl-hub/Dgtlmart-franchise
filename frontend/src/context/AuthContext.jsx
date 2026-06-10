import { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthContext
 * 
 * Manages global authentication state including:
 * - User authentication status
 * - Token management
 * - Redirect-after-login functionality
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    partnerToken: null,
    adminToken: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const partnerToken = localStorage.getItem('partnerToken');
    const adminToken = localStorage.getItem('adminToken');

    setAuthState({
      isAuthenticated: !!(partnerToken || adminToken),
      partnerToken,
      adminToken,
      user: null,
    });

    setLoading(false);
  }, []);

  const login = (tokens) => {
    if (tokens.partnerToken) localStorage.setItem('partnerToken', tokens.partnerToken);
    if (tokens.adminToken) localStorage.setItem('adminToken', tokens.adminToken);

    setAuthState(prev => ({
      ...prev,
      isAuthenticated: true,
      ...tokens,
    }));
  };

  const logout = () => {
    localStorage.removeItem('partnerData');
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('adminToken');

    setAuthState({
      isAuthenticated: false,
      partnerToken: null,
      adminToken: null,
      user: null,
    });
  };

  const getRedirectPath = () => {
    const saved = sessionStorage.getItem('redirectAfterLogin');
    if (saved) {
      sessionStorage.removeItem('redirectAfterLogin');
      return saved;
    }
    return null;
  };

  const saveRedirectPath = (path) => {
    sessionStorage.setItem('redirectAfterLogin', path);
  };

  const value = {
    ...authState,
    loading,
    login,
    logout,
    getRedirectPath,
    saveRedirectPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * Access authentication state and methods anywhere in the app
 * 
 * Usage:
 * const { isAuthenticated, login, logout, getRedirectPath } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
