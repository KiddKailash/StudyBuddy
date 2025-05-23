/**
 * Authentication Service Module
 * 
 * Handles user authentication, registration, token management, and user sessions.
 * Provides functions for login, registration, token validation, and user profile fetching.
 */

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";
import { getToken, setToken } from "./localStorageService";

const BACKEND = getBackendUrl();

/**
 * Authenticates a user with email/password
 * 
 * @param {Object} payload - User credentials (email and password)
 * @returns {Object} - User data and authentication token
 */
export const loginUser = async (payload) => {
  const response = await axios.post(`${BACKEND}/api/auth/login`, payload);
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};

/**
 * Registers a new user
 * 
 * @param {Object} payload - User registration data (name, email, password)
 * @returns {Object} - Created user and authentication token
 */
export const registerUser = async (payload) => {
  const response = await axios.post(`${BACKEND}/api/auth/register`, payload);
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};

/**
 * Authenticate user with Google OAuth
 * 
 * @param {string} tokenId - Google OAuth token ID
 * @returns {Object} - User data and authentication token
 */
export const googleLoginUser = async (tokenId) => {
  const response = await axios.post(`${BACKEND}/api/auth/google`, {
    token: tokenId,
  });
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};

/**
 * Fetch current user profile from token
 * 
 * @returns {Object|null} - Current user data or null if not authenticated
 */
export const fetchCurrentUser = async () => {
  const localToken = getToken();
  if (!localToken) {
    console.log('authService: No token found in localStorage');
    return null;
  }
  
  try {
    console.log('authService: Fetching current user with token');
    const resp = await axios.get(`${BACKEND}/api/auth/me`, {
      headers: { Authorization: `Bearer ${localToken}` },
    });
    
    console.log('authService: User fetch successful');
    return resp.data.user;
  } catch (err) {
    console.error("authService: fetchCurrentUser error:", err);
    console.error("authService: Error status:", err.response?.status);
    console.error("authService: Error details:", err.response?.data || 'No response data');
    
    // Check if the token might be invalid
    if (err.response?.status === 401) {
      console.error("authService: Unauthorized - token may be invalid or expired");
    }
    
    return null;
  }
};

/**
 * Refresh the authentication token
 * 
 * @param {string} oldToken - Current token to refresh
 * @returns {string|null} - New token or null if refresh failed
 */
export const refreshToken = async (oldToken) => {
  try {
    const response = await axios.post(
      `${BACKEND}/api/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${oldToken}` } }
    );
    const newToken = response.data.token;
    if (newToken) {
      setToken(newToken);
    }
    return newToken;
  } catch (error) {
    console.error("Refresh token error:", error);
    return null;
  }
};

/**
 * Check if a token is expired
 * 
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTimestamp = decoded.exp * 1000; // Convert to milliseconds
    return expiryTimestamp <= Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Calculate time until token expiry
 * 
 * @param {string} token - JWT token to check
 * @returns {number} - Milliseconds until expiry, -1 if error
 */
export const getTimeUntilExpiry = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTimestamp = decoded.exp * 1000; // Convert to milliseconds
    return expiryTimestamp - Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return -1;
  }
};

/**
 * Log out current user by removing token
 */
export const logout = () => {
  setToken(null);
};

export default {
  loginUser,
  registerUser,
  googleLoginUser,
  fetchCurrentUser,
  refreshToken,
  isTokenExpired,
  getTimeUntilExpiry,
  logout
}; 