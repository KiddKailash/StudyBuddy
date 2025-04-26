import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import services from '../index';

/**
 * Custom hook for handling authentication state and related operations
 */
export function useAuthentication() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // Reset authentication state
  const resetAuth = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setAuthLoading(false);
    services.storage.removeItem("token");
  };

  // Handle user logout
  const logout = () => {
    resetAuth();
    navigate("/login?mode=login", { replace: true });
  };

  // Fetch current user on mount
  const fetchCurrentUser = async () => {
    const localToken = services.storage.getToken();
    if (!localToken) {
      setAuthLoading(false);
      return;
    }
    setToken(localToken);
    try {
      const currentUser = await services.auth.fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
      } else {
        resetAuth();
      }
    } catch (err) {
      console.error("fetchCurrentUser error:", err);
      resetAuth();
    } finally {
      setAuthLoading(false);
    }
  };

  // Setup token refresh interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const localToken = services.storage.getToken();
        if (localToken) {
          try {
            const timeLeft = services.auth.getTimeUntilExpiry(localToken);
            const oneDay = 24 * 60 * 60 * 1000;
            
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
              logout();
              return Promise.reject("Token is expired");
            } else {
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

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto logout on token expiry
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

  // Login methods
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