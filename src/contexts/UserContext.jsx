import React, { createContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";

//eslint-disable-next-line
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const MAX_EPHEMERAL_SESSIONS = 1;
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  // --------------------------------------------------
  // AUTH STATE
  // --------------------------------------------------
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // --------------------------------------------------
  // FLASHCARDS
  // --------------------------------------------------
  const [flashcardSessions, setFlashcardSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [flashcardError, setFlashcardError] = useState(null);

  // Local ephemeral sessions for flashcards
  const [localSessions, setLocalSessions] = useState([]);

  // --------------------------------------------------
  // UPLOADS
  // --------------------------------------------------
  const [uploads, setUploads] = useState([]);

  // --------------------------------------------------
  // FOLDERS
  // --------------------------------------------------
  const [folders, setFolders] = useState([]);

  // --------------------------------------------------
  // MCQ QUIZZES
  // --------------------------------------------------
  const [multipleChoiceQuizzes, setMultipleChoiceQuizzes] = useState([]);

  // --------------------------------------------------
  // SUMMARIES
  // --------------------------------------------------
  const [summaries, setSummaries] = useState([]);

  // --------------------------------------------------
  // AI CHATS
  // --------------------------------------------------
  const [aiChats, setAiChats] = useState([]);

  // --------------------------------------------------
  // ROUTING & INIT
  // --------------------------------------------------
  const navigate = useNavigate();
  const location = useLocation();

  const resetUserContext = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setAuthLoading(false);

    setFlashcardSessions([]);
    setFlashcardError(null);
    setLocalSessions([]);
    setUploads([]);
    setFolders([]);
    setMultipleChoiceQuizzes([]);
    setSummaries([]);
    setAiChats([]);

    localStorage.removeItem("token");
  };

  const logout = () => {
    resetUserContext();
    navigate("/login?mode=login", { replace: true });
  };

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

  // On mount: restore ephemeral flashcard sessions, then fetch user
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

  // Persist local ephemeral flashcards
  useEffect(() => {
    localStorage.setItem("localSessions", JSON.stringify(localSessions));
  }, [localSessions]);

  // --------------------------------------------------
  // AXIOS INTERCEPTOR: TOKEN REFRESH
  // --------------------------------------------------
  useEffect(() => {
    const refreshToken = async (oldToken) => {
      try {
        const response = await axios.post(
          `${BACKEND}/api/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${oldToken}` } }
        );
        return response.data.token;
      } catch (error) {
        console.error("Refresh token error:", error);
        logout();
        return null;
      }
    };

    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const localToken = localStorage.getItem("token");
        if (localToken) {
          try {
            const decoded = jwtDecode(localToken);
            const expiryTimestamp = decoded.exp * 1000;
            const timeLeft = expiryTimestamp - Date.now();

            const oneDay = 24 * 60 * 60 * 1000;
            if (timeLeft < oneDay && timeLeft > 0) {
              const newToken = await refreshToken(localToken);
              if (newToken) {
                localStorage.setItem("token", newToken);
                setToken(newToken);
                config.headers.Authorization = `Bearer ${newToken}`;
                return config;
              } else {
                return Promise.reject("Token refresh failed");
              }
            } else if (timeLeft <= 0) {
              logout();
              return Promise.reject("Token is expired");
            } else {
              config.headers.Authorization = `Bearer ${localToken}`;
              return config;
            }
          } catch (error) {
            console.error("Error decoding token:", error);
            logout();
            return Promise.reject(error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BACKEND]);

  // --------------------------------------------------
  // AUTO LOGOUT IF EXPIRED
  // --------------------------------------------------
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
      if (tokenExpiryTimeout) clearTimeout(tokenExpiryTimeout);
    };
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --------------------------------------------------
  // WHEN USER LOGS IN OR OUT:
  // LOAD ALL DB RESOURCES
  // --------------------------------------------------
  useEffect(() => {
    if (user) {
      // Flashcards
      loadFlashcardSessions();
      // Quizzes
      fetchAllQuizzes();
      // Summaries
      fetchAllSummaries();
      // AI Chats
      fetchAllAiChats();
      // Folders
      fetchFolders();
    } else {
      setFlashcardSessions([]);
      setMultipleChoiceQuizzes([]);
      setSummaries([]);
      setAiChats([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // --------------------------------------------------
  // FLASHCARDS
  // --------------------------------------------------
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
      // The response returns { data: [ {id, ...}, ... ] }
      const loaded = resp.data.flashcards || resp.data.data || [];
      const loadedDbSessions = loaded.map((s) => ({
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

  // Local ephemeral
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
      navigate("/create-resource");
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

  // DB-based
  const deleteFlashcardSession = async (sessionId) => {
    if (location.pathname === `/flashcards/${sessionId}`) {
      navigate("/create-resource");
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

  const createFlashcards = async (uploadId, sessionName, studyCards = []) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User not authenticated.");

    try {
      const resp = await axios.post(
        `${BACKEND}/api/flashcards`,
        {
          uploadId,
          sessionName,
          studyCards,
        },
        {
          headers: { Authorization: `Bearer ${localToken}` },
        }
      );

      return resp.data.data;
    } catch (err) {
      console.error("createFlashcards error:", err);
      throw err;
    }
  };

  // Create flashcards from an existing upload's transcript
  const createFlashcardsFromUpload = async (uploadId) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");

      // 1) Retrieve the transcript from /api/uploads/:id
      const uploadResp = await axios.get(`${BACKEND}/api/uploads/${uploadId}`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      const { transcript } = uploadResp.data;

      // 2) Generate flashcards
      const genResp = await axios.post(
        `${BACKEND}/api/flashcards/generate-flashcards`,
        { transcript },
        { headers: { Authorization: `Bearer ${localToken}` } }
      );
      // The response is [sessionName, [ {question, answer}... ] ]
      const [autoSessionName, generatedCards] = genResp.data.flashcards;

      // 3) Create (save) a new flashcards session
      const createResp = await axios.post(
        `${BACKEND}/api/flashcards`,
        {
          uploadId,
          sessionName: autoSessionName || "Auto Flashcards",
          studyCards: generatedCards,
        },
        { headers: { Authorization: `Bearer ${localToken}` } }
      );
      const newFlashcardSession = createResp.data.data;
      setFlashcardSessions((prev) => [...prev, newFlashcardSession]);
      return newFlashcardSession;
    } catch (err) {
      console.error("createFlashcardsFromUpload error:", err);
      throw err;
    }
  };

  // --------------------------------------------------
  // UPLOADS
  // --------------------------------------------------
  const fetchUploads = async () => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const resp = await axios.get(`${BACKEND}/api/uploads`, {
      headers: { Authorization: `Bearer ${localToken}` },
    });
    setUploads(resp.data.uploads || []);
  };

  const uploadDocumentTranscript = async (selectedFile) => {
    const localToken = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (!localToken) {
      // ephemeral
      const resp = await axios.post(`${BACKEND}/api/upload-public`, formData);
      return { id: "", transcript: resp.data.transcript };
    } else {
      const resp = await axios.post(`${BACKEND}/api/uploads`, formData, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      return resp.data.upload;
    }
  };

  const createUploadFromText = async (
    transcriptText,
    fileName = "Text Input"
  ) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) {
      // ephemeral
      return { id: "", transcript: transcriptText, fileName };
    } else {
      const resp = await axios.post(
        `${BACKEND}/api/uploads/from-text`,
        { transcript: transcriptText, fileName },
        { headers: { Authorization: `Bearer ${localToken}` } }
      );
      const newUpload = resp.data.upload;
      setUploads((prev) => [...prev, newUpload]);
      return newUpload;
    }
  };

  const getWebsiteTranscript = async (websiteUrl) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) {
      // ephemeral
      const resp = await axios.get(`${BACKEND}/api/website-transcript-public`, {
        params: { url: websiteUrl.trim() },
      });
      return resp.data.transcript;
    } else {
      const resp = await axios.get(`${BACKEND}/api/website-transcript`, {
        params: { url: websiteUrl.trim() },
        headers: { Authorization: `Bearer ${localToken}` },
      });
      return resp.data.transcript;
    }
  };

  // --------------------------------------------------
  // MCQ QUIZZES
  // --------------------------------------------------
  const fetchAllQuizzes = async () => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) return;
      const resp = await axios.get(`${BACKEND}/api/multiple-choice-quizzes`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      // { data: [ {id, ...}, ... ] }
      const quizzes = resp.data.data || [];
      setMultipleChoiceQuizzes(quizzes);
    } catch (error) {
      console.error("fetchAllQuizzes error:", error);
    }
  };

  const createQuiz = async (uploadId) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const resp = await axios.post(
      `${BACKEND}/api/multiple-choice-quizzes`,
      { uploadId },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    // The server returns { data: { id, ... } }
    const newQuiz = resp.data.data;
    setMultipleChoiceQuizzes((prev) => [...prev, newQuiz]);
    return newQuiz;
  };

  const renameQuiz = async (quizId, newName) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    await axios.put(
      `${BACKEND}/api/multiple-choice-quizzes/${quizId}/rename`,
      { newName },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    // Update local state
    setMultipleChoiceQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === quizId ? { ...quiz, studySession: newName } : quiz
      )
    );
  };

  const deleteQuiz = async (quizID) => {
    if (location.pathname === `/mcq/${quizID}`) {
      navigate("/create-resource");
    }
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");
      await axios.delete(`${BACKEND}/api/multiple-choice-quizzes/${quizID}`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      setMultipleChoiceQuizzes((prev) => prev.filter((q) => q.id !== quizID));
    } catch (error) {
      console.error("deleteQuiz error:", error);
    }
  };

  // --------------------------------------------------
  // SUMMARIES
  // --------------------------------------------------
  const fetchAllSummaries = async () => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) return;
      const resp = await axios.get(`${BACKEND}/api/summaries`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      // { data: [ {id, ...}, ... ] }
      setSummaries(resp.data.data || []);
    } catch (error) {
      console.error("fetchAllSummaries error:", error);
    }
  };

  const createSummary = async (uploadId, userMessage) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const resp = await axios.post(
      `${BACKEND}/api/summaries`,
      { uploadId, userMessage },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    // The server returns { summary: { id, ... } }
    const newSummary = resp.data.summary;
    setSummaries((prev) => [...prev, newSummary]);
    return newSummary;
  };

  const deleteSummary = async (summaryId) => {
    if (location.pathname === `/summary/${summaryId}`) {
      navigate("/create-resource");
    }
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");
      await axios.delete(`${BACKEND}/api/summaries/${summaryId}`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      setSummaries((prev) => prev.filter((s) => s.id !== summaryId));
    } catch (error) {
      console.error("deleteSummary error:", error);
    }
  };

  const renameSummary = async (summaryId, newName) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    await axios.put(
      `${BACKEND}/api/summaries/${summaryId}/rename`,
      { newName },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    // Update local state
    setSummaries((prev) =>
      prev.map((s) =>
        s.id === summaryId ? { ...s, studySession: newName } : s
      )
    );
  };

  // --------------------------------------------------
  // AI CHATS
  // --------------------------------------------------
  const fetchAllAiChats = async () => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) return;
      const resp = await axios.get(`${BACKEND}/api/aichats`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      // The controller returns { chats: [ {id, ...}, ... ] }
      setAiChats(resp.data.chats || []);
    } catch (error) {
      console.error("fetchAllAiChats error:", error);
    }
  };

  const createChat = async (uploadId, userMessage) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const resp = await axios.post(
      `${BACKEND}/api/aichats`,
      { uploadId, userMessage },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    // The server returns { chat: { id, ... } }
    const newChat = resp.data.chat;
    setAiChats((prev) => [...prev, newChat]);
    return newChat;
  };

  const deleteAiChat = async (chatId) => {
    if (location.pathname === `/chat/${chatId}`) {
      navigate("/create-resource");
    }
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");
      await axios.delete(`${BACKEND}/api/aichats/${chatId}`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });
      setAiChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (error) {
      console.error("deleteAiChat error:", error);
    }
  };

  const renameAiChat = async (chatId, newName) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    await axios.put(
      `${BACKEND}/api/aichats/${chatId}/rename`,
      { newName },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    // Update local state
    setAiChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, studySession: newName } : chat
      )
    );
  };

  // --------------------------------------------------
  // FOLDERS
  // --------------------------------------------------
  const getFolders = async () => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const response = await axios.get(`${BACKEND}/api/folders`, {
      headers: { Authorization: `Bearer ${localToken}` },
    });
    console.log("Resp: ", response);
    return response.data.data;
  };

  const fetchFolders = async () => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const resp = await axios.get(`${BACKEND}/api/folders`, {
      headers: { Authorization: `Bearer ${localToken}` },
    });
    setFolders(resp.data.folders || []);
  };

  const createFolder = async (folderName) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const response = await axios.post(
      `${BACKEND}/api/folders`,
      { folderName },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    return response.data.folder;
  };

  const assignSessionToFolder = async (sessionId, folderID) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    const response = await axios.put(
      `${BACKEND}/api/flashcards/${sessionId}/assign-folder`,
      { folderID },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    return response.data;
  };

  const renameFolder = async (folderId, newName) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    await axios.put(
      `${BACKEND}/api/folders/${folderId}/rename`,
      { newName },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    // Update local state
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, folderName: newName } : f))
    );
  };

  // --------------------------------------------------
  // SETTINGS & ACCOUNT
  // --------------------------------------------------
  const updateAccountInfo = async (payload) => {
    const localToken = localStorage.getItem("token");
    const response = await axios.put(`${BACKEND}/api/users/update`, payload, {
      headers: { Authorization: `Bearer ${localToken}` },
    });
    return response.data.user;
  };

  const changePassword = async (payload) => {
    const localToken = localStorage.getItem("token");
    await axios.put(`${BACKEND}/api/users/change-password`, payload, {
      headers: { Authorization: `Bearer ${localToken}` },
    });
  };

  const updatePreferences = async (payload) => {
    const localToken = localStorage.getItem("token");
    const response = await axios.put(
      `${BACKEND}/api/users/preferences`,
      payload,
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    return response.data.user;
  };

  const cancelSubscription = async () => {
    const localToken = localStorage.getItem("token");
    if (!localToken) throw new Error("User is not authenticated.");
    await axios.post(
      `${BACKEND}/api/checkout/cancel-subscription`,
      {},
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    const updatedUserResponse = await axios.get(`${BACKEND}/api/auth/me`, {
      headers: { Authorization: `Bearer ${localToken}` },
    });
    return updatedUserResponse.data.user;
  };

  const requestFeature = async (features) => {
    const localToken = localStorage.getItem("token");
    if (!localToken) {
      throw new Error("User is not authenticated.");
    }
    const response = await axios.post(
      `${BACKEND}/api/feature-request`,
      { features },
      { headers: { Authorization: `Bearer ${localToken}` } }
    );
    return response.data;
  };

  // --------------------------------------------------
  // LOGIN / REGISTER
  // --------------------------------------------------
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

  // Fetch AI Chat by folder
  const fetchAiChatsByFolder = async (folderID) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");

      const res = await axios.get(`${BACKEND}/api/aichats/folder/${folderID}`, {
        headers: { Authorization: `Bearer ${localToken}` },
      });

      return res.data.chats; // The array of chats
    } catch (error) {
      console.error("fetchAiChatsByFolder error:", error);
      throw error;
    }
  };

  // Fetch Flashcards by folder
  const fetchFlashcardsByFolder = async (folderID) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");

      const res = await axios.get(
        `${BACKEND}/api/flashcards/folder/${folderID}`,
        {
          headers: { Authorization: `Bearer ${localToken}` },
        }
      );

      return res.data.data; // The array of flashcard sessions
    } catch (error) {
      console.error("fetchFlashcardsByFolder error:", error);
      throw error;
    }
  };

  // Fetch MCQ by folder
  const fetchQuizzesByFolder = async (folderID) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");

      const res = await axios.get(
        `${BACKEND}/api/multiple-choice-quizzes/folder/${folderID}`,
        {
          headers: { Authorization: `Bearer ${localToken}` },
        }
      );
      return res.data.data; // The array of quizzes
    } catch (error) {
      console.error("fetchQuizzesByFolder error:", error);
      throw error;
    }
  };

  // Fetch Summaries by folder
  const fetchSummariesByFolder = async (folderID) => {
    try {
      const localToken = localStorage.getItem("token");
      if (!localToken) throw new Error("User is not authenticated.");

      const res = await axios.get(
        `${BACKEND}/api/summaries/folder/${folderID}`,
        {
          headers: { Authorization: `Bearer ${localToken}` },
        }
      );
      return res.data.data; // The array of summaries
    } catch (error) {
      console.error("fetchSummariesByFolder error:", error);
      throw error;
    }
  };

  // --------------------------------------------------
  // PROVIDER RETURN
  // --------------------------------------------------
  return (
    <UserContext.Provider
      value={{
        // Auth
        user,
        setUser,
        token,
        isLoggedIn,
        setIsLoggedIn,
        authLoading,
        resetUserContext,
        logout,

        // Flashcards
        flashcardSessions,
        setFlashcardSessions,
        loadingSessions,
        flashcardError,
        setFlashcardError,
        deleteFlashcardSession,
        updateFlashcardSessionName,
        fetchFlashcardSession,
        generateAdditionalFlashcards,
        createFlashcards,
        createFlashcardsFromUpload,

        // Local ephemeral flashcards
        localSessions,
        setLocalSessions,
        createLocalSession,
        deleteLocalSession,
        updateLocalSession,
        MAX_EPHEMERAL_SESSIONS,

        // Uploads
        uploads,
        fetchUploads,
        uploadDocumentTranscript,
        createUploadFromText,
        getWebsiteTranscript,

        // Folders
        folders,
        fetchFolders,
        createFolder,
        assignSessionToFolder,
        renameFolder,

        // MCQ Quizzes
        multipleChoiceQuizzes,
        setMultipleChoiceQuizzes,
        fetchAllQuizzes,
        createQuiz,
        renameQuiz,
        deleteQuiz,

        // Summaries
        summaries,
        setSummaries,
        fetchAllSummaries,
        createSummary,
        deleteSummary,
        renameSummary,

        // AI Chat
        aiChats,
        setAiChats,
        fetchAllAiChats,
        createChat,
        deleteAiChat,
        renameAiChat,

        // Account
        updateAccountInfo,
        changePassword,
        updatePreferences,
        cancelSubscription,

        requestFeature,
        loginUser,
        registerUser,
        googleLoginUser,

        // Fetch by folder
        fetchAiChatsByFolder,
        fetchFlashcardsByFolder,
        fetchQuizzesByFolder,
        fetchSummariesByFolder,
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
