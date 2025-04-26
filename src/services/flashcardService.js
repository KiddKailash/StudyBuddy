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

    return resp.data.data;
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
      `${BACKEND}/api/flashcards/generate-flashcards`,
      { transcript },
      { headers }
    );
    // The response is [sessionName, [ {question, answer}... ] ]
    const [autoSessionName, generatedCards] = genResp.data.flashcards;

    // 3) Create (save) a new flashcards session
    const createResp = await axios.post(
      `${BACKEND}/api/flashcards`,
      {
        uploadId,
        folderID,
        sessionName: autoSessionName || "Auto Flashcards",
        studyCards: generatedCards,
      },
      { headers }
    );
    
    return createResp.data.data;
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
    
    return [response.data.sessionName, response.data.flashcards];
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