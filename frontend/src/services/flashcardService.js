/**
 * Flashcard Service Module
 * 
 * Provides functionality for managing flashcard study sessions, including:
 * - Fetching, creating, and updating flashcard sessions
 * - Organizing flashcards into folders
 * - Generating flashcards from transcripts or uploads
 * - Managing flashcard study data
 */

import axios from "axios";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";

const BACKEND = getBackendUrl();

/**
 * Fetch all flashcard sessions for the current user
 * 
 * @returns {Array} - List of flashcard session objects
 */
export const fetchFlashcardSessions = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return [];
    
    const resp = await axios.get(`${BACKEND}/api/flashcards`, { headers });
    // The response returns { data: [ {id, ...}, ... ] }
    const loaded = resp.data.flashcards || resp.data.data || [];
    
    // Check for duplicate IDs before returning
    const ids = loaded.map(s => s.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.warn('Duplicate flashcard session IDs detected');
      
      // Filter out duplicate sessions by keeping only the first occurrence of each ID
      const uniqueSessions = [];
      const seenIds = new Set();
      for (const session of loaded) {
        if (!seenIds.has(session.id)) {
          uniqueSessions.push({
            ...session,
            sessionType: "db",
          });
          seenIds.add(session.id);
        }
      }
      console.log(`Removed ${loaded.length - uniqueSessions.length} duplicate flashcard sessions`);
      return uniqueSessions;
    }
    
    // Mark sessions as database-stored (as opposed to locally generated)
    const loadedDbSessions = loaded.map((s) => ({
      ...s,
      sessionType: "db",
    }));
    return loadedDbSessions;
  } catch (error) {
    console.error("fetchFlashcardSessions error:", error);
    return [];
  }
};

/**
 * Fetch a specific flashcard session by ID
 * 
 * @param {string} sessionId - ID of the flashcard session to fetch
 * @returns {Object|null} - Flashcard session object or null if not found
 */
