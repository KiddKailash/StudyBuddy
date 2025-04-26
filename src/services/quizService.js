import axios from "axios";
import { getAuthHeaders, getBackendUrl, hasEndpointFailed, recordEndpointError } from "./apiUtils";

const BACKEND = getBackendUrl();

export const fetchAllQuizzes = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return [];
    
    // Skip if we already know these endpoints fail
    if (hasEndpointFailed('multiple-choice-quizzes') && hasEndpointFailed('multiple-choice-quiz')) {
      console.log('Skipping quizzes fetch - endpoints previously failed');
      return [];
    }
    
    // Try the plural endpoint first, fall back to singular if needed
    try {
      const resp = await axios.get(`${BACKEND}/api/multiple-choice-quizzes`, { headers });
      // { data: [ {id, ...}, ... ] }
      return resp.data.data || [];
    } catch (quizError) {
      recordEndpointError('multiple-choice-quizzes');
      
      // If not already tried, try alternative endpoint
      if (!hasEndpointFailed('multiple-choice-quiz')) {
        try {
          const altResp = await axios.get(`${BACKEND}/api/multiple-choice-quiz`, { headers });
          return altResp.data.data || [];
        } catch (altError) {
          recordEndpointError('multiple-choice-quiz');
          throw altError;
        }
      } else {
        throw quizError;
      }
    }
  } catch (error) {
    console.error("fetchAllQuizzes error:", error);
    return []; // Return empty array on error
  }
};

export const fetchQuizzesByFolder = async (folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");

    const res = await axios.get(
      `${BACKEND}/api/multiple-choice-quizzes/folder/${folderID}`,
      { headers }
    );
    return res.data.data; // The array of quizzes
  } catch (error) {
    console.error("fetchQuizzesByFolder error:", error);
    throw error;
  }
};

export const createQuiz = async (uploadId, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const resp = await axios.post(
      `${BACKEND}/api/multiple-choice-quizzes`,
      { uploadId, folderID },
      { headers }
    );
    // The server returns { data: { id, ... } }
    return resp.data.data;
  } catch (error) {
    console.error("createQuiz error:", error);
    throw error;
  }
};

export const renameQuiz = async (quizId, newName) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.put(
      `${BACKEND}/api/multiple-choice-quizzes/${quizId}/rename`,
      { newName },
      { headers }
    );
    
    return true;
  } catch (error) {
    console.error("renameQuiz error:", error);
    return false;
  }
};

export const deleteQuiz = async (quizID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.delete(`${BACKEND}/api/multiple-choice-quizzes/${quizID}`, { headers });
    return true;
  } catch (error) {
    console.error("deleteQuiz error:", error);
    return false;
  }
};

export const assignQuizToFolder = async (quizId, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    // Make API call to the backend endpoint
    const response = await axios.put(
      `${BACKEND}/api/multiple-choice-quizzes/${quizId}/assign-folder`,
      { folderID },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error("assignQuizToFolder error:", error);
    throw error;
  }
};

export default {
  fetchAllQuizzes,
  fetchQuizzesByFolder,
  createQuiz,
  renameQuiz,
  deleteQuiz,
  assignQuizToFolder
}; 