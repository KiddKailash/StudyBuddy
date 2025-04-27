import React, { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAuthentication, useFlashcards, useResources, useUserAccount } from "../services/hooks/_HOOK_EXPORTS";

//eslint-disable-next-line
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Use custom hooks
  const auth = useAuthentication();
  const flashcards = useFlashcards();
  const resources = useResources();
  const userAccount = useUserAccount();
  
  // Global loading state for data fetching
  const [dataLoading, setDataLoading] = useState(false);
  
  // All resources organized by folder for quick access
  const [resourcesByFolder, setResourcesByFolder] = useState({});
  
  // Initialize or update the resourcesByFolder data structure
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
    
    // Initialize 'null' folder for unfoldered resources
    newResourcesByFolder["null"] = {
      flashcards: flashcards.flashcardSessions.filter(s => !s.folderID),
      quizzes: resources.multipleChoiceQuizzes.filter(q => !q.folderID),
      summaries: resources.summaries.filter(s => !s.folderID),
      chats: resources.aiChats.filter(c => !c.folderID),
      lastUpdated: new Date().getTime()
    };
    
    // Organize resources by folder
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
  
  // Operations that require updating the resourcesByFolder
  const wrappedDeleteFlashcardSession = async (sessionId) => {
    // Call original function
    const result = await flashcards.deleteFlashcardSession(sessionId);
    
    // Update the organization of resources once the main state is updated
    organizeResourcesByFolder();
    
    return result;
  };
  
  const wrappedUpdateFlashcardSessionName = async (sessionId, newName) => {
    // Call original function
    const result = await flashcards.updateFlashcardSessionName(sessionId, newName);
    
    // No need to reorganize since folder structure doesn't change
    return result;
  };
  
  const wrappedCreateFlashcardsFromUpload = async (uploadId, folderID) => {
    // Call original function
    const newFlashcardSession = await flashcards.createFlashcardsFromUpload(uploadId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return newFlashcardSession;
  };
  
  const wrappedAssignSessionToFolder = async (sessionId, folderID) => {
    // Call original function
    const result = await flashcards.assignSessionToFolder(sessionId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  // Quizzes
  const wrappedDeleteQuiz = async (quizId) => {
    // Call original function
    const result = await resources.deleteQuiz(quizId);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  const wrappedRenameQuiz = async (quizId, newName) => {
    // Call original function
    const result = await resources.renameQuiz(quizId, newName);
    
    // No need to reorganize since folder structure doesn't change
    return result;
  };
  
  const wrappedCreateQuiz = async (uploadId, folderID) => {
    // Call original function
    const newQuiz = await resources.createQuiz(uploadId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return newQuiz;
  };
  
  const wrappedAssignQuizToFolder = async (quizId, folderID) => {
    // Call original function
    const result = await resources.assignQuizToFolder(quizId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  // Similar wrappers for Summaries and AI Chats
  // Summaries
  const wrappedDeleteSummary = async (summaryId) => {
    // Call original function
    const result = await resources.deleteSummary(summaryId);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  const wrappedRenameSummary = async (summaryId, newName) => {
    // Call original function
    const result = await resources.renameSummary(summaryId, newName);
    
    // No need to reorganize since folder structure doesn't change
    return result;
  };
  
  const wrappedCreateSummary = async (uploadId, folderID) => {
    // Call original function
    const newSummary = await resources.createSummary(uploadId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return newSummary;
  };
  
  const wrappedAssignSummaryToFolder = async (summaryId, folderID) => {
    // Call original function
    const result = await resources.assignSummaryToFolder(summaryId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  // AI Chats
  const wrappedDeleteAiChat = async (chatId) => {
    // Call original function
    const result = await resources.deleteAiChat(chatId);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  const wrappedRenameAiChat = async (chatId, newName) => {
    // Call original function
    const result = await resources.renameAiChat(chatId, newName);
    
    // No need to reorganize since folder structure doesn't change
    return result;
  };
  
  const wrappedCreateChat = async (uploadId, folderID) => {
    // Call original function
    const newChat = await resources.createChat(uploadId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return newChat;
  };
  
  const wrappedAssignAiChatToFolder = async (chatId, folderID) => {
    // Call original function
    const result = await resources.assignAiChatToFolder(chatId, folderID);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  // Folder wrappers
  const wrappedCreateFolder = async (folderName) => {
    // Call original function
    const newFolder = await resources.createFolder(folderName);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return newFolder;
  };
  
  const wrappedRenameFolder = async (folderId, newName) => {
    // Call original function
    const result = await resources.renameFolder(folderId, newName);
    
    // No need to reorganize since folder structure doesn't change
    return result;
  };
  
  const wrappedDeleteFolder = async (folderId) => {
    // Call original function
    const result = await resources.deleteFolder(folderId);
    
    // Update the organization of resources
    organizeResourcesByFolder();
    
    return result;
  };
  
  // On mount: restore ephemeral flashcard sessions, then fetch user
  useEffect(() => {
    flashcards.loadLocalSessions();
    auth.fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load all resources when user logs in
  useEffect(() => {
    if (auth.user) {
      // Load all resources at once
      const loadAllData = async () => {
        try {
          // Set a loading state to indicate data is being fetched
          setDataLoading(true);
          console.log('Starting to load all resources');
          
          // First, make sure we have the auth token from local storage
          const userToken = auth.token;
          console.log('User token available:', !!userToken);
          
          // Load all data in parallel with explicit error handling for each request
          const results = await Promise.allSettled([
            resources.loadAllResources().catch(e => {
              console.error('Error loading all resources:', e);
              return null;
            }),
            flashcards.loadFlashcardSessions().catch(e => {
              console.error('Error loading flashcard sessions:', e);
              return null;
            }),
            resources.fetchFolders().catch(e => {
              console.error('Error loading folders:', e);
              return null;
            })
          ]);
          
          // Log results of each promise to help diagnose issues
          console.log('Resource loading results:', 
            results.map((r, i) => {
              const apis = ['loadAllResources', 'loadFlashcardSessions', 'fetchFolders'];
              return `${apis[i]}: ${r.status}`;
            })
          );
          
          console.log('All resources loaded successfully:',
                     {flashcards: flashcards.flashcardSessions.length,
                      quizzes: resources.multipleChoiceQuizzes.length,
                      summaries: resources.summaries.length,
                      chats: resources.aiChats.length,
                      folders: resources.folders.length});
          
          // Organize resources by folder for quick access even if some failed
          organizeResourcesByFolder();
          
          setDataLoading(false);
        } catch (error) {
          console.error('Error loading resources:', error);
          setDataLoading(false);
        }
      };
      
      loadAllData();
    } else {
      resources.resetResources();
      // Reset resources by folder
      setResourcesByFolder({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  // Reorganize resources whenever the main data arrays change
  useEffect(() => {
    if (auth.isLoggedIn && !dataLoading) {
      // Only reorganize if we have data to work with (prevents organizing empty arrays)
      if (flashcards.flashcardSessions.length > 0 || 
          resources.multipleChoiceQuizzes.length > 0 ||
          resources.summaries.length > 0 ||
          resources.aiChats.length > 0) {
        organizeResourcesByFolder();
      }
    }
  }, [
    auth.isLoggedIn,
    dataLoading,
    flashcards.flashcardSessions,
    resources.multipleChoiceQuizzes,
    resources.summaries,
    resources.aiChats,
    resources.folders
  ]);

  // Provide unified reset for the entire context
  const resetUserContext = () => {
    auth.resetAuth();
    resources.resetResources();
    setResourcesByFolder({});
    setDataLoading(false);
  };

  // Get resources for a specific folder (from the already loaded and organized data)
  const getResourcesByFolder = (folderID) => {
    if (!folderID) folderID = "null";
    return resourcesByFolder[folderID] || {
      flashcards: [],
      quizzes: [],
      summaries: [],
      chats: []
    };
  };

  // Combine and provide all values from hooks
  return (
    <UserContext.Provider
      value={{
        // Auth
        user: auth.user,
        setUser: auth.setUser,
        token: auth.token,
        isLoggedIn: auth.isLoggedIn,
        setIsLoggedIn: auth.setIsLoggedIn,
        authLoading: auth.authLoading,
        dataLoading,
        resetUserContext,
        logout: auth.logout,
        loginUser: auth.loginUser,
        registerUser: auth.registerUser,
        googleLoginUser: auth.googleLoginUser,

        // Folder Resources Organization
        resourcesByFolder,
        getResourcesByFolder,

        // Flashcards - With wrap function to update resourcesByFolder
        flashcardSessions: flashcards.flashcardSessions,
        setFlashcardSessions: flashcards.setFlashcardSessions,
        loadingSessions: flashcards.loadingSessions,
        flashcardError: flashcards.flashcardError,
        setFlashcardError: flashcards.setFlashcardError,
        deleteFlashcardSession: wrappedDeleteFlashcardSession,
        updateFlashcardSessionName: wrappedUpdateFlashcardSessionName,
        fetchFlashcardSession: flashcards.fetchFlashcardSession,
        generateAdditionalFlashcards: flashcards.generateAdditionalFlashcards,
        createFlashcards: flashcards.createFlashcards,
        createFlashcardsFromUpload: wrappedCreateFlashcardsFromUpload,
        localSessions: flashcards.localSessions,
        setLocalSessions: flashcards.setLocalSessions,
        createLocalSession: flashcards.createLocalSession,
        deleteLocalSession: flashcards.deleteLocalSession,
        updateLocalSession: flashcards.updateLocalSession,
        MAX_EPHEMERAL_SESSIONS: flashcards.MAX_EPHEMERAL_SESSIONS,
        fetchFlashcardsByFolder: flashcards.fetchFlashcardsByFolder,
        assignSessionToFolder: wrappedAssignSessionToFolder,
        generateFlashcardsFromTranscript: flashcards.generateFlashcardsFromTranscript,

        // Resources - Uploads
        uploads: resources.uploads,
        fetchUploads: resources.fetchUploads,
        uploadDocumentTranscript: resources.uploadDocumentTranscript,
        createUploadFromText: resources.createUploadFromText,
        getWebsiteTranscript: resources.getWebsiteTranscript,
        deleteUpload: resources.deleteUpload,

        // Resources - Folders
        folders: resources.folders,
        fetchFolders: resources.fetchFolders,
        createFolder: wrappedCreateFolder,
        renameFolder: wrappedRenameFolder,
        deleteFolder: wrappedDeleteFolder,

        // Resources - Quizzes - With wrap function to update resourcesByFolder
        multipleChoiceQuizzes: resources.multipleChoiceQuizzes,
        setMultipleChoiceQuizzes: resources.setMultipleChoiceQuizzes,
        fetchAllQuizzes: resources.fetchAllQuizzes,
        createQuiz: wrappedCreateQuiz,
        renameQuiz: wrappedRenameQuiz,
        deleteQuiz: wrappedDeleteQuiz,
        assignQuizToFolder: wrappedAssignQuizToFolder,
        fetchQuizzesByFolder: resources.fetchQuizzesByFolder,

        // Resources - Summaries
        summaries: resources.summaries,
        setSummaries: resources.setSummaries,
        fetchAllSummaries: resources.fetchAllSummaries,
        createSummary: wrappedCreateSummary,
        deleteSummary: wrappedDeleteSummary,
        renameSummary: wrappedRenameSummary,
        assignSummaryToFolder: wrappedAssignSummaryToFolder,
        fetchSummariesByFolder: resources.fetchSummariesByFolder,

        // Resources - AI Chats
        aiChats: resources.aiChats,
        setAiChats: resources.setAiChats,
        fetchAllAiChats: resources.fetchAllAiChats,
        createChat: wrappedCreateChat,
        deleteAiChat: wrappedDeleteAiChat,
        renameAiChat: wrappedRenameAiChat,
        assignAiChatToFolder: wrappedAssignAiChatToFolder,
        fetchAiChatsByFolder: resources.fetchAiChatsByFolder,

        // User Account
        updateAccountInfo: userAccount.updateAccountInfo,
        changePassword: userAccount.changePassword,
        updatePreferences: userAccount.updatePreferences,
        cancelSubscription: userAccount.cancelSubscription,
        requestFeature: userAccount.requestFeature,
        accountUpdateLoading: userAccount.accountUpdateLoading,
        accountUpdateError: userAccount.accountUpdateError
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
