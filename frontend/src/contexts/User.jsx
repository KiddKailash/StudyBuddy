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
    console.log('Organizing resources by folder');
    console.log('Current resource counts:', {
      flashcards: flashcards.flashcardSessions.length,
      quizzes: resources.multipleChoiceQuizzes.length,
      summaries: resources.summaries.length,
      chats: resources.aiChats.length,
      folders: resources.folders.length
    });
    
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
    return await flashcards.updateFlashcardSessionName(sessionId, newName);
  };
  
  // Initialize user data on component mount
  useEffect(() => {
    flashcards.loadLocalSessions();
    auth.fetchCurrentUser();
    //eslint-disable-next-line
  }, []);

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
        
        // Resources
        folders: resources.folders,
        multipleChoiceQuizzes: resources.multipleChoiceQuizzes,
        summaries: resources.summaries,
        aiChats: resources.aiChats,
        
        // Resource organization
        resourcesByFolder,
        organizeResourcesByFolder,
        
        // User account
        updateAccountInfo: userAccount.updateAccountInfo,
        changePassword: userAccount.changePassword,
        
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
