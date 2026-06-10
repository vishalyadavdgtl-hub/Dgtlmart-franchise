/**
 * Auth Utilities
 * 
 * Helper functions for authentication and token management
 */

/**
 * Check if user has a valid token
 * @param {string|string[]} tokenTypes - Token type(s) to check ('clientToken', 'partnerToken', 'adminToken')
 * @returns {boolean} - True if user has at least one of the required tokens
 */
export const isAuthenticated = (tokenTypes = ['partnerToken', 'adminToken']) => {
  const types = Array.isArray(tokenTypes) ? tokenTypes : [tokenTypes];
  return types.some(type => localStorage.getItem(type));
};

/**
 * Get the active token (priority: clientToken > partnerToken > adminToken)
 * @returns {string|null} - The token or null if not authenticated
 */
export const getActiveToken = () => {
  const partnerToken = localStorage.getItem('partnerToken');
  const adminToken = localStorage.getItem('adminToken');
  
  return partnerToken || adminToken;
};

/**
 * Get a specific token by type
 * @param {string} tokenType - Token type ('clientToken', 'partnerToken', 'adminToken')
 * @returns {string|null} - The token or null if not found
 */
export const getToken = (tokenType) => {
  return localStorage.getItem(tokenType);
};

/**
 * Check if token exists and is valid (not expired)
 * Note: This is a basic check. For production, decode JWT to verify expiry.
 * @param {string} tokenType - Token type to check
 * @returns {boolean} - True if token exists
 */
export const isTokenValid = (tokenType) => {
  const token = localStorage.getItem(tokenType);
  if (!token) return false;

  // Basic validation - in production, you should decode JWT and check expiry
  // For now, just check if token exists and is not empty
  return token.length > 0;
};

/**
 * Clear authentication tokens
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('partnerData');
  localStorage.removeItem('partnerToken');
  localStorage.removeItem('adminToken');
};

/**
 * Clear redirect path from session storage
 */
export const clearRedirectPath = () => {
  sessionStorage.removeItem('redirectAfterLogin');
};

/**
 * Get redirect path stored during protected route access
 * @returns {string|null} - The stored redirect path or null
 */
export const getRedirectPath = () => {
  const path = sessionStorage.getItem('redirectAfterLogin');
  if (path) {
    sessionStorage.removeItem('redirectAfterLogin');
    return path;
  }
  return null;
};

/**
 * Save redirect path for post-login navigation
 * @param {string} path - The path to redirect to after login
 */
export const saveRedirectPath = (path) => {
  sessionStorage.setItem('redirectAfterLogin', path);
};

/**
 * Decode JWT payload (basic decoding, not cryptographically verified)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  return Date.now() >= decoded.exp * 1000;
};

/**
 * Get user info from token
 * @param {string} tokenType - Token type to extract user from
 * @returns {object|null} - User info from token or null
 */
export const getUserFromToken = (tokenType) => {
  const token = localStorage.getItem(tokenType);
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded ? { id: decoded.id, email: decoded.email, role: decoded.role } : null;
};