export const fetchFlashcardSession = async (sessionId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const response = await axios.get(
      `${BACKEND}/api/flashcards/${sessionId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("fetchFlashcardSession error:", error);
    return null;
  }
};

/**
 * Fetch flashcard sessions belonging to a specific folder
 * 
 * @param {string} folderID - ID of the folder to fetch flashcards from
 * @returns {Array} - List of flashcard session objects in the folder
 */
export const fetchFlashcardsByFolder = async (folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");

    const res = await axios.get(
      `${BACKEND}/api/flashcards/folder/${folderID}`,
      { headers }
    );

    return res.data.data; // The array of flashcard sessions
  } catch (error) {
    console.error("fetchFlashcardsByFolder error:", error);
    throw error;
  }
};

/**
 * Create a new flashcard session with specified cards
 * 
 * @param {string} uploadId - ID of the document the flashcards are based on
 * @param {string} folderID - ID of the folder to place the session in
 * @param {string} sessionName - Name for the flashcard session
 * @param {Array} studyCards - Array of flashcard objects to include in the session
 * @returns {Object} - The created flashcard session
 */
export const createFlashcards = async (uploadId, folderID, sessionName, studyCards = []) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User not authenticated.");

    const resp = await axios.post(
      `${BACKEND}/api/flashcards`,
      {
        uploadId,
        folderID,
        sessionName,
        studyCards,
      },
      { headers }
    );

    return resp.data.flashcard;
  } catch (err) {
    console.error("createFlashcards error:", err);
    throw err;
  }
};

/**
 * Create flashcards automatically from an uploaded document
 * 
 * @param {string} uploadId - ID of the uploaded document
 * @param {string} folderID - ID of the folder to place the session in
 * @returns {Object} - The created flashcard session
 */
export const createFlashcardsFromUpload = async (uploadId, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");

    // 1) Retrieve the transcript from the upload
    const uploadResp = await axios.get(`${BACKEND}/api/uploads/${uploadId}`, { headers });
    const { transcript } = uploadResp.data;

    // 2) Generate flashcards from the transcript text
    const genResp = await axios.post(
      `${BACKEND}/api/flashcards/generate-from-transcript`,
      { transcript },
      { headers }
    );
    
    // Extract session name and generated cards from response
    const { sessionName: autoSessionName, flashcards: generatedCards } = genResp.data;

    // 3) Create and save a new flashcards session
    const createResp = await axios.post(
      `${BACKEND}/api/flashcards`,
      {
        uploadId,
        folderID,
        sessionName: autoSessionName || "Auto Flashcards",
        studyCards: generatedCards || [], // Ensure studyCards is always an array
      },
      { headers }
    );
    
    // Return the newly created flashcard session
    return createResp.data.flashcard;
  } catch (err) {
    console.error("createFlashcardsFromUpload error:", err);
    throw err;
  }
};

/**
 * Generate additional flashcards for an existing session
 * 
 * @param {string} sessionId - ID of the session to add cards to
 * @returns {boolean} - True if generation was successful
 */
export const generateAdditionalFlashcards = async (sessionId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.post(
      `${BACKEND}/api/flashcards/${sessionId}/generate-additional-flashcards`,
      {},
      { headers }
    );
    
    return true;
  } catch (error) {
    console.error("generateAdditionalFlashcards error:", error);
    return false;
  }
};

/**
 * Delete a flashcard session
 * 
 * @param {string} sessionId - ID of the session to delete
 * @returns {boolean} - True if deletion was successful
 */
export const deleteFlashcardSession = async (sessionId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("Not authenticated.");
    
    await axios.delete(`${BACKEND}/api/flashcards/${sessionId}`, { headers });
    return true;
  } catch (err) {
    console.error("deleteFlashcardSession error:", err);
    return false;
  }
};

/**
 * Update the name of a flashcard session
 * 
 * @param {string} sessionId - ID of the session to rename
 * @param {string} newName - New name for the session
 * @returns {boolean} - True if update was successful
 */
export const updateFlashcardSessionName = async (sessionId, newName) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("Not authenticated.");
    
    await axios.put(
      `${BACKEND}/api/flashcards/${sessionId}/name`,
      { sessionName: newName },
      { headers }
    );
    
    return true;
  } catch (err) {
    console.error("updateFlashcardSessionName error:", err);
    return false;
  }
};

/**
 * Assign a flashcard session to a folder
 * 
 * @param {string} sessionId - ID of the session to move
 * @param {string} folderID - ID of the destination folder
 * @returns {Object} - Updated session data
 */
export const assignSessionToFolder = async (sessionId, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const response = await axios.put(
      `${BACKEND}/api/flashcards/${sessionId}/assign-folder`,
      { folderID },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error("assignSessionToFolder error:", error);
    throw error;
  }
};

/**
 * Generate flashcards from a transcript text
 * 
 * @param {string} transcriptText - Text content to generate flashcards from
 * @returns {Array} - Array containing session name and flashcards array
 */
export const generateFlashcardsFromTranscript = async (transcriptText) => {
  try {
    const headers = getAuthHeaders();
    
    const response = await axios.post(
      `${BACKEND}/api/flashcards/generate-from-transcript`,
      { transcript: transcriptText },
      { headers }
    );
    
    // Return in the format expected by the caller
    const { sessionName, flashcards } = response.data;
    return [sessionName, flashcards || []]; // Ensure flashcards is always an array
  } catch (error) {
    console.error("Error generating flashcards from transcript:", error);
    throw error;
  }
};

export default {
  fetchFlashcardSessions,
  fetchFlashcardSession,
  fetchFlashcardsByFolder,
  createFlashcards,
  createFlashcardsFromUpload,
  generateAdditionalFlashcards,
  deleteFlashcardSession,
  updateFlashcardSessionName,
  assignSessionToFolder,
  generateFlashcardsFromTranscript
}; 