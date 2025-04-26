import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import services from '../index';

/**
 * Custom hook for managing application resources
 */
export function useResources() {
  // Resource states
  const [uploads, setUploads] = useState([]);
  const [folders, setFolders] = useState([]);
  const [multipleChoiceQuizzes, setMultipleChoiceQuizzes] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [aiChats, setAiChats] = useState([]);
  
  const navigate = useNavigate();

  // Reset all resource states
  const resetResources = () => {
    setUploads([]);
    setFolders([]);
    setMultipleChoiceQuizzes([]);
    setSummaries([]);
    setAiChats([]);
  };

  // ------------------- UPLOADS -------------------
  const fetchUploads = async () => {
    try {
      const uploadedFiles = await services.uploads.fetchUploads();
      setUploads(uploadedFiles);
      return uploadedFiles;
    } catch (error) {
      console.error("fetchUploads error:", error);
      setUploads([]);
      return [];
    }
  };

  const uploadDocumentTranscript = async (selectedFile, folderID = null) => {
    try {
      const upload = await services.uploads.uploadDocumentTranscript(selectedFile, folderID);
      if (upload.id) {
        setUploads(prev => [...prev, upload]);
      }
      return upload;
    } catch (error) {
      console.error("uploadDocumentTranscript error:", error);
      throw error;
    }
  };

  const createUploadFromText = async (transcriptText, fileName = "Text Input") => {
    try {
      const newUpload = await services.uploads.createUploadFromText(transcriptText, fileName);
      if (newUpload.id) {
        setUploads((prev) => [...prev, newUpload]);
      }
      return newUpload;
    } catch (error) {
      console.error("createUploadFromText error:", error);
      throw error;
    }
  };

  const getWebsiteTranscript = (websiteUrl) => {
    return services.uploads.getWebsiteTranscript(websiteUrl);
  };

  const deleteUpload = async (upload_id) => {
    try {
      const success = await services.uploads.deleteUpload(upload_id);
      if (success) {
        fetchUploads();
      }
    } catch (error) {
      console.error("deleteUpload error:", error);
    }
  };

  // ------------------- FOLDERS -------------------
  const fetchFolders = async () => {
    try {
      const foldersData = await services.folders.fetchFolders();
      setFolders(foldersData);
    } catch (error) {
      console.error("fetchFolders error:", error);
      setFolders([]);
    }
  };

  const getFolders = () => services.folders.getFolders();

  const createFolder = async (folderName) => {
    try {
      const newFolder = await services.folders.createFolder(folderName);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (error) {
      console.error("createFolder error:", error);
      throw error;
    }
  };

  const renameFolder = async (folderId, newName) => {
    try {
      const success = await services.folders.renameFolder(folderId, newName);
      if (success) {
        setFolders((prev) =>
          prev.map((f) => (f.id === folderId ? { ...f, folderName: newName } : f))
        );
      }
    } catch (error) {
      console.error("renameFolder error:", error);
    }
  };

  // ------------------- QUIZZES -------------------
  const fetchAllQuizzes = async () => {
    try {
      const quizzes = await services.quizzes.fetchAllQuizzes();
      setMultipleChoiceQuizzes(quizzes);
    } catch (error) {
      console.error("fetchAllQuizzes error:", error);
      setMultipleChoiceQuizzes([]);
    }
  };

  const createQuiz = async (uploadId, folderID) => {
    try {
      const newQuiz = await services.quizzes.createQuiz(uploadId, folderID);
      setMultipleChoiceQuizzes((prev) => [...prev, newQuiz]);
      return newQuiz;
    } catch (error) {
      console.error("createQuiz error:", error);
      throw error;
    }
  };

  const renameQuiz = async (quizId, newName) => {
    try {
      const success = await services.quizzes.renameQuiz(quizId, newName);
      if (success) {
        setMultipleChoiceQuizzes((prev) =>
          prev.map((quiz) =>
            quiz.id === quizId ? { ...quiz, studySession: newName } : quiz
          )
        );
      }
    } catch (error) {
      console.error("renameQuiz error:", error);
    }
  };

  const deleteQuiz = async (quizID) => {
    if (location.pathname === `/mcq/${quizID}`) {
      navigate("/create-resource");
    }
    try {
      const success = await services.quizzes.deleteQuiz(quizID);
      if (success) {
        setMultipleChoiceQuizzes((prev) => prev.filter((q) => q.id !== quizID));
      }
    } catch (error) {
      console.error("deleteQuiz error:", error);
    }
  };

  const assignQuizToFolder = async (quizId, folderID) => {
    try {
      await services.quizzes.assignQuizToFolder(quizId, folderID);
      setMultipleChoiceQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId ? { ...quiz, folderID } : quiz
        )
      );
    } catch (error) {
      console.error("assignQuizToFolder error:", error);
      throw error;
    }
  };

  const fetchQuizzesByFolder = (folderID) => {
    return services.quizzes.fetchQuizzesByFolder(folderID);
  };

  // ------------------- SUMMARIES -------------------
  const fetchAllSummaries = async () => {
    try {
      const summariesData = await services.summaries.fetchAllSummaries();
      setSummaries(summariesData);
    } catch (error) {
      console.error("fetchAllSummaries error:", error);
      setSummaries([]);
    }
  };

  const createSummary = async (uploadId, userMessage, folderID) => {
    try {
      const newSummary = await services.summaries.createSummary(uploadId, userMessage, folderID);
      setSummaries((prev) => [...prev, newSummary]);
      return newSummary;
    } catch (error) {
      console.error("createSummary error:", error);
      throw error;
    }
  };

  const deleteSummary = async (summaryId) => {
    if (location.pathname === `/summary/${summaryId}`) {
      navigate("/create-resource");
    }
    try {
      const success = await services.summaries.deleteSummary(summaryId);
      if (success) {
        setSummaries((prev) => prev.filter((s) => s.id !== summaryId));
      }
    } catch (error) {
      console.error("deleteSummary error:", error);
    }
  };

  const renameSummary = async (summaryId, newName) => {
    try {
      const success = await services.summaries.renameSummary(summaryId, newName);
      if (success) {
        setSummaries((prev) =>
          prev.map((s) =>
            s.id === summaryId ? { ...s, studySession: newName } : s
          )
        );
      }
    } catch (error) {
      console.error("renameSummary error:", error);
    }
  };

  const assignSummaryToFolder = async (summaryId, folderID) => {
    try {
      await services.summaries.assignSummaryToFolder(summaryId, folderID);
      setSummaries((prev) =>
        prev.map((summary) =>
          summary.id === summaryId ? { ...summary, folderID } : summary
        )
      );
    } catch (error) {
      console.error("assignSummaryToFolder error:", error);
      throw error;
    }
  };

  const fetchSummariesByFolder = (folderID) => {
    return services.summaries.fetchSummariesByFolder(folderID);
  };

  // ------------------- AI CHATS -------------------
  const fetchAllAiChats = async () => {
    try {
      const chats = await services.chats.fetchAllAiChats();
      setAiChats(chats);
    } catch (error) {
      console.error("fetchAllAiChats error:", error);
      setAiChats([]);
    }
  };

  const createChat = async (uploadId, userMessage, folderID) => {
    try {
      const newChat = await services.chats.createChat(uploadId, userMessage, folderID);
      setAiChats((prev) => [...prev, newChat]);
      return newChat;
    } catch (error) {
      console.error("createChat error:", error);
      throw error;
    }
  };

  const deleteAiChat = async (chatId) => {
    if (location.pathname === `/chat/${chatId}`) {
      navigate("/create-resource");
    }
    try {
      const success = await services.chats.deleteAiChat(chatId);
      if (success) {
        setAiChats((prev) => prev.filter((c) => c.id !== chatId));
      }
    } catch (error) {
      console.error("deleteAiChat error:", error);
    }
  };

  const renameAiChat = async (chatId, newName) => {
    try {
      const success = await services.chats.renameAiChat(chatId, newName);
      if (success) {
        setAiChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, studySession: newName } : chat
          )
        );
      }
    } catch (error) {
      console.error("renameAiChat error:", error);
    }
  };

  const assignAiChatToFolder = async (chatId, folderID) => {
    try {
      await services.chats.assignAiChatToFolder(chatId, folderID);
      setAiChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, folderID } : chat
        )
      );
    } catch (error) {
      console.error("assignAiChatToFolder error:", error);
      throw error;
    }
  };

  const fetchAiChatsByFolder = (folderID) => {
    return services.chats.fetchAiChatsByFolder(folderID);
  };

  // Load all resources
  const loadAllResources = async () => {
    console.log("Loading all resources...");
    
    await Promise.all([
      fetchUploads(),
      fetchFolders(),
      fetchAllQuizzes(),
      fetchAllSummaries(),
      fetchAllAiChats(),
    ]);
    
    console.log("Resource loading complete");
  };

  return {
    // State
    uploads,
    folders,
    multipleChoiceQuizzes, 
    summaries,
    aiChats,
    
    // State setters
    setUploads,
    setFolders,
    setMultipleChoiceQuizzes,
    setSummaries,
    setAiChats,
    
    // General
    resetResources,
    loadAllResources,
    
    // Uploads
    fetchUploads,
    uploadDocumentTranscript,
    createUploadFromText,
    getWebsiteTranscript,
    deleteUpload,
    
    // Folders
    fetchFolders,
    getFolders,
    createFolder,
    renameFolder,
    
    // Quizzes
    fetchAllQuizzes,
    createQuiz,
    renameQuiz,
    deleteQuiz,
    assignQuizToFolder,
    fetchQuizzesByFolder,
    
    // Summaries
    fetchAllSummaries,
    createSummary,
    deleteSummary,
    renameSummary,
    assignSummaryToFolder,
    fetchSummariesByFolder,
    
    // AI Chats
    fetchAllAiChats,
    createChat,
    deleteAiChat,
    renameAiChat,
    assignAiChatToFolder,
    fetchAiChatsByFolder,
  };
} 