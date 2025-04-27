import { useState } from "react";
import { useNavigate } from "react-router-dom";
import services from "../_SERVICE_EXPORTS";

/**
 * Custom hook for managing application resources
 * 
 * This hook provides comprehensive functionality for managing all resource types
 * in the application, including uploads, folders, multiple choice quizzes, summaries,
 * and AI chats. It handles CRUD operations for each resource type and provides methods
 * for organizing resources into folders.
 * 
 * @returns {Object} Resource management methods and state
 * @property {Array} uploads - Array of user's uploaded documents
 * @property {Array} folders - Array of user's folders
 * @property {Array} multipleChoiceQuizzes - Array of user's multiple choice quizzes
 * @property {Array} summaries - Array of user's document summaries
 * @property {Array} aiChats - Array of user's AI chat sessions
 * @property {Function} resetResources - Function to reset all resource states
 * @property {Function} loadAllResources - Function to load all resource types at once
 * @property {Function} fetchUploads - Function to fetch user's uploads
 * @property {Function} uploadDocumentTranscript - Function to upload a document
 * @property {Function} createUploadFromText - Function to create an upload from text input
 * @property {Function} getWebsiteTranscript - Function to extract text from a website
 * @property {Function} deleteUpload - Function to delete an upload
 * @property {Function} fetchFolders - Function to fetch user's folders
 * @property {Function} createFolder - Function to create a new folder
 * @property {Function} renameFolder - Function to rename a folder
 * @property {Function} deleteFolder - Function to delete a folder
 * @property {Function} fetchAllQuizzes - Function to fetch user's quizzes
 * @property {Function} createQuiz - Function to create a new quiz
 * @property {Function} renameQuiz - Function to rename a quiz
 * @property {Function} deleteQuiz - Function to delete a quiz
 * @property {Function} assignQuizToFolder - Function to assign a quiz to a folder
 * @property {Function} fetchQuizzesByFolder - Function to fetch quizzes by folder
 */
export function useResources() {
  // Resource states
  const [uploads, setUploads] = useState([]);
  const [folders, setFolders] = useState([]);
  const [multipleChoiceQuizzes, setMultipleChoiceQuizzes] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [aiChats, setAiChats] = useState([]);

  const navigate = useNavigate();

  /**
   * Resets all resource states to empty arrays
   */
  const resetResources = () => {
    setUploads([]);
    setFolders([]);
    setMultipleChoiceQuizzes([]);
    setSummaries([]);
    setAiChats([]);
  };

  // ------------------- UPLOADS -------------------
  /**
   * Fetches all uploads for the current user
   * 
   * @returns {Promise<Array>} Array of user's uploaded documents
   */
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

  /**
   * Uploads a document and creates a transcript
   * 
   * @param {File} selectedFile - The file object to upload
   * @param {string|null} folderID - Optional folder ID to assign the upload to
   * @returns {Promise<Object>} The created upload object
   * @throws {Error} If upload fails
   */
  const uploadDocumentTranscript = async (selectedFile, folderID = null) => {
    try {
      const upload = await services.uploads.uploadDocumentTranscript(
        selectedFile,
        folderID
      );
      if (upload.id) {
        setUploads((prev) => [...prev, upload]);
      }
      return upload;
    } catch (error) {
      console.error("uploadDocumentTranscript error:", error);
      throw error;
    }
  };

  /**
   * Creates an upload from raw text input
   * 
   * @param {string} transcriptText - Raw text content
   * @param {string} fileName - Name for the created file
   * @returns {Promise<Object>} The created upload object
   * @throws {Error} If creation fails
   */
  const createUploadFromText = async (
    transcriptText,
    fileName = "Text Input"
  ) => {
    try {
      const newUpload = await services.uploads.createUploadFromText(
        transcriptText,
        fileName
      );
      if (newUpload.id) {
        setUploads((prev) => [...prev, newUpload]);
      }
      return newUpload;
    } catch (error) {
      console.error("createUploadFromText error:", error);
      throw error;
    }
  };

  /**
   * Extracts text content from a website URL
   * 
   * @param {string} websiteUrl - URL to extract content from
   * @returns {Promise<string>} Extracted text content
   */
  const getWebsiteTranscript = (websiteUrl) => {
    return services.uploads.getWebsiteTranscript(websiteUrl);
  };

  /**
   * Deletes an uploaded document
   * 
   * @param {string} upload_id - ID of the upload to delete
   * @returns {Promise<void>}
   */
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
  /**
   * Fetches all folders for the current user
   * 
   * @returns {Promise<Array>} Array of user's folders
   */
  const fetchFolders = async () => {
    try {
      const foldersData = await services.folders.fetchFolders();
      setFolders(foldersData);
    } catch (error) {
      console.error("fetchFolders error:", error);
      setFolders([]);
    }
  };

  /**
   * Gets folders synchronously from service
   * 
   * @returns {Array} Array of user's folders
   */
  const getFolders = () => services.folders.getFolders();

  /**
   * Creates a new folder
   * 
   * @param {string} folderName - Name for the new folder
   * @returns {Promise<Object>} The created folder object
   * @throws {Error} If creation fails
   */
  const createFolder = async (folderName) => {
    try {
      const newFolder = await services.folders.createFolder(folderName);
      setFolders((prev) => [...prev, newFolder]);
      return newFolder;
    } catch (error) {
      console.error("createFolder error:", error);
      throw error;
    }
  };

  /**
   * Renames an existing folder
   * 
   * @param {string} folderId - ID of the folder to rename
   * @param {string} newName - New name for the folder
   * @returns {Promise<void>}
   */
  const renameFolder = async (folderId, newName) => {
    try {
      const success = await services.folders.renameFolder(folderId, newName);
      if (success) {
        setFolders((prev) =>
          prev.map((f) =>
            f.id === folderId ? { ...f, folderName: newName } : f
          )
        );
      }
    } catch (error) {
      console.error("renameFolder error:", error);
    }
  };

  /**
   * Deletes a folder
   * 
   * @param {string} folderId - ID of the folder to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  const deleteFolder = async (folderId) => {
    try {
      const success = await services.folders.deleteFolder(folderId);
      if (success) {
        setFolders((prev) => prev.filter(f => f.id !== folderId));
      }
      return success;
    } catch (error) {
      console.error("deleteFolder error:", error);
      return false;
    }
  };

  // ------------------- QUIZZES -------------------
  /**
   * Fetches all multiple choice quizzes for the current user
   * Removes any duplicate quizzes based on ID
   * 
   * @returns {Promise<Array>} Array of user's quizzes
   */
  const fetchAllQuizzes = async () => {
    try {
      const quizzes = await services.quizzes.fetchAllQuizzes();

      // Ensure we're removing any duplicates before setting state
      const uniqueQuizzes = removeDuplicates(quizzes, "id");
      if (uniqueQuizzes.length !== quizzes.length) {
        console.warn(
          `Removed ${
            quizzes.length - uniqueQuizzes.length
          } duplicate quizzes in useResources hook`
        );
      }

      setMultipleChoiceQuizzes(uniqueQuizzes);
      return uniqueQuizzes;
    } catch (error) {
      console.error("fetchAllQuizzes error:", error);
      setMultipleChoiceQuizzes([]);
      return [];
    }
  };

  /**
   * Creates a new quiz from an uploaded document
   * 
   * @param {string} uploadId - ID of the upload to create the quiz from
   * @param {string|null} folderID - Optional folder ID to assign the quiz to
   * @returns {Promise<Object>} The created quiz object
   * @throws {Error} If creation fails
   */
  const createQuiz = async (uploadId, folderID) => {
    try {
      const newQuiz = await services.quizzes.createQuiz(uploadId, folderID);

      // Check if a quiz with this ID already exists in the state
      setMultipleChoiceQuizzes((prev) => {
        if (prev.some((q) => q.id === newQuiz.id)) {
          console.warn(
            `Quiz with ID ${newQuiz.id} already exists in state, not adding duplicate`
          );
          return prev;
        }
        return [...prev, newQuiz];
      });

      return newQuiz;
    } catch (error) {
      console.error("createQuiz error:", error);
      throw error;
    }
  };

  /**
   * Renames an existing quiz
   * 
   * @param {string} quizId - ID of the quiz to rename
   * @param {string} newName - New name for the quiz
   * @returns {Promise<void>}
   */
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

  /**
   * Deletes a quiz
   * Navigates away if the user is currently viewing the deleted quiz
   * 
   * @param {string} quizID - ID of the quiz to delete
   * @returns {Promise<void>}
   */
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

  /**
   * Assigns a quiz to a folder
   * 
   * @param {string} quizId - ID of the quiz to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise<void>}
   * @throws {Error} If assignment fails
   */
  const assignQuizToFolder = async (quizId, folderID) => {
    try {
      // Call the API to update the folder
      await services.quizzes.assignQuizToFolder(quizId, folderID);

      // Update the local state immediately to show change in UI
      setMultipleChoiceQuizzes((prev) =>
        prev.map((quiz) => (quiz.id === quizId ? { ...quiz, folderID } : quiz))
      );

      // Reload all quizzes to ensure data consistency
      await fetchAllQuizzes();
    } catch (error) {
      console.error("assignQuizToFolder error:", error);
      throw error;
    }
  };

  /**
   * Fetches all quizzes in a specific folder
   * 
   * @param {string} folderID - ID of the folder to fetch quizzes from
   * @returns {Promise<Array>} Quizzes in the specified folder
   */
  const fetchQuizzesByFolder = async (folderID) => {
    try {
      const quizzes = await services.quizzes.fetchQuizzesByFolder(folderID);

      // Update the multipleChoiceQuizzes state with the returned data
      if (Array.isArray(quizzes)) {
        setMultipleChoiceQuizzes(quizzes);
      }

      return quizzes;
    } catch (error) {
      console.error("fetchQuizzesByFolder error:", error);
      return [];
    }
  };

  // ------------------- SUMMARIES -------------------
  /**
   * Fetches all summaries for the current user
   * Removes any duplicate summaries based on ID
   * 
   * @returns {Promise<Array>} Array of user's summaries
   */
  const fetchAllSummaries = async () => {
    try {
      const summariesData = await services.summaries.fetchAllSummaries();

      // Ensure we're removing any duplicates before setting state
      const uniqueSummaries = removeDuplicates(summariesData, "id");
      if (uniqueSummaries.length !== summariesData.length) {
        console.warn(
          `Removed ${
            summariesData.length - uniqueSummaries.length
          } duplicate summaries in useResources hook`
        );
      }

      setSummaries(uniqueSummaries);
      return uniqueSummaries;
    } catch (error) {
      console.error("fetchAllSummaries error:", error);
      setSummaries([]);
      return [];
    }
  };

  /**
   * Creates a new summary from an uploaded document
   * 
   * @param {string} uploadId - ID of the upload to create the summary from
   * @param {string} userMessage - User message or prompt for the summary
   * @param {string|null} folderID - Optional folder ID to assign the summary to
   * @returns {Promise<Object>} The created summary object
   * @throws {Error} If creation fails
   */
  const createSummary = async (uploadId, userMessage, folderID) => {
    try {
      const newSummary = await services.summaries.createSummary(
        uploadId,
        userMessage,
        folderID
      );

      // Check if a summary with this ID already exists in the state
      setSummaries((prev) => {
        if (prev.some((s) => s.id === newSummary.id)) {
          console.warn(
            `Summary with ID ${newSummary.id} already exists in state, not adding duplicate`
          );
          return prev;
        }
        return [...prev, newSummary];
      });

      return newSummary;
    } catch (error) {
      console.error("createSummary error:", error);
      throw error;
    }
  };

  /**
   * Deletes a summary
   * Navigates away if the user is currently viewing the deleted summary
   * 
   * @param {string} summaryId - ID of the summary to delete
   * @returns {Promise<void>}
   */
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

  /**
   * Renames an existing summary
   * 
   * @param {string} summaryId - ID of the summary to rename
   * @param {string} newName - New name for the summary
   * @returns {Promise<void>}
   */
  const renameSummary = async (summaryId, newName) => {
    try {
      const success = await services.summaries.renameSummary(
        summaryId,
        newName
      );
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

  /**
   * Assigns a summary to a folder
   * 
   * @param {string} summaryId - ID of the summary to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise<void>}
   * @throws {Error} If assignment fails
   */
  const assignSummaryToFolder = async (summaryId, folderID) => {
    try {
      // Call the API to update the folder
      await services.summaries.assignSummaryToFolder(summaryId, folderID);

      // Update the local state immediately to show change in UI
      setSummaries((prev) =>
        prev.map((summary) =>
          summary.id === summaryId ? { ...summary, folderID } : summary
        )
      );

      // Reload all summaries to ensure data consistency
      await fetchAllSummaries();
    } catch (error) {
      console.error("assignSummaryToFolder error:", error);
      throw error;
    }
  };

  /**
   * Fetches all summaries in a specific folder
   * 
   * @param {string} folderID - ID of the folder to fetch summaries from
   * @returns {Promise<Array>} Summaries in the specified folder
   */
  const fetchSummariesByFolder = async (folderID) => {
    try {
      const summaries = await services.summaries.fetchSummariesByFolder(
        folderID
      );

      // Update the summaries state with the returned data
      if (Array.isArray(summaries)) {
        setSummaries(summaries);
      }

      return summaries;
    } catch (error) {
      console.error("fetchSummariesByFolder error:", error);
      return [];
    }
  };

  // ------------------- AI CHATS -------------------
  /**
   * Fetches all AI chats for the current user
   * Removes any duplicate chats based on ID
   * 
   * @returns {Promise<Array>} Array of user's AI chats
   */
  const fetchAllAiChats = async () => {
    try {
      const chats = await services.chats.fetchAllAiChats();

      // Ensure we're removing any duplicates before setting state
      const uniqueChats = removeDuplicates(chats, "id");
      if (uniqueChats.length !== chats.length) {
        console.warn(
          `Removed ${
            chats.length - uniqueChats.length
          } duplicate chats in useResources hook`
        );
      }

      setAiChats(uniqueChats);
      return uniqueChats;
    } catch (error) {
      console.error("fetchAllAiChats error:", error);
      setAiChats([]);
      return [];
    }
  };

  /**
   * Creates a new AI chat from an uploaded document
   * 
   * @param {string} uploadId - ID of the upload to create the chat from
   * @param {string} userMessage - Initial user message for the chat
   * @param {string|null} folderID - Optional folder ID to assign the chat to
   * @returns {Promise<Object>} The created chat object
   * @throws {Error} If creation fails
   */
  const createChat = async (uploadId, userMessage, folderID) => {
    try {
      const newChat = await services.chats.createChat(
        uploadId,
        userMessage,
        folderID
      );

      // Check if a chat with this ID already exists in the state
      setAiChats((prev) => {
        if (prev.some((c) => c.id === newChat.id)) {
          console.warn(
            `Chat with ID ${newChat.id} already exists in state, not adding duplicate`
          );
          return prev;
        }
        return [...prev, newChat];
      });

      return newChat;
    } catch (error) {
      console.error("createChat error:", error);
      throw error;
    }
  };

  /**
   * Deletes an AI chat
   * Navigates away if the user is currently viewing the deleted chat
   * 
   * @param {string} chatId - ID of the chat to delete
   * @returns {Promise<void>}
   */
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

  /**
   * Renames an existing AI chat
   * 
   * @param {string} chatId - ID of the chat to rename
   * @param {string} newName - New name for the chat
   * @returns {Promise<void>}
   */
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

  /**
   * Assigns an AI chat to a folder
   * 
   * @param {string} chatId - ID of the chat to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise<void>}
   * @throws {Error} If assignment fails
   */
  const assignAiChatToFolder = async (chatId, folderID) => {
    try {
      // Call the API to update the folder
      await services.chats.assignAiChatToFolder(chatId, folderID);

      // Update the local state immediately to show change in UI
      setAiChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, folderID } : chat))
      );

      // Reload all chats to ensure data consistency
      await fetchAllAiChats();
    } catch (error) {
      console.error("assignAiChatToFolder error:", error);
      throw error;
    }
  };

  /**
   * Fetches all AI chats in a specific folder
   * 
   * @param {string} folderID - ID of the folder to fetch chats from
   * @returns {Promise<Array>} AI chats in the specified folder
   */
  const fetchAiChatsByFolder = async (folderID) => {
    try {
      const chats = await services.chats.fetchAiChatsByFolder(folderID);

      // Update the aiChats state with the returned data
      if (Array.isArray(chats)) {
        setAiChats(chats);
      }

      return chats;
    } catch (error) {
      console.error("fetchAiChatsByFolder error:", error);
      return [];
    }
  };

  /**
   * Loads all resources for the current user
   * Includes uploads, folders, quizzes, summaries, and AI chats
   * Handles errors for each resource type independently
   * 
   * @returns {Promise<Object>} Object containing all loaded resource types
   */
  const loadAllResources = async () => {
    console.log('loadAllResources called, starting to fetch all resources');
    try {
      // Execute each fetch individually to better track errors
      let uploads = [];
      try {
        uploads = await fetchUploads() || [];
        console.log('Uploads loaded:', uploads.length);
      } catch (uploadErr) {
        console.error('Error fetching uploads:', uploadErr);
      }
      
      let folders = [];
      try {
        folders = await fetchFolders() || [];
        console.log('Folders loaded:', folders.length);
      } catch (folderErr) {
        console.error('Error fetching folders:', folderErr);
      }
      
      let quizzes = [];
      try {
        quizzes = await fetchAllQuizzes() || [];
        console.log('Quizzes loaded:', quizzes.length);
      } catch (quizErr) {
        console.error('Error fetching quizzes:', quizErr);
      }
      
      let summaries = [];
      try {
        summaries = await fetchAllSummaries() || [];
        console.log('Summaries loaded:', summaries.length);
      } catch (summaryErr) {
        console.error('Error fetching summaries:', summaryErr);
      }
      
      let chats = [];
      try {
        chats = await fetchAllAiChats() || [];
        console.log('Chats loaded:', chats.length);
      } catch (chatErr) {
        console.error('Error fetching chats:', chatErr);
      }
      
      return {
        uploads,
        folders,
        quizzes,
        summaries,
        chats
      };
    } catch (error) {
      console.error('Error in loadAllResources:', error);
      // Don't throw here, just return what we have
      return {
        uploads: [],
        folders: [],
        quizzes: [],
        summaries: [],
        chats: []
      };
    }
  };

  /**
   * Helper function to remove duplicate items from an array based on a key
   * 
   * @param {Array} array - Array to remove duplicates from
   * @param {string} key - Object key to use for uniqueness check
   * @returns {Array} Array with duplicates removed
   */
  const removeDuplicates = (array, key) => {
    const uniqueItems = [];
    const seenKeys = new Set();

    for (const item of array) {
      if (item && item[key] && !seenKeys.has(item[key])) {
        uniqueItems.push(item);
        seenKeys.add(item[key]);
      }
    }

    return uniqueItems;
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
    deleteFolder,

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
