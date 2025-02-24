import React, { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";

// eslint-disable-next-line
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Constants
  const MAX_EPHEMERAL_SESSIONS = 1;
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // track token in state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Flashcard sessions (DB-based)
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);

  // Local ephemeral sessions
  const [localSessions, setLocalSessions] = useState([]);

  // Hooks from React Router
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * A centralized logout function that:
   *  - Clears user context
   *  - Removes token from storage
   *  - Navigates to login page (with "mode=login")
   */
  const logout = () => {
    resetUserContext();
    navigate("/login?mode=login", { replace: true });
  };

  /**
   * Reset context on logout or token failure
   */
  const resetUserContext = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setAuthLoading(false);
    setFlashcardSessions([]);
    setFlashcardError(null);
    localStorage.removeItem("token");
  };

  /**
   * Loads token from localStorage (if any),
   * then tries to fetch current user details from the backend.
   */
  const fetchCurrentUser = async () => {
    const localToken = localStorage.getItem("token");
    if (!localToken) {
      setAuthLoading(false);
      return;
    }

    // Store token in state
    setToken(localToken);

    try {
      // Attempt to retrieve user with the token
      const resp = await axios.get(`${BACKEND}/api/auth/me`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });

      // If successful, store user data & set loggedIn state
      setUser(resp.data.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("fetchCurrentUser error:", err);
      resetUserContext(); // Invalidate local token if fetch fails
    } finally {
      setAuthLoading(false);
    }
  };

  // On mount: Load ephemeral sessions and attempt to fetch current user
  useEffect(() => {
    // Restore ephemeral sessions from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("localSessions") || "[]");
      setLocalSessions(stored);
    } catch (err) {
      console.error("Error loading localSessions:", err);
    }

    // Attempt user fetch
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist ephemeral sessions to localStorage on each update
  useEffect(() => {
    localStorage.setItem("localSessions", JSON.stringify(localSessions));
  }, [localSessions]);

  /**
   * Automatically log out when the token expires.
   * We do this by setting a timer for (exp - now).
   */
  useEffect(() => {
    // We'll store the timeout ID so we can clear it if the token changes again
    let tokenExpiryTimeout;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log(decoded);
        const expiryTimestamp = decoded.exp * 1000; // exp is in seconds, convert to ms
        const timeLeft = expiryTimestamp - Date.now();

        // If already expired, log out immediately
        if (timeLeft <= 0) {
          logout();
        } else {
          // Otherwise, set a timeout to log out the user right when it expires
          tokenExpiryTimeout = setTimeout(() => {
            logout();
          }, timeLeft);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // If there's any issue decoding, treat it as invalid
        logout();
      }
    }

    // Cleanup: if token changes or component unmounts, clear the old timeout
    return () => {
      if (tokenExpiryTimeout) {
        clearTimeout(tokenExpiryTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // depends on 'token'

  // If user changes, load DB-based flashcard sessions (if logged in)
  useEffect(() => {
    if (user) {
      loadFlashcardSessions();
    } else {
      setFlashcardSessions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /**
   * Load DB-based flashcard sessions
   */
  const loadFlashcardSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    setFlashcardError(null);

    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) return;

      const resp = await axios.get(`${BACKEND}/api/flashcards`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      // Tag each DB session with a "db" type
      const loadedDbSessions = (resp.data.flashcards || []).map((s) => ({
        ...s,
        sessionType: "db",
      }));
      setFlashcardSessions(loadedDbSessions);
    } catch (error) {
      console.error("loadFlashcardSessions error:", error);
      setFlashcardError("Failed to load DB sessions.");
    } finally {
      setLoadingSessions(false);
    }
  };

  /**
   * Create ephemeral session (local) with limit check
   */
  const createLocalSession = (sessionData) => {
    if (localSessions.length >= MAX_EPHEMERAL_SESSIONS) {
      throw new Error("Maximum number of study sessions reached.");
    }
    const newLocalSession = { ...sessionData, sessionType: "local" };
    const updatedSessions = [...localSessions, newLocalSession];
    localStorage.setItem("localSessions", JSON.stringify(updatedSessions));
    setLocalSessions(updatedSessions);
  };

  /**
   * Delete ephemeral session
   */
  const deleteLocalSession = (sessionId) => {
    if (location.pathname === `/flashcards-local/${sessionId}`) {
      navigate("/");
    }
    setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  /**
   * Rename ephemeral session
   */
  const updateLocalSession = (sessionId, newName) => {
    setLocalSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, studySession: newName } : s
      )
    );
  };

  /**
   * Delete DB-based session
   */
  const deleteFlashcardSession = async (sessionId) => {
    if (location.pathname === `/flashcards/${sessionId}`) {
      navigate("/");
    }
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("Not authenticated.");

      await axios.delete(`${BACKEND}/api/flashcards/${sessionId}`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      setFlashcardSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("deleteFlashcardSession error:", err);
      setFlashcardError(err.message || "Failed to delete DB session.");
    }
  };

  /**
   * Rename DB-based session
   */
  const updateFlashcardSessionName = async (sessionId, newName) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("Not authenticated.");

      await axios.put(
        `${BACKEND}/api/flashcards/${sessionId}/name`,
        { sessionName: newName },
        { headers: { Authorization: `Bearer ${localToken}` } }
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

  /**
   * Example Notion methods (unchanged), kept for completeness
   */
  const fetchNotionAuthUrl = async (token) => {
    return axios.get(`${BACKEND}/api/notion/auth-url`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const checkNotionAuthorization = async (token) => {
    return axios.get(`${BACKEND}/api/notion/is-authorized`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchNotionPageContent = async (token, pageId) => {
    return axios.get(`${BACKEND}/api/notion/page-content`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { pageId },
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        isLoggedIn,
        setIsLoggedIn,
        authLoading,
        resetUserContext,
        logout, // Expose logout

        // DB-based sessions
        flashcardSessions,
        setFlashcardSessions,
        loadingSessions,
        flashcardError,
        setFlashcardError,
        deleteFlashcardSession,
        updateFlashcardSessionName,

        // Local ephemeral sessions
        localSessions,
        setLocalSessions,
        createLocalSession,
        deleteLocalSession,
        updateLocalSession,
        MAX_EPHEMERAL_SESSIONS,
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
