import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";
import { getToken, setToken } from "./localStorageService";

const BACKEND = getBackendUrl();

export const loginUser = async (payload) => {
  const response = await axios.post(`${BACKEND}/api/auth/login`, payload);
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await axios.post(`${BACKEND}/api/auth/register`, payload);
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};

export const googleLoginUser = async (tokenId) => {
  const response = await axios.post(`${BACKEND}/api/auth/google`, {
    token: tokenId,
  });
  if (response.data.token) {
    setToken(response.data.token);
  }
  return response.data;
};

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

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTimestamp = decoded.exp * 1000;
    return expiryTimestamp <= Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const getTimeUntilExpiry = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTimestamp = decoded.exp * 1000;
    return expiryTimestamp - Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return -1;
  }
};

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