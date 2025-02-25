import React, { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";

//eslint-disable-next-line
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Constants
  const MAX_EPHEMERAL_SESSIONS = 1;
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // DB-based flashcard sessions
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);

  // Local ephemeral sessions
  const [localSessions, setLocalSessions] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Reset user context on logout or auth failure
  const resetUserContext = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setAuthLoading(false);
    setFlashcardSessions([]);
    setFlashcardError(null);
    localStorage.removeItem("token");
  };

  const logout = () => {
    resetUserContext();
    navigate("/login?mode=login", { replace: true });
  };

  /**
   * Fetch current user details from backend.
   */
  const fetchCurrentUser = async () => {
    const localToken = localStorage.getItem("token");
    if (!localToken) {
      setAuthLoading(false);
      return;
    }
    setToken(localToken);
    try {
      const resp = await axios.get(`${BACKEND}/api/auth/me`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      setUser(resp.data.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("fetchCurrentUser error:", err);
      resetUserContext();
    } finally {
      setAuthLoading(false);
    }
  };

  // On mount: restore local sessions and fetch current user
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("localSessions") || "[]");
      setLocalSessions(stored);
    } catch (err) {
      console.error("Error loading localSessions:", err);
    }
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist local sessions to localStorage on change
  useEffect(() => {
    localStorage.setItem("localSessions", JSON.stringify(localSessions));
  }, [localSessions]);

  // Automatically logout when token expires
  useEffect(() => {
    let tokenExpiryTimeout;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const expiryTimestamp = decoded.exp * 1000;
        const timeLeft = expiryTimestamp - Date.now();
        if (timeLeft <= 0) {
          logout();
        } else {
          tokenExpiryTimeout = setTimeout(() => {
            logout();
          }, timeLeft);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
    return () => {
      if (tokenExpiryTimeout) {
        clearTimeout(tokenExpiryTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load DB-based flashcard sessions when user changes
  useEffect(() => {
    if (user) {
      loadFlashcardSessions();
    } else {
      setFlashcardSessions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // Local ephemeral session functions
  const createLocalSession = (sessionData) => {
    if (localSessions.length >= MAX_EPHEMERAL_SESSIONS) {
      throw new Error("Maximum number of study sessions reached.");
    }
    const newLocalSession = { ...sessionData, sessionType: "local" };
    const updatedSessions = [...localSessions, newLocalSession];
    localStorage.setItem("localSessions", JSON.stringify(updatedSessions));
    setLocalSessions(updatedSessions);
  };

  const deleteLocalSession = (sessionId) => {
    if (location.pathname === `/flashcards-local/${sessionId}`) {
      navigate("/");
    }
    setLocalSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const updateLocalSession = (sessionId, newName) => {
    setLocalSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, studySession: newName } : s
      )
    );
  };

  // DB-based session functions
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

  // Axios functions for flashcard session management
  const fetchFlashcardSession = async (sessionId) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");
      const response = await axios.get(
        `${BACKEND}/api/flashcards/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${localToken}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("fetchFlashcardSession error:", error);
    }
  };

  const generateAdditionalFlashcards = async (sessionId) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");
      await axios.post(
        `${BACKEND}/api/flashcards/${sessionId}/generate-additional-flashcards`,
        {},
        { headers: { Authorization: `Bearer ${localToken}` } }
      );
    } catch (error) {
      console.error("generateAdditionalFlashcards error:", error);
    }
  };

  // Axios functions for CreateStudySession functionality
  const uploadDocumentTranscript = async (selectedFile) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (!token) {
      const resp = await axios.post(`${BACKEND}/api/upload-public`, formData);
      return resp.data.transcript;
    } else {
      const resp = await axios.post(`${BACKEND}/api/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return resp.data.transcript;
    }
  };

  const getWebsiteTranscript = async (websiteUrl) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const resp = await axios.get(`${BACKEND}/api/website-transcript-public`, {
        params: { url: websiteUrl.trim() },
      });
      return resp.data.transcript;
    } else {
      const resp = await axios.get(`${BACKEND}/api/website-transcript`, {
        params: { url: websiteUrl.trim() },
        headers: { Authorization: `Bearer ${token}` },
      });
      return resp.data.transcript;
    }
  };

  const generateFlashcardsFromTranscript = async (transcriptText) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const resp = await axios.post(
        `${BACKEND}/api/openai/generate-flashcards-public`,
        { transcript: transcriptText }
      );
      return resp.data.flashcards;
    } else {
      const resp = await axios.post(
        `${BACKEND}/api/openai/generate-flashcards`,
        { transcript: transcriptText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return resp.data.flashcards;
    }
  };

  const createDBStudySession = async (
    sessionName,
    studyCards,
    transcriptText
  ) => {
    const token = localStorage.getItem("token");
    const resp = await axios.post(
      `${BACKEND}/api/flashcards`,
      {
        sessionName,
        studyCards,
        transcript: transcriptText,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return resp.data.flashcard;
  };

  // New Axios functions for Settings functionality
  const updateAccountInfo = async (payload) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(`${BACKEND}/api/users/update`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  };

  const changePassword = async (payload) => {
    const token = localStorage.getItem("token");
    await axios.put(`${BACKEND}/api/users/change-password`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const updatePreferences = async (payload) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${BACKEND}/api/users/preferences`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.user;
  };

  const cancelSubscription = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated.");
    await axios.post(
      `${BACKEND}/api/checkout/cancel-subscription`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const updatedUserResponse = await axios.get(`${BACKEND}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return updatedUserResponse.data.user;
  };

  // New Axios function for RequestFeature functionality
  const requestFeature = async (features) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not authenticated.");
    }
    const response = await axios.post(
      `${BACKEND}/api/feature-request`,
      { features },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };

  // New Axios functions for Login functionality
  const loginUser = async (payload) => {
    const response = await axios.post(`${BACKEND}/api/auth/login`, payload);
    return response.data;
  };

  const registerUser = async (payload) => {
    const response = await axios.post(`${BACKEND}/api/auth/register`, payload);
    return response.data;
  };

  const googleLoginUser = async (tokenId) => {
    const response = await axios.post(`${BACKEND}/api/auth/google`, {
      token: tokenId,
    });
    return response.data;
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
        logout,
        flashcardSessions,
        setFlashcardSessions,
        loadingSessions,
        flashcardError,
        setFlashcardError,
        deleteFlashcardSession,
        updateFlashcardSessionName,
        localSessions,
        setLocalSessions,
        createLocalSession,
        deleteLocalSession,
        updateLocalSession,
        MAX_EPHEMERAL_SESSIONS,

        // FlashcardSession.jsx functions
        fetchFlashcardSession,
        generateAdditionalFlashcards,

        // CreateStudySession.jsx axios functions
        uploadDocumentTranscript,
        getWebsiteTranscript,
        generateFlashcardsFromTranscript,
        createDBStudySession,

        // Settings.jsx axios functions
        updateAccountInfo,
        changePassword,
        updatePreferences,
        cancelSubscription,

        // Login.jsx axios functions
        loginUser,
        registerUser,
        googleLoginUser,

        // RequestFeature.jsx axios function
        requestFeature
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
