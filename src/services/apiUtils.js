/**
 * API Utilities Module
 * 
 * This module provides common utilities for API interactions throughout the application.
 * It includes functions for managing authentication headers, handling API errors,
 * configuring backend URLs, and managing failed endpoints.
 */

import { getToken } from "./localStorageService";

// Cache for storing endpoints that have previously failed
let failedEndpoints = {};

// Re-export getToken for convenience
export { getToken };

/**
 * Records that an endpoint has failed, to avoid retrying it
 * 
 * @param {string} endpoint - The API endpoint that failed
 */
export const recordEndpointError = (endpoint) => {
  // Only store errors for singular endpoints that have alternatives
  // Since we standardized on plural endpoints, we don't need to record failures
  console.log(`Not recording endpoint error for ${endpoint} as we're using standardized endpoints now`);
};

/**
 * Checks if an endpoint has already failed
 * 
 * @param {string} endpoint - The API endpoint to check
 * @returns {boolean} - Whether the endpoint has failed
 */
export const hasEndpointFailed = (endpoint) => {
  // With standardized plural endpoints, we should never skip requests due to previous failures
  return false;
};

/**
 * Get authentication headers for a request
 * 
 * @returns {Object} - Headers object with Content-Type and Authorization
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

/**
 * Handles API errors in a consistent manner
 * 
 * @param {Error} error - The error object
 * @param {string} context - Description of where the error occurred
 * @returns {string} - Formatted error message
 */
export const handleApiError = (error, context) => {
  const errorMessage = error.response?.data?.message || error.message;
  console.error(`API Error in ${context || "API call"}:`, errorMessage);
  return errorMessage;
};

/**
 * Utility to get the appropriate backend URL based on environment
 * 
 * @returns {string} - The backend URL to use for API requests
 */
export const getBackendUrl = () => {
  // Use local backend for development, production backend otherwise
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