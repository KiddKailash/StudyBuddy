import axios from "axios";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";

const BACKEND = getBackendUrl();

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
      
      // Return only unique sessions
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

export const createFlashcardsFromUpload = async (uploadId, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");

    // 1) Retrieve the transcript from /api/uploads/:id
    const uploadResp = await axios.get(`${BACKEND}/api/uploads/${uploadId}`, { headers });
    const { transcript } = uploadResp.data;

    // 2) Generate flashcards
    const genResp = await axios.post(
      `${BACKEND}/api/flashcards/generate-from-transcript`,
      { transcript },
      { headers }
    );
    
    // The response format is now { sessionName, flashcards } instead of [sessionName, flashcards]
    const { sessionName: autoSessionName, flashcards: generatedCards } = genResp.data;

    // 3) Create (save) a new flashcards session
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
    
    // The backend returns data in the 'flashcard' field, not 'data'
    return createResp.data.flashcard;
  } catch (err) {
    console.error("createFlashcardsFromUpload error:", err);
    throw err;
  }
};

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

export const generateFlashcardsFromTranscript = async (transcriptText) => {
  try {
    const headers = getAuthHeaders();
    
    const response = await axios.post(
      `${BACKEND}/api/flashcards/generate-from-transcript`,
      { transcript: transcriptText },
      { headers }
    );
    
    // Return in the format expected by the caller (sessionName and flashcards array)
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