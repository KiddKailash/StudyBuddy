/**
 * Quiz Service Module
 * 
 * Provides functionality for managing multiple-choice quizzes, including:
 * - Fetching all quizzes and quizzes by folder
 * - Creating new quizzes based on uploads
 * - Renaming and deleting quizzes
 * - Organizing quizzes into folders
 */

import axios from "axios";
import { getAuthHeaders, getBackendUrl, hasEndpointFailed, recordEndpointError } from "./apiUtils";

const BACKEND = getBackendUrl();

/**
 * Fetch all quizzes for the current user
 * 
 * @returns {Array} - List of quiz objects
 */
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
      
      // Check for duplicate IDs and filter them out
      const ids = quizzesData.map(q => q.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('Duplicate quiz IDs detected');
        
        // Return only unique quizzes by keeping first occurrence of each ID
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

/**
 * Fetch quizzes belonging to a specific folder
 * 
 * @param {string} folderID - ID of the folder to fetch quizzes from
 * @returns {Array} - List of quiz objects in the folder
 */
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

/**
 * Create a new quiz from an uploaded document
 * 
 * @param {string} uploadId - ID of the uploaded document to create quiz from
 * @param {string} folderID - ID of the folder to place the quiz in (optional)
 * @returns {Object} - The created quiz object
 */
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

/**
 * Rename a quiz
 * 
 * @param {string} quizId - ID of the quiz to rename
 * @param {string} newName - New name for the quiz
 * @returns {boolean} - True if rename was successful
 */
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

/**
 * Delete a quiz
 * 
 * @param {string} quizID - ID of the quiz to delete
 * @returns {boolean} - True if deletion was successful
 */
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

/**
 * Assign a quiz to a folder
 * 
 * @param {string} quizId - ID of the quiz to move
 * @param {string} folderID - ID of the destination folder
 * @returns {Object} - Updated quiz data
 */
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