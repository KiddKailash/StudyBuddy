import axios from "axios";
import { getAuthHeaders, getBackendUrl, hasEndpointFailed, recordEndpointError } from "./apiUtils";

const BACKEND = getBackendUrl();

export const fetchAllQuizzes = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      console.log('quizService: No auth token available');
      return [];
    }
    
    console.log('quizService: Fetching all quizzes from API');
    
    // Always use the plural endpoint
    try {
      const resp = await axios.get(`${BACKEND}/api/multiple-choice-quizzes`, { headers });
      console.log('quizService: Quiz response received', resp.status);
      
      const quizzesData = resp.data.quizzes || resp.data.data || [];
      console.log('quizService: Raw quizzes data', {
        hasQuizzesField: !!resp.data.quizzes,
        hasDataField: !!resp.data.data,
        resultLength: quizzesData.length,
        responseKeys: Object.keys(resp.data)
      });
      
      // Check for duplicate IDs
      const ids = quizzesData.map(q => q.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('Duplicate quiz IDs detected');
        
        // Return only unique quizzes
        const uniqueQuizzes = [];
        const seenIds = new Set();
        for (const quiz of quizzesData) {
          if (!seenIds.has(quiz.id)) {
            uniqueQuizzes.push(quiz);
            seenIds.add(quiz.id);
          }
        }
        console.log(`Removed ${quizzesData.length - uniqueQuizzes.length} duplicate quizzes`);
        return uniqueQuizzes;
      }
      
      return quizzesData;
    } catch (error) {
      console.error("quizService: fetchAllQuizzes request error:", error);
      console.error("quizService: Error status:", error.response?.status);
      console.error("quizService: Error details:", error.response?.data || 'No response data');
      return []; // Return empty array on error
    }
  } catch (error) {
    console.error("quizService: fetchAllQuizzes general error:", error);
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