import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import services from '../index';

const MAX_EPHEMERAL_SESSIONS = 1;

/**
 * Custom hook for managing flashcard sessions
 */
export function useFlashcards() {
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [localSessions, setLocalSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);
  const navigate = useNavigate();

  // Load flashcard sessions for a logged-in user
  const loadFlashcardSessions = async () => {
    setLoadingSessions(true);
    setFlashcardError(null);
    try {
      const loadedDbSessions = await services.flashcards.fetchFlashcardSessions();
      setFlashcardSessions(loadedDbSessions);
    } catch (error) {
      console.error("loadFlashcardSessions error:", error);
      setFlashcardError("Failed to load DB sessions.");
    } finally {
      setLoadingSessions(false);
    }
  };

  // Delete a flashcard session
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

  // Update a flashcard session name
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

  // Create flashcards
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

  // Create flashcards from an upload
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

  // Functions for local ephemeral flashcard sessions
  const createLocalSession = (sessionData) => {
    if (localSessions.length >= MAX_EPHEMERAL_SESSIONS) {
      throw new Error("Maximum number of study sessions reached.");
    }
    const newLocalSession = { ...sessionData, sessionType: "local" };
    const updatedSessions = [...localSessions, newLocalSession];
    services.storage.saveLocalSessions(updatedSessions);
    setLocalSessions(updatedSessions);
  };

  const deleteLocalSession = (sessionId) => {
    if (location.pathname === `/flashcards-local/${sessionId}`) {
      navigate("/create-resource");
    }
    const newSessions = localSessions.filter((s) => s.id !== sessionId);
    services.storage.saveLocalSessions(newSessions);
    setLocalSessions(newSessions);
  };

  const updateLocalSession = (sessionId, newName) => {
    const updatedSessions = localSessions.map((s) =>
      s.id === sessionId ? { ...s, studySession: newName } : s
    );
    services.storage.saveLocalSessions(updatedSessions);
    setLocalSessions(updatedSessions);
  };

  // Load local sessions
  const loadLocalSessions = () => {
    try {
      const stored = services.storage.getLocalSessions();
      setLocalSessions(stored);
    } catch (err) {
      console.error("Error loading localSessions:", err);
    }
  };

  // Generate additional flashcards
  const generateAdditionalFlashcards = (sessionId) => {
    return services.flashcards.generateAdditionalFlashcards(sessionId);
  };

  // Fetch a specific flashcard session
  const fetchFlashcardSession = (sessionId) => {
    return services.flashcards.fetchFlashcardSession(sessionId);
  };

  // Fetch flashcards by folder
  const fetchFlashcardsByFolder = (folderID) => {
    return services.flashcards.fetchFlashcardsByFolder(folderID);
  };

  // Assign session to folder
  const assignSessionToFolder = async (sessionId, folderID) => {
    try {
      await services.flashcards.assignSessionToFolder(sessionId, folderID);
      setFlashcardSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, folderID } : session
        )
      );
    } catch (error) {
      console.error("assignSessionToFolder error:", error);
      throw error;
    }
  };

  // Generate flashcards from transcript
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