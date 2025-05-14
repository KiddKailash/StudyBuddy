import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import services from '../_SERVICE_EXPORTS';

/**
 * Custom hook for handling authentication state and related operations
 * 
 * This hook manages user authentication state including login, logout, token management,
 * and automatic token refresh. It provides functionality to handle user sessions securely
 * while exposing a clean API for components to interact with authentication features.
 * 
 * @returns {Object} Authentication state and methods to manage authentication
 * @property {Object|null} user - Current authenticated user data or null if not logged in
 * @property {Function} setUser - Function to update user data
 * @property {string|null} token - Current JWT token or null if not authenticated
 * @property {boolean} isLoggedIn - Whether a user is currently authenticated
 * @property {Function} setIsLoggedIn - Function to update login state
 * @property {boolean} authLoading - Whether authentication operations are in progress
 * @property {Function} resetAuth - Function to reset authentication state
 * @property {Function} logout - Function to log out the current user
 * @property {Function} fetchCurrentUser - Function to fetch the current user based on stored token
 * @property {Function} loginUser - Function to log in a user with credentials
 * @property {Function} registerUser - Function to register a new user
 * @property {Function} googleLoginUser - Function to authenticate with Google
 */
export function useAuthentication() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Resets all authentication state and removes stored token
   */
  const resetAuth = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setAuthLoading(false);
    services.storage.removeItem("token");
  };

  /**
   * Logs out the current user and redirects to login page
   */
  const logout = () => {
    resetAuth();
    navigate("/login?mode=login", { replace: true });
  };

  /**
   * Fetches the current user based on token in local storage
   * Sets user and authentication state if successful
   */
  const fetchCurrentUser = async () => {
    const localToken = services.storage.getToken();
    console.log('fetchCurrentUser: token available:', !!localToken);
    
    if (!localToken) {
      console.log('No token found in local storage');
      setAuthLoading(false);
      return;
    }
    
    setToken(localToken);
    try {
      console.log('Fetching current user with token');
      const currentUser = await services.auth.fetchCurrentUser();
      console.log('Current user fetched:', !!currentUser);
      
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
      } else {
        console.warn('User fetch returned null despite having token');
        resetAuth();
      }
    } catch (err) {
      console.error("fetchCurrentUser error:", err);
      console.error("Error details:", err.response?.data || 'No response data');
      resetAuth();
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Sets up an Axios interceptor to handle token refresh and expiration
   * Automatically refreshes tokens before they expire or logs out if expired
   */
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const localToken = services.storage.getToken();
        if (localToken) {
          try {
            // Check how much time is left before token expires
            const timeLeft = services.auth.getTimeUntilExpiry(localToken);
            const oneDay = 24 * 60 * 60 * 1000;
            
            // If token expires within 24 hours but is still valid, refresh it
            if (timeLeft < oneDay && timeLeft > 0) {
              const newToken = await services.auth.refreshToken(localToken);
              if (newToken) {
                setToken(newToken);
                config.headers.Authorization = `Bearer ${newToken}`;
                return config;
              } else {
                return Promise.reject("Token refresh failed");
              }
            } else if (timeLeft <= 0) {
              // Token has already expired, log out
              logout();
              return Promise.reject("Token is expired");
            } else {
              // Token is still valid, use it
              config.headers.Authorization = `Bearer ${localToken}`;
              return config;
            }
          } catch (error) {
            console.error("Error handling token:", error);
            logout();
            return Promise.reject(error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Clean up interceptor on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Sets up automatic logout when token expires
   * Calculates time until expiry and sets up a timer
   */
  useEffect(() => {
    let tokenExpiryTimeout;
    if (token) {
      try {
        const timeLeft = services.auth.getTimeUntilExpiry(token);
        if (timeLeft <= 0) {
          logout();
        } else {
          tokenExpiryTimeout = setTimeout(logout, timeLeft);
        }
      } catch (error) {
        console.error("Error checking token expiry:", error);
        logout();
      }
    }
    return () => {
      if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Logs in a user with provided credentials
   * @param {Object} payload - Login credentials (email/password)
   * @returns {Promise<Object>} User data on successful login
   * @throws {Error} If login fails
   */
  const loginUser = async (payload) => {
    try {
      const data = await services.auth.loginUser(payload);
      fetchCurrentUser();
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  /**
   * Registers a new user
   * @param {Object} payload - Registration information
   * @returns {Promise<Object>} User data on successful registration
   * @throws {Error} If registration fails
   */
  const registerUser = async (payload) => {
    try {
      const data = await services.auth.registerUser(payload);
      fetchCurrentUser();
      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  /**
   * Authenticates user with Google
   * @param {string} tokenId - Google OAuth token ID
   * @returns {Promise<Object>} User data on successful login
   * @throws {Error} If Google login fails
   */
  const googleLoginUser = async (tokenId) => {
    try {
      const data = await services.auth.googleLoginUser(tokenId);
      fetchCurrentUser();
      return data;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  return {
    user,
    setUser,
    token,
    isLoggedIn,
    setIsLoggedIn,
    authLoading,
    resetAuth,
    logout,
    fetchCurrentUser,
    loginUser,
    registerUser,
    googleLoginUser
  };
} 