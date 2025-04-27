/**
 * Summary Service Module
 * 
 * Provides functionality for managing AI-generated summaries, including:
 * - Fetching all summaries and summaries by folder
 * - Creating new summaries from uploads
 * - Renaming and deleting summaries
 * - Organizing summaries into folders
 * 
 * Summaries are AI-generated condensed versions of uploaded content.
 */

import axios from "axios";
import { getAuthHeaders, getBackendUrl, hasEndpointFailed, recordEndpointError } from "./apiUtils";

const BACKEND = getBackendUrl();

/**
 * Fetch all summaries for the current user
 * 
 * @returns {Array} - List of summary objects
 */
export const fetchAllSummaries = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      console.log("summaryService: No auth token available");
      return [];
    }
    
    console.log("summaryService: Fetching all summaries from API");
    
    // Use the plural endpoint for consistency
    try {
      const resp = await axios.get(`${BACKEND}/api/summaries`, { headers });
      console.log("summaryService: Summaries response received", resp.status);
      
      const summariesData = resp.data.summaries || resp.data.data || [];
      console.log("summaryService: Raw summaries data", {
        hasSummariesField: !!resp.data.summaries,
        hasDataField: !!resp.data.data,
        resultLength: summariesData.length,
        responseKeys: Object.keys(resp.data)
      });
      
      // Check for duplicate IDs and filter them out
      const ids = summariesData.map(s => s.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('summaryService: Duplicate summary IDs detected');
        
        // Return only unique summaries by keeping first occurrence of each ID
        const uniqueSummaries = [];
        const seenIds = new Set();
        for (const summary of summariesData) {
          if (!seenIds.has(summary.id)) {
            uniqueSummaries.push(summary);
            seenIds.add(summary.id);
          }
        }
        console.log(`summaryService: Removed ${summariesData.length - uniqueSummaries.length} duplicate summaries`);
        return uniqueSummaries;
      }
      
      return summariesData;
    } catch (error) {
      console.error("summaryService: fetchAllSummaries request error:", error);
      console.error("summaryService: Error status:", error.response?.status);
      console.error("summaryService: Error details:", error.response?.data || 'No response data');
      return []; // Return empty array on error
    }
  } catch (error) {
    console.error("summaryService: fetchAllSummaries general error:", error);
    return []; // Return empty array on error
  }
};

/**
 * Fetch summaries belonging to a specific folder
 * 
 * @param {string} folderID - ID of the folder to fetch summaries from
 * @returns {Array} - List of summary objects in the folder
 */
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

/**
 * Create a new summary from an uploaded document
 * 
 * @param {string} uploadId - ID of the uploaded document to summarize
 * @param {string} userMessage - Optional guidance for the summary generation
 * @param {string} folderID - ID of the folder to place the summary in (optional)
 * @returns {Object} - The created summary object
 */
export const createSummary = async (uploadId, userMessage, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    console.log("Creating summary with parameters:", { uploadId, userMessage, folderID });
    
    // First, verify we can get the upload transcript
    try {
      const uploadResp = await axios.get(`${BACKEND}/api/uploads/${uploadId}`, { headers });
      console.log("Upload data successfully retrieved:", uploadResp.data.id);
    } catch (uploadError) {
      console.error("Error fetching upload data:", uploadError);
      throw new Error("Failed to fetch upload data: " + (uploadError.response?.data?.error || uploadError.message));
    }
    
    // Now create the summary
    console.log("Posting to summaries endpoint...");
    const resp = await axios.post(
      `${BACKEND}/api/summaries`,
      { uploadId, userMessage, folderID },
      { headers }
    );
    
    console.log("Summary creation response:", resp.data);
    
    // Validate response format and ensure it has the expected structure
    if (!resp.data.summary) {
      console.error("Unexpected response format:", resp.data);
      throw new Error("Unexpected response format from server");
    }
    
    return resp.data.summary;
  } catch (error) {
    console.error("createSummary error:", error);
    throw error;
  }
};

/**
 * Delete a summary
 * 
 * @param {string} summaryId - ID of the summary to delete
 * @returns {boolean} - True if deletion was successful
 */
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

/**
 * Rename a summary
 * 
 * @param {string} summaryId - ID of the summary to rename
 * @param {string} newName - New name for the summary
 * @returns {boolean} - True if rename was successful
 */
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

/**
 * Assign a summary to a folder
 * 
 * @param {string} summaryId - ID of the summary to move
 * @param {string} folderID - ID of the destination folder
 * @returns {Object} - Updated summary data
 */
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