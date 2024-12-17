import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

export const UserContext = createContext();

/**
 * UserProvider manages:
 *  - Authenticated user & DB-based flashcard sessions
 *  - Local ephemeral sessions (free-tier not logged in)
 */
export const UserProvider = ({ children }) => {
  // Auth/user
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // DB-based sessions
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);

  // Local ephemeral sessions
  const [localSessions, setLocalSessions] = useState([]);

  // On mount: Load ephemeral sessions from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("localSessions") || "[]");
      setLocalSessions(stored);
    } catch (err) {
      console.error("Error loading localSessions:", err);
    }
  }, []);

  // Persist ephemeral sessions to localStorage on each update
  useEffect(() => {
    localStorage.setItem("localSessions", JSON.stringify(localSessions));
  }, [localSessions]);

  // Create ephemeral session
  const createLocalSession = (sessionData) => {
    setLocalSessions((prev) => [...prev, sessionData]);
  };

  // Delete ephemeral session
  const deleteLocalSession = (sessionId) => {
    setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Reset context on logout
  const resetUserContext = () => {
    setUser(null);
    setIsLoggedIn(false);
    setAuthLoading(false);
    setFlashcardSessions([]);
    setFlashcardError(null);
    //  setLocalSessions([]);
    localStorage.removeItem("token");
  };

  // Fetch current user if token
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(resp.data.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("fetchCurrentUser error:", err);
      resetUserContext();
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // If user changes, load DB-based sessions if user is logged in
  useEffect(() => {
    if (user) {
      loadFlashcardSessions();
    } else {
      setFlashcardSessions([]);
    }
  }, [user]);

  // Load DB-based sessions
  const loadFlashcardSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    setFlashcardError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const resp = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFlashcardSessions(resp.data.flashcards || []);
    } catch (error) {
      console.error("loadFlashcardSessions error:", error);
      setFlashcardError("Failed to load DB sessions.");
    } finally {
      setLoadingSessions(false);
    }
  };

  // Delete DB-based session
  const deleteFlashcardSession = async (sessionId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated.");

      await axios.delete(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFlashcardSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("deleteFlashcardSession error:", err);
      setFlashcardError(err.message || "Failed to delete DB session.");
    }
  };

  // Rename DB-based session
  const updateFlashcardSessionName = async (sessionId, newName) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated.");

      await axios.put(
        `${
          import.meta.env.VITE_LOCAL_BACKEND_URL
        }/api/flashcards/${sessionId}/name`,
        { sessionName: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFlashcardSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, studySession: newName }
            : session
        )
      );
    } catch (err) {
      console.error("updateFlashcardSessionName error:", err);
      setFlashcardError(err.message || "Failed to rename DB session.");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        authLoading,
        resetUserContext,

        // DB-based
        flashcardSessions,
        setFlashcardSessions,
        loadingSessions,
        flashcardError,
        setFlashcardError,
        deleteFlashcardSession,
        updateFlashcardSessionName,

        // Local ephemeral
        localSessions,
        setLocalSessions,
        createLocalSession,
        deleteLocalSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserContext;
