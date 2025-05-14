/**
 * Service Module Index
 * 
 * This file serves as the central export point for all services in the application.
 * It provides both named exports for individual functions and a default export
 * that organizes all services into namespaced objects.
 * 
 * Import individual functions:
 *   import { loginUser, fetchCurrentUser } from './services';
 * 
 * Or import all services as a namespace:
 *   import services from './services';
 *   services.auth.loginUser(...);
 */

// Service exports
export * from './apiUtils';
export * from './authService';
export * from './flashcardService';
export * from './uploadService';
export * from './folderService';
export * from './quizService';
export * from './summaryService';
export * from './chatService';
export * from './userService';
export * from './localStorageService';
export * from './hooks/_HOOK_EXPORTS';

// Default exports
import apiUtils from './apiUtils';
import authService from './authService';
import flashcardService from './flashcardService';
import uploadService from './uploadService';
import folderService from './folderService';
import quizService from './quizService';
import summaryService from './summaryService';
import chatService from './chatService';
import userService from './userService';
import localStorageService from './localStorageService';
import * as hooks from './hooks/_HOOK_EXPORTS';

/**
 * Unified service object with namespaced services
 */
export default {
  api: apiUtils,
  auth: authService,
  flashcards: flashcardService,
  uploads: uploadService,
  folders: folderService,
  quizzes: quizService,
  summaries: summaryService,
  chats: chatService,
  user: userService,
  storage: localStorageService,
  hooks
}; 