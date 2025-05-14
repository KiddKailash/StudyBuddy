/**
 * Hooks Index
 * 
 * This file acts as a central export point for all custom hooks in the application.
 * It allows importing hooks from a single location rather than individual files.
 * 
 * Example: import { useAuthentication, useFlashcards } from 'services/hooks';
 */

// Export all hooks
export * from './useAuthentication';
export * from './useFlashcards';
export * from './useResources';
export * from './useUserAccount'; 