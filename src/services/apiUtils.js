import { getToken } from "./localStorageService";

const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

// Track failed endpoints to avoid repeated calls
let endpointErrors = {};

export const recordEndpointError = (endpoint) => {
  endpointErrors[endpoint] = true;
};

export const hasEndpointFailed = (endpoint) => {
  return endpointErrors[endpoint] === true;
};

export const resetEndpointErrors = () => {
  endpointErrors = {};
};

export const getAuthHeaders = () => {
  const localToken = getToken();
  return localToken ? { Authorization: `Bearer ${localToken}` } : {};
};

export const getBackendUrl = () => BACKEND;

export const handleApiError = (error, context) => {
  console.error(`${context} error:`, error);
  return null;
};

export default {
  BACKEND,
  getAuthHeaders,
  recordEndpointError,
  hasEndpointFailed,
  resetEndpointErrors,
  handleApiError,
}; 