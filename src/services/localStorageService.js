/**
 * Local storage service provides utilities for working with browser's localStorage
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

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error setting item in localStorage (${key}):`, err);
    return false;
  }
};

export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Error removing item from localStorage (${key}):`, err);
    return false;
  }
};

export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (err) {
    console.error("Error clearing localStorage:", err);
    return false;
  }
};

// Function to get/set token specifically
export const getToken = () => localStorage.getItem("token");

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

// For ephemeral flashcard sessions
export const getLocalSessions = () => {
  return getItem("localSessions", []);
};

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