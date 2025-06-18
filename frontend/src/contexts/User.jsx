/**
 * User.jsx
 * 
 * This file provides a comprehensive user context that manages all user-related data and operations.
 * It handles authentication, flashcards, resources, and user account information.
 * The context organizes resources by folders and provides wrapped functions for various operations
 * that maintain data consistency across the application.
 */

import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuthentication, useFlashcards, useResources, useUserAccount } from "../services/hooks/_HOOK_EXPORTS";

// Create the user context
export const UserContext = createContext();

/**
 * UserProvider component that manages user state and provides context
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to be wrapped with user context
 */
export const UserProvider = ({ children }) => {
  // Initialize custom hooks for different services
  const auth = useAuthentication();
  const flashcards = useFlashcards();
  const resources = useResources();
  const userAccount = useUserAccount();
  
  // Global loading state for data fetching operations
  const [dataLoading, setDataLoading] = useState(false);
  
  // State for organizing resources by folder
  const [resourcesByFolder, setResourcesByFolder] = useState({});
  
  /**
   * Organizes all resources (flashcards, quizzes, summaries, chats) by their respective folders
   * Creates a structured data object for quick access to resources within each folder
   */
  const organizeResourcesByFolder = () => {
    const newResourcesByFolder = {};
    
    // Initialize 'null' folder for resources without a folder
    newResourcesByFolder["null"] = {
      flashcards: flashcards.flashcardSessions.filter(s => !s.folderID),
      quizzes: resources.multipleChoiceQuizzes.filter(q => !q.folderID),
      summaries: resources.summaries.filter(s => !s.folderID),
      chats: resources.aiChats.filter(c => !c.folderID),
      lastUpdated: new Date().getTime()
    };
    
    // Organize resources by their respective folders
    resources.folders.forEach(folder => {
      newResourcesByFolder[folder.id] = {
        flashcards: flashcards.flashcardSessions.filter(s => s.folderID === folder.id),
        quizzes: resources.multipleChoiceQuizzes.filter(q => q.folderID === folder.id),
        summaries: resources.summaries.filter(s => s.folderID === folder.id),
        chats: resources.aiChats.filter(c => c.folderID === folder.id),
        lastUpdated: new Date().getTime()
      };
    });
    
    setResourcesByFolder(newResourcesByFolder);
  };
  
  /**
   * Gets resources for a specific folder
   * @param {string} folderId - ID of the folder to get resources for
   * @returns {Object} Object containing arrays of resources for the folder
   */
  const getResourcesByFolder = (folderId) => {
    const normalizedId = folderId === "null" || folderId === undefined ? "null" : folderId;
    return resourcesByFolder[normalizedId] || {
      flashcards: [],
      quizzes: [],
      summaries: [],
      chats: [],
      lastUpdated: new Date().getTime()
    };
  };
  
  // Wrapped functions for flashcard operations
  /**
   * Deletes a flashcard session and updates the resource organization
   * @param {string} sessionId - ID of the session to delete
   * @returns {Promise} Result of the delete operation
   */
  const wrappedDeleteFlashcardSession = async (sessionId) => {
    const result = await flashcards.deleteFlashcardSession(sessionId);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Updates the name of a flashcard session
   * @param {string} sessionId - ID of the session to rename
   * @param {string} newName - New name for the session
   * @returns {Promise} Result of the rename operation
   */
  const wrappedUpdateFlashcardSessionName = async (sessionId, newName) => {
    const result = await flashcards.updateFlashcardSessionName(sessionId, newName);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Assigns a flashcard session to a folder
   * @param {string} sessionId - ID of the session to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise} Result of the assign operation
   */
  const wrappedAssignSessionToFolder = async (sessionId, folderID) => {
    const result = await flashcards.assignSessionToFolder(sessionId, folderID);
    organizeResourcesByFolder();
    return result;
  };
  
  // Wrapped functions for quiz operations
  /**
   * Renames a quiz and updates resource organization
   * @param {string} quizId - ID of the quiz to rename
   * @param {string} newName - New name for the quiz
   * @returns {Promise} Result of the rename operation
   */
  const wrappedRenameQuiz = async (quizId, newName) => {
    const result = await resources.renameQuiz(quizId, newName);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Deletes a quiz and updates resource organization
   * @param {string} quizId - ID of the quiz to delete
   * @returns {Promise} Result of the delete operation
   */
  const wrappedDeleteQuiz = async (quizId) => {
    const result = await resources.deleteQuiz(quizId);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Assigns a quiz to a folder
   * @param {string} quizId - ID of the quiz to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise} Result of the assign operation
   */
  const wrappedAssignQuizToFolder = async (quizId, folderID) => {
    const result = await resources.assignQuizToFolder(quizId, folderID);
    organizeResourcesByFolder();
    return result;
  };
  
  // Wrapped functions for summary operations
  /**
   * Renames a summary and updates resource organization
   * @param {string} summaryId - ID of the summary to rename
   * @param {string} newName - New name for the summary
   * @returns {Promise} Result of the rename operation
   */
  const wrappedRenameSummary = async (summaryId, newName) => {
    const result = await resources.renameSummary(summaryId, newName);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Deletes a summary and updates resource organization
   * @param {string} summaryId - ID of the summary to delete
   * @returns {Promise} Result of the delete operation
   */
  const wrappedDeleteSummary = async (summaryId) => {
    const result = await resources.deleteSummary(summaryId);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Assigns a summary to a folder
   * @param {string} summaryId - ID of the summary to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise} Result of the assign operation
   */
  const wrappedAssignSummaryToFolder = async (summaryId, folderID) => {
    const result = await resources.assignSummaryToFolder(summaryId, folderID);
    organizeResourcesByFolder();
    return result;
  };
  
  // Wrapped functions for AI chat operations
  /**
   * Renames an AI chat and updates resource organization
   * @param {string} chatId - ID of the chat to rename
   * @param {string} newName - New name for the chat
   * @returns {Promise} Result of the rename operation
   */
  const wrappedRenameAiChat = async (chatId, newName) => {
    const result = await resources.renameAiChat(chatId, newName);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Deletes an AI chat and updates resource organization
   * @param {string} chatId - ID of the chat to delete
   * @returns {Promise} Result of the delete operation
   */
  const wrappedDeleteAiChat = async (chatId) => {
    const result = await resources.deleteAiChat(chatId);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Assigns an AI chat to a folder
   * @param {string} chatId - ID of the chat to assign
   * @param {string} folderID - ID of the folder to assign to
   * @returns {Promise} Result of the assign operation
   */
  const wrappedAssignAiChatToFolder = async (chatId, folderID) => {
    const result = await resources.assignAiChatToFolder(chatId, folderID);
    organizeResourcesByFolder();
    return result;
  };
  
  // Wrapped functions for folder operations
  /**
   * Creates a folder and updates resource organization
   * @param {string} folderName - Name for the new folder
   * @returns {Promise} Result of the create operation
   */
  const wrappedCreateFolder = async (folderName) => {
    const result = await resources.createFolder(folderName);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Renames a folder and updates resource organization
   * @param {string} folderId - ID of the folder to rename
   * @param {string} newName - New name for the folder
   * @returns {Promise} Result of the rename operation
   */
  const wrappedRenameFolder = async (folderId, newName) => {
    const result = await resources.renameFolder(folderId, newName);
    organizeResourcesByFolder();
    return result;
  };
  
  /**
   * Deletes a folder and updates resource organization
   * @param {string} folderId - ID of the folder to delete
   * @returns {Promise} Result of the delete operation
   */
  const wrappedDeleteFolder = async (folderId) => {
    const result = await resources.deleteFolder(folderId);
    organizeResourcesByFolder();
    return result;
  };
  
  // Initialize user data on component mount
  useEffect(() => {
    flashcards.loadLocalSessions();
    auth.fetchCurrentUser();
    //eslint-disable-next-line
  }, []);

  // Load all resources when user is authenticated
  useEffect(() => {
    if (auth.isLoggedIn && auth.user) {
      resources.loadAllResources();
    }
    //eslint-disable-next-line
  }, [auth.isLoggedIn, auth.user]);
  
  // Organize resources whenever they change
  useEffect(() => {
    organizeResourcesByFolder();
  }, [
    flashcards.flashcardSessions,
    resources.multipleChoiceQuizzes,
    resources.summaries,
    resources.aiChats,
    resources.folders
  ]);

  // Return the context provider with all necessary values
  return (
    <UserContext.Provider
      value={{
        // Authentication values
        user: auth.user,
        setUser: auth.setUser,
        token: auth.token,
        isLoggedIn: auth.isLoggedIn,
        setIsLoggedIn: auth.setIsLoggedIn,
        authLoading: auth.authLoading,
        resetAuth: auth.resetAuth,
        logout: auth.logout,
        fetchCurrentUser: auth.fetchCurrentUser,
        loginUser: auth.loginUser,
        registerUser: auth.registerUser,
        googleLoginUser: auth.googleLoginUser,
        
        // Flashcards
        flashcardSessions: flashcards.flashcardSessions,
        deleteFlashcardSession: wrappedDeleteFlashcardSession,
        updateFlashcardSessionName: wrappedUpdateFlashcardSessionName,
        assignSessionToFolder: wrappedAssignSessionToFolder,
        createFlashcardsFromUpload: flashcards.createFlashcardsFromUpload,
        setFlashcardSessions: flashcards.setFlashcardSessions,
        
        // Resources
        folders: resources.folders,
        multipleChoiceQuizzes: resources.multipleChoiceQuizzes,
        summaries: resources.summaries,
        aiChats: resources.aiChats,
        
        // Resource state setters
        setMultipleChoiceQuizzes: resources.setMultipleChoiceQuizzes,
        setSummaries: resources.setSummaries,
        setAiChats: resources.setAiChats,
        
        // Upload operations
        uploads: resources.uploads,
        fetchUploads: resources.fetchUploads,
        uploadDocumentTranscript: resources.uploadDocumentTranscript,
        createUploadFromText: resources.createUploadFromText,
        getWebsiteTranscript: resources.getWebsiteTranscript,
        deleteUpload: resources.deleteUpload,
        
        // Folder operations
        fetchFolders: resources.fetchFolders,
        createFolder: wrappedCreateFolder,
        renameFolder: wrappedRenameFolder,
        deleteFolder: wrappedDeleteFolder,
        
        // Quiz operations
        createQuiz: resources.createQuiz,
        renameQuiz: wrappedRenameQuiz,
        deleteQuiz: wrappedDeleteQuiz,
        assignQuizToFolder: wrappedAssignQuizToFolder,
        
        // Summary operations
        createSummary: resources.createSummary,
        renameSummary: wrappedRenameSummary,
        deleteSummary: wrappedDeleteSummary,
        assignSummaryToFolder: wrappedAssignSummaryToFolder,
        
        // AI Chat operations
        createChat: resources.createChat,
        renameAiChat: wrappedRenameAiChat,
        deleteAiChat: wrappedDeleteAiChat,
        assignAiChatToFolder: wrappedAssignAiChatToFolder,
        
        // Resource loading
        loadAllResources: resources.loadAllResources,
        
        // Resource organization
        resourcesByFolder,
        organizeResourcesByFolder,
        getResourcesByFolder,
        
        // User account
        updateAccountInfo: userAccount.updateAccountInfo,
        changePassword: userAccount.changePassword,
        requestFeature: userAccount.requestFeature,
        
        // Global loading state
        dataLoading
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default UserContext;
