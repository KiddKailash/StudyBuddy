import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; // Import PropTypes

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  /**
   * Resets the user context, clearing all user-related data.
   */
  const resetUserContext = () => {
    setUser(null);
    setFlashcardSessions([]);
    setFlashcardError(null);
    setIsLoggedIn(false);
    localStorage.clear();
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
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setFlashcardSessions(response.data.flashcards);
    } catch (error) {
      console.error('Error fetching flashcard sessions:', error);
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        resetUserContext();
        // Optionally, notify the user about session expiry
      } else {
        setFlashcardError('Failed to load flashcard sessions.');
      }
    } finally {
      setLoadingSessions(false);
    }
  };

  /**
   * Creates a new flashcard session.
   * @param {string} sessionName - Name of the session.
   * @param {Array} studyCards - Array of study cards.
   * @returns {Object|null} - The created flashcard session or null if failed.
   */
  const createFlashcardSession = async (sessionName, studyCards) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
        { sessionName, studyCards },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const newSession = response.data.flashcard;
      setFlashcardSessions((prev) => [...prev, newSession]);
      return newSession; // Return the new session
    } catch (error) {
      console.error('Error creating flashcard session:', error);
      setFlashcardError('Failed to create flashcard session.');
      return null; // Return null on failure
    }
  };

  /**
   * Adds flashcards to an existing session.
   * @param {string} sessionId - ID of the flashcard session.
   * @param {Array} studyCards - Array of study cards to add.
   */
  const addFlashcardsToSession = async (sessionId, studyCards) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${sessionId}`,
        { studyCards },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Refresh flashcard sessions after adding
      await fetchFlashcardSessions();
    } catch (error) {
      console.error('Error adding flashcards to session:', error);
      setFlashcardError('Failed to add flashcards to session.');
    }
  };

  /**
   * Retrieves a single flashcard session by ID.
   * @param {string} sessionId - ID of the flashcard session.
   * @returns {Object|null} - Flashcard session data or null if not found.
   */
  const getFlashcardSessionById = async (sessionId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error retrieving flashcard session:', error);
      setFlashcardError('Failed to retrieve flashcard session.');
      return null;
    }
  };

  /**
   * Deletes a flashcard session by ID.
   * @param {string} sessionId - ID of the flashcard session.
   */
  const deleteFlashcardSession = async (sessionId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setFlashcardSessions((prev) => prev.filter((session) => session.id !== sessionId));
    } catch (error) {
      console.error('Error deleting flashcard session:', error);
      setFlashcardError('Failed to delete flashcard session.');
    }
  };

  // Fetch flashcard sessions whenever the user state changes (i.e., on login)
  useEffect(() => {
    if (user) {
      fetchFlashcardSessions();
    } else {
      setFlashcardSessions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        createFlashcardSession,
        addFlashcardsToSession,
        getFlashcardSessionById,
        deleteFlashcardSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// PropTypes Validation
UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserContext;
