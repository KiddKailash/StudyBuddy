import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import services from '../_SERVICE_EXPORTS';

/**
 * Maximum number of ephemeral flashcard sessions allowed
 * @constant {number}
 */
const MAX_EPHEMERAL_SESSIONS = 1;

/**
 * Custom hook for managing flashcard sessions
 * 
 * This hook provides comprehensive functionality for managing both persisted (database)
 * and ephemeral (local storage) flashcard sessions. It handles creation, deletion,
 * updating, and retrieval of flashcard sessions with proper error handling.
 * 
 * @returns {Object} Flashcard methods and state
 * @property {Array} flashcardSessions - Array of user's database-stored flashcard sessions
 * @property {Function} setFlashcardSessions - Function to update flashcard sessions state
 * @property {Array} localSessions - Array of user's locally stored flashcard sessions
 * @property {Function} setLocalSessions - Function to update local sessions state
 * @property {boolean} loadingSessions - Whether sessions are currently loading
 * @property {string|null} flashcardError - Current error message or null
 * @property {Function} loadFlashcardSessions - Function to load user's flashcard sessions from database
 * @property {Function} deleteFlashcardSession - Function to delete a flashcard session
 * @property {Function} updateFlashcardSessionName - Function to rename a flashcard session
 * @property {Function} createFlashcards - Function to create a new flashcard session
 * @property {Function} createFlashcardsFromUpload - Function to create flashcards from an upload
 * @property {Function} createLocalSession - Function to create a local ephemeral session
 * @property {Function} deleteLocalSession - Function to delete a local session
 * @property {Function} updateLocalSession - Function to update a local session
 * @property {Function} loadLocalSessions - Function to load sessions from local storage
 * @property {Function} generateAdditionalFlashcards - Function to generate more flashcards for a session
 * @property {Function} fetchFlashcardSession - Function to fetch a specific flashcard session
 * @property {Function} fetchFlashcardsByFolder - Function to fetch flashcards by folder
 * @property {Function} assignSessionToFolder - Function to assign a session to a folder
 * @property {Function} generateFlashcardsFromTranscript - Function to generate flashcards from transcript text
 */
