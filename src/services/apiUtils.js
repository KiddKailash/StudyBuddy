import { getToken } from "./localStorageService";

// Cache for knowing which endpoints have failed
let failedEndpoints = {};

// Re-export getToken
export { getToken };

/**
 * Records that an endpoint has failed, to avoid retrying it
 */
export const recordEndpointError = (endpoint) => {
  // Only store errors for singular endpoints that have alternatives
  // Since we standardized on plural endpoints, we don't need to record failures
  console.log(`Not recording endpoint error for ${endpoint} as we're using standardized endpoints now`);
};

/**
 * Checks if an endpoint has already failed
 */
export const hasEndpointFailed = (endpoint) => {
  // With standardized plural endpoints, we should never skip requests due to previous failures
  return false;
};

/**
 * Get authentication headers for a request
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Export any utility functions for handling API errors
export const handleApiError = (error, context) => {
  const errorMessage = error.response?.data?.message || error.message;
  console.error(`API Error in ${context || "API call"}:`, errorMessage);
  return errorMessage;
};

/**
 * Utility to get the appropriate backend URL based on environment
 */
export const getBackendUrl = () => {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8080";
  } else {
    return "https://api.clipcard.cc";
  }
};

export default {
  getAuthHeaders,
  getBackendUrl,
  hasEndpointFailed,
  recordEndpointError,
  handleApiError,
}; 