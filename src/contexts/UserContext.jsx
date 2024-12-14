import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isNotionAuthorized, setIsNotionAuthorized] = useState(false);
  const [notionError, setNotionError] = useState(null);

  /**
   * Resets the user context, clearing all user-related data.
   */
  const resetUserContext = () => {
    setUser(null);
    setFlashcardSessions([]);
    setFlashcardError(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
  };

  /**
   * Fetches the current user data from the backend.
   * This will also update subscription-related fields in the user object.
   */
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    console.log(`Token loaded on mount: ${token}`);
    if (!token) {
      setAuthLoading(false); // No token, stop loading
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // The response includes subscription-related fields:
      // accountType, stripeCustomerId, subscriptionId, subscriptionStatus, lastInvoice, paymentStatus
      // These will be stored in the user object.
      setUser(response.data.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error fetching current user:", error);
      resetUserContext();
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Fetches all flashcard sessions for the authenticated user.
   */
  const fetchFlashcardSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    setFlashcardError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFlashcardSessions(response.data.flashcards);
    } catch (error) {
      console.error("Error fetching flashcard sessions:", error);
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        resetUserContext();
      } else {
        setFlashcardError("Failed to load flashcard sessions.");
      }
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchNotionAuthorization = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/notion/is-authorized`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIsNotionAuthorized(response.data.authorized);
    } catch (error) {
      console.error("Error checking Notion authorization:", error);
      setNotionError("Failed to check Notion authorization.");
      setIsNotionAuthorized(false);
    }
  };

  const fetchNotionData = async () => {
    if (!isNotionAuthorized) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/notion/data`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Process or store Notion data here if required
      console.log("Notion Data:", response.data);
    } catch (error) {
      console.error("Error fetching Notion data:", error);
      setNotionError("Failed to fetch Notion data.");
    }
  };

  /**
   * Creates a new flashcard session.
   */
  const createFlashcardSession = async (
    sessionName,
    studyCards,
    transcriptText
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
        { sessionName, studyCards, transcript: transcriptText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newSession = response.data.flashcard;
      setFlashcardSessions((prev) => [...prev, newSession]);
      return newSession;
    } catch (error) {
      console.error("Error creating flashcard session:", error);
      setFlashcardError("Failed to create flashcard session.");
      return null;
    }
  };

  /**
   * Adds flashcards to an existing session.
   */
  const addFlashcardsToSession = async (sessionId, studyCards) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${sessionId}`,
        { studyCards },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Refresh flashcard sessions after adding
      await fetchFlashcardSessions();
    } catch (error) {
      console.error("Error adding flashcards to session:", error);
      setFlashcardError("Failed to add flashcards to session.");
    }
  };

  /**
   * Retrieves a single flashcard session by ID.
   */
  const getFlashcardSessionById = async (sessionId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error retrieving flashcard session:", error);
      setFlashcardError("Failed to retrieve flashcard session.");
      return null;
    }
  };

  /**
   * Deletes a flashcard session by ID.
   */
  const deleteFlashcardSession = async (sessionId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFlashcardSessions((prev) =>
        prev.filter((session) => session.id !== sessionId)
      );
    } catch (error) {
      console.error("Error deleting flashcard session:", error);
      setFlashcardError("Failed to delete flashcard session.");
    }
  };

  /**
   * Updates the name of an existing flashcard session.
   */
  const updateFlashcardSessionName = async (sessionId, newName) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_LOCAL_BACKEND_URL
        }/api/flashcards/${sessionId}/name`,
        { sessionName: newName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Update the local state
      setFlashcardSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, studySession: newName }
            : session
        )
      );
      return true;
    } catch (error) {
      console.error("Error updating flashcard session name:", error);
      setFlashcardError("Failed to update flashcard session name.");
      return false;
    }
  };

  /**
   * Fetch the current user on app load.
   */
  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch flashcard sessions whenever the user state changes (e.g., on login or subscription changes)
   */
  useEffect(() => {
    if (user) {
      fetchFlashcardSessions();
    } else {
      setFlashcardSessions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * Fetch Notion information whenever the user state changes (e.g., on login or subscription changes)
   */
  useEffect(() => {
    if (user) {
      fetchNotionAuthorization();
    } else {
      setIsNotionAuthorized(false);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        resetUserContext,
        isLoggedIn,
        setIsLoggedIn,
        flashcardSessions,
        loadingSessions,
        flashcardError,
        setFlashcardSessions,
        createFlashcardSession,
        addFlashcardsToSession,
        getFlashcardSessionById,
        deleteFlashcardSession,
        updateFlashcardSessionName,
        authLoading,
        fetchCurrentUser, // Expose fetchCurrentUser for manual refresh if needed
        isNotionAuthorized,
        notionError,
        fetchNotionAuthorization,
        fetchNotionData,
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