export function useFlashcards() {
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [localSessions, setLocalSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);
  const navigate = useNavigate();

  /**
   * Loads all flashcard sessions for the logged-in user from the database
   * @returns {Promise<Array>} Array of flashcard sessions
   */
  const loadFlashcardSessions = async () => {
    setLoadingSessions(true);
    setFlashcardError(null);
    try {
      console.log('loadFlashcardSessions called, fetching sessions from API');
      const loadedDbSessions = await services.flashcards.fetchFlashcardSessions();
      console.log('Flashcard sessions loaded:', loadedDbSessions.length);
      setFlashcardSessions(loadedDbSessions);
      return loadedDbSessions;
    } catch (error) {
      console.error("loadFlashcardSessions error:", error);
      console.error("Error details:", error.response?.data || 'No response data');
      setFlashcardError("Failed to load DB sessions.");
      return [];
    } finally {
      setLoadingSessions(false);
    }
  };

  /**
   * Deletes a flashcard session from the database
   * Navigates away if the user is currently viewing the deleted session
   * @param {string} sessionId - ID of the session to delete
   */
  const deleteFlashcardSession = async (sessionId) => {
    if (location.pathname === `/flashcards/${sessionId}`) {
      navigate("/create-resource");
    }
    try {
      const success = await services.flashcards.deleteFlashcardSession(sessionId);
      if (success) {
        setFlashcardSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        setFlashcardError("Failed to delete DB session.");
      }
    } catch (err) {
      console.error("deleteFlashcardSession error:", err);
      setFlashcardError(err.message || "Failed to delete DB session.");
    }
  };

  /**
   * Updates the name of a flashcard session in the database
   * @param {string} sessionId - ID of the session to rename
   * @param {string} newName - New name for the session
   */
  const updateFlashcardSessionName = async (sessionId, newName) => {
    try {
      const success = await services.flashcards.updateFlashcardSessionName(sessionId, newName);
      if (success) {
        setFlashcardSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? { ...session, studySession: newName }
              : session
          )
        );
      } else {
        setFlashcardError("Failed to rename DB session.");
      }
    } catch (err) {
      console.error("updateFlashcardSessionName error:", err);
      setFlashcardError(err.message || "Failed to rename DB session.");
    }
  };

  /**
   * Creates a new flashcard session in the database
   * @param {string} uploadId - ID of the uploaded document to create flashcards from
   * @param {string|null} folderID - Optional folder ID to assign the flashcards to
   * @param {string} sessionName - Name for the new flashcard session
   * @param {Array} studyCards - Optional pre-created flashcards to include
   * @returns {Promise<Object>} Newly created flashcard session
   */
  const createFlashcards = async (uploadId, folderID, sessionName, studyCards = []) => {
    try {
      const newSession = await services.flashcards.createFlashcards(
        uploadId, folderID, sessionName, studyCards
      );
      return newSession;
    } catch (err) {
      console.error("createFlashcards error:", err);
      throw err;
    }
  };

  /**
   * Creates flashcards directly from an upload without additional input
   * @param {string} uploadId - ID of the uploaded document
   * @param {string|null} folderID - Optional folder ID to assign the flashcards to
   * @returns {Promise<Object>} Newly created flashcard session
   */
  const createFlashcardsFromUpload = async (uploadId, folderID) => {
    try {
      const newFlashcardSession = await services.flashcards.createFlashcardsFromUpload(uploadId, folderID);
      setFlashcardSessions((prev) => [...prev, newFlashcardSession]);
      return newFlashcardSession;
    } catch (err) {
      console.error("createFlashcardsFromUpload error:", err);
      throw err;
    }
  };

  /**
   * Creates a local ephemeral flashcard session stored in browser storage
   * @param {Object} sessionData - Data for the new session
   * @throws {Error} If maximum number of ephemeral sessions is reached
   */
  const createLocalSession = (sessionData) => {
    if (localSessions.length >= MAX_EPHEMERAL_SESSIONS) {
      throw new Error("Maximum number of study sessions reached.");
    }
    const newLocalSession = { ...sessionData, sessionType: "local" };
    const updatedSessions = [...localSessions, newLocalSession];
    services.storage.saveLocalSessions(updatedSessions);
    setLocalSessions(updatedSessions);
  };

  /**
   * Deletes a local ephemeral flashcard session
   * Navigates away if the user is currently viewing the deleted session
   * @param {string} sessionId - ID of the local session to delete
   */
  const deleteLocalSession = (sessionId) => {
    if (location.pathname === `/flashcards-local/${sessionId}`) {
      navigate("/create-resource");
    }
    const newSessions = localSessions.filter((s) => s.id !== sessionId);
    services.storage.saveLocalSessions(newSessions);
    setLocalSessions(newSessions);
  };

  /**
   * Updates the name of a local flashcard session
   * @param {string} sessionId - ID of the local session to update
   * @param {string} newName - New name for the session
   */
  const updateLocalSession = (sessionId, newName) => {
    const updatedSessions = localSessions.map((s) =>
      s.id === sessionId ? { ...s, studySession: newName } : s
    );
    services.storage.saveLocalSessions(updatedSessions);
    setLocalSessions(updatedSessions);
  };

  /**
   * Loads local flashcard sessions from browser storage
   */
  const loadLocalSessions = () => {
    try {
      const stored = services.storage.getLocalSessions();
      setLocalSessions(stored);
    } catch (err) {
      console.error("Error loading localSessions:", err);
    }
  };

  /**
   * Generates additional flashcards for an existing session
   * @param {string} sessionId - ID of the session to generate more flashcards for
   * @returns {Promise<Array>} Newly generated flashcards
   */
  const generateAdditionalFlashcards = (sessionId) => {
    return services.flashcards.generateAdditionalFlashcards(sessionId);
  };

  /**
   * Fetches a specific flashcard session by ID
   * @param {string} sessionId - ID of the session to fetch
   * @returns {Promise<Object>} The requested flashcard session
   */
  const fetchFlashcardSession = (sessionId) => {
    return services.flashcards.fetchFlashcardSession(sessionId);
  };

  /**
   * Fetches all flashcard sessions in a specific folder
   * @param {string} folderID - ID of the folder to fetch flashcards from
   * @returns {Promise<Array>} Flashcard sessions in the specified folder
   */
  const fetchFlashcardsByFolder = async (folderID) => {
    try {
      const sessions = await services.flashcards.fetchFlashcardsByFolder(folderID);
            
      // Update the flashcardSessions state with the returned data
      if (Array.isArray(sessions)) {
        const formattedSessions = sessions.map(session => ({
          ...session,
          sessionType: "db"
        }));
        
        setFlashcardSessions(formattedSessions);
      } else {
        console.warn(`Unexpected response from fetchFlashcardsByFolder: not an array:`, sessions);
      }
      
      return sessions;
    } catch (error) {
      console.error(`Error fetching flashcards for folder ${folderID}:`, error);
      return [];
    }
  };

  /**
   * Assigns a flashcard session to a folder
   * @param {string} sessionId - ID of the session to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise<void>}
   */
  const assignSessionToFolder = async (sessionId, folderID) => {
    try {
      // Call the API to update the folder
      await services.flashcards.assignSessionToFolder(sessionId, folderID);
      
      // Update the local state immediately to show change in UI
      setFlashcardSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, folderID } : session
        )
      );
      
      // Reload all flashcard sessions to ensure data consistency
      await loadFlashcardSessions();
    } catch (error) {
      console.error("assignSessionToFolder error:", error);
      throw error;
    }
  };

  /**
   * Generates flashcards from raw transcript text
   * @param {string} transcriptText - Raw text to generate flashcards from
   * @returns {Promise<Array>} Generated flashcards
   */
  const generateFlashcardsFromTranscript = (transcriptText) => {
    return services.flashcards.generateFlashcardsFromTranscript(transcriptText);
  };

  return {
    flashcardSessions,
    setFlashcardSessions,
    localSessions,
    setLocalSessions,
    loadingSessions,
    flashcardError,
    setFlashcardError,
    loadFlashcardSessions,
    deleteFlashcardSession,
    updateFlashcardSessionName,
    createFlashcards,
    createFlashcardsFromUpload,
    createLocalSession,
    deleteLocalSession,
    updateLocalSession,
    loadLocalSessions,
    generateAdditionalFlashcards,
    fetchFlashcardSession,
    fetchFlashcardsByFolder,
    assignSessionToFolder,
    generateFlashcardsFromTranscript,
    MAX_EPHEMERAL_SESSIONS
  };
} 