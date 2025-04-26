import React, { createContext, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import services from "../services/index";
import { useAuthentication, useFlashcards, useResources, useUserAccount } from "../services/hooks";

//eslint-disable-next-line
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Use custom hooks
  const auth = useAuthentication();
  const flashcards = useFlashcards();
  const resources = useResources();
  const userAccount = useUserAccount();

  // On mount: restore ephemeral flashcard sessions, then fetch user
  useEffect(() => {
    flashcards.loadLocalSessions();
    auth.fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load all resources when user logs in
  useEffect(() => {
    if (auth.user) {
      resources.loadAllResources();
      flashcards.loadFlashcardSessions();
    } else {
      resources.resetResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  // Provide unified reset for the entire context
  const resetUserContext = () => {
    auth.resetAuth();
    resources.resetResources();
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
        resetUserContext,
        logout: auth.logout,
        loginUser: auth.loginUser,
        registerUser: auth.registerUser,
        googleLoginUser: auth.googleLoginUser,

        // Flashcards
        flashcardSessions: flashcards.flashcardSessions,
        setFlashcardSessions: flashcards.setFlashcardSessions,
        loadingSessions: flashcards.loadingSessions,
        flashcardError: flashcards.flashcardError,
        setFlashcardError: flashcards.setFlashcardError,
        deleteFlashcardSession: flashcards.deleteFlashcardSession,
        updateFlashcardSessionName: flashcards.updateFlashcardSessionName,
        fetchFlashcardSession: flashcards.fetchFlashcardSession,
        generateAdditionalFlashcards: flashcards.generateAdditionalFlashcards,
        createFlashcards: flashcards.createFlashcards,
        createFlashcardsFromUpload: flashcards.createFlashcardsFromUpload,
        localSessions: flashcards.localSessions,
        setLocalSessions: flashcards.setLocalSessions,
        createLocalSession: flashcards.createLocalSession,
        deleteLocalSession: flashcards.deleteLocalSession,
        updateLocalSession: flashcards.updateLocalSession,
        MAX_EPHEMERAL_SESSIONS: flashcards.MAX_EPHEMERAL_SESSIONS,
        fetchFlashcardsByFolder: flashcards.fetchFlashcardsByFolder,
        assignSessionToFolder: flashcards.assignSessionToFolder,
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
        createFolder: resources.createFolder,
        renameFolder: resources.renameFolder,

        // Resources - Quizzes
        multipleChoiceQuizzes: resources.multipleChoiceQuizzes,
        setMultipleChoiceQuizzes: resources.setMultipleChoiceQuizzes,
        fetchAllQuizzes: resources.fetchAllQuizzes,
        createQuiz: resources.createQuiz,
        renameQuiz: resources.renameQuiz,
        deleteQuiz: resources.deleteQuiz,
        assignQuizToFolder: resources.assignQuizToFolder,
        fetchQuizzesByFolder: resources.fetchQuizzesByFolder,

        // Resources - Summaries
        summaries: resources.summaries,
        setSummaries: resources.setSummaries,
        fetchAllSummaries: resources.fetchAllSummaries,
        createSummary: resources.createSummary,
        deleteSummary: resources.deleteSummary,
        renameSummary: resources.renameSummary,
        assignSummaryToFolder: resources.assignSummaryToFolder,
        fetchSummariesByFolder: resources.fetchSummariesByFolder,

        // Resources - AI Chats
        aiChats: resources.aiChats,
        setAiChats: resources.setAiChats,
        fetchAllAiChats: resources.fetchAllAiChats,
        createChat: resources.createChat,
        deleteAiChat: resources.deleteAiChat,
        renameAiChat: resources.renameAiChat,
        assignAiChatToFolder: resources.assignAiChatToFolder,
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
