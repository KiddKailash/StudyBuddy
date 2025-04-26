import axios from "axios";
import { getAuthHeaders, getBackendUrl, hasEndpointFailed, recordEndpointError } from "./apiUtils";

const BACKEND = getBackendUrl();

export const fetchAllSummaries = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return [];
    
    // Skip if we already know these endpoints fail
    if (hasEndpointFailed('summaries') && hasEndpointFailed('summary')) {
      console.log('Skipping summaries fetch - endpoints previously failed');
      return [];
    }
    
    // Try the plural endpoint first, fall back to singular if needed
    try {
      const resp = await axios.get(`${BACKEND}/api/summaries`, { headers });
      // { data: [ {id, ...}, ... ] }
      return resp.data.data || [];
    } catch (summaryError) {
      recordEndpointError('summaries');
      
      // If not already tried, try alternative endpoint
      if (!hasEndpointFailed('summary')) {
        try {
          const altResp = await axios.get(`${BACKEND}/api/summary`, { headers });
          return altResp.data.data || [];
        } catch (altError) {
          recordEndpointError('summary');
          throw altError;
        }
      } else {
        throw summaryError;
      }
    }
  } catch (error) {
    console.error("fetchAllSummaries error:", error);
    return []; // Return empty array on error
  }
};

export const fetchSummariesByFolder = async (folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");

    const res = await axios.get(
      `${BACKEND}/api/summaries/folder/${folderID}`,
      { headers }
    );
    return res.data.data; // The array of summaries
  } catch (error) {
    console.error("fetchSummariesByFolder error:", error);
    throw error;
  }
};

export const createSummary = async (uploadId, userMessage, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const resp = await axios.post(
      `${BACKEND}/api/summaries`,
      { uploadId, userMessage, folderID },
      { headers }
    );
    // The server returns { summary: { id, ... } }
    return resp.data.summary;
  } catch (error) {
    console.error("createSummary error:", error);
    throw error;
  }
};

export const deleteSummary = async (summaryId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.delete(`${BACKEND}/api/summaries/${summaryId}`, { headers });
    return true;
  } catch (error) {
    console.error("deleteSummary error:", error);
    return false;
  }
};

export const renameSummary = async (summaryId, newName) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.put(
      `${BACKEND}/api/summaries/${summaryId}/rename`,
      { newName },
      { headers }
    );
    
    return true;
  } catch (error) {
    console.error("renameSummary error:", error);
    return false;
  }
};

export const assignSummaryToFolder = async (summaryId, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    // Make API call to the backend endpoint
    const response = await axios.put(
      `${BACKEND}/api/summaries/${summaryId}/assign-folder`,
      { folderID },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error("assignSummaryToFolder error:", error);
    throw error;
  }
};

export default {
  fetchAllSummaries,
  fetchSummariesByFolder,
  createSummary,
  deleteSummary,
  renameSummary,
  assignSummaryToFolder
}; 