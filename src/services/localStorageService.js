/**
 * Local Storage Service Module
 * 
 * Provides utilities for working with browser's localStorage, including:
 * - Getting and setting JSON-serialized data
 * - Managing authentication tokens
 * - Handling local flashcard sessions
 * - Error handling for storage operations
 * 
 * All methods safely handle potential errors in serialization/deserialization
 * and storage capacity issues.
 */

/**
 * Retrieve an item from localStorage with JSON parsing
 * 
 * @param {string} key - Storage key to retrieve
 * @param {any} defaultValue - Value to return if item doesn't exist or on error
 * @returns {any} - Parsed item or defaultValue
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error getting item from localStorage (${key}):`, err);
    return defaultValue;
  }
};

/**
 * Store an item in localStorage with JSON stringification
 * 
 * @param {string} key - Storage key to set
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {boolean} - True if operation succeeded
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error setting item in localStorage (${key}):`, err);
    return false;
  }
};

/**
 * Remove an item from localStorage
 * 
 * @param {string} key - Storage key to remove
 * @returns {boolean} - True if operation succeeded
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Error removing item from localStorage (${key}):`, err);
    return false;
  }
};

/**
 * Clear all items from localStorage
 * 
 * @returns {boolean} - True if operation succeeded
 */
export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (err) {
    console.error("Error clearing localStorage:", err);
    return false;
  }
};

/**
 * Get the authentication token from localStorage
 * 
 * @returns {string|null} - The token or null if not found
 */
export const getToken = () => localStorage.getItem("token");

/**
 * Set or remove the authentication token in localStorage
 * 
 * @param {string|null} token - Token to store, null to remove
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

/**
 * Get locally saved flashcard sessions
 * 
 * @returns {Array} - Array of local flashcard session objects
 */
export const getLocalSessions = () => {
  return getItem("localSessions", []);
};

/**
 * Save flashcard sessions to localStorage
 * 
 * @param {Array} sessions - Array of flashcard session objects to save
 * @returns {boolean} - True if operation succeeded
 */
export const saveLocalSessions = (sessions) => {
  return setItem("localSessions", sessions);
};

export default {
  getItem,
  setItem,
  removeItem,
  clear,
  getToken,
  setToken,
  getLocalSessions,
  saveLocalSessions
}; 