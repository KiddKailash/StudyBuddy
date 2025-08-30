/**
 * Flashcards Routes Module
 * 
 * Defines Express.js routes for flashcard study session management.
 * Provides endpoints for creating, managing, and organizing flashcard sessions.
 * All routes require JWT authentication for user-specific flashcard management.
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllFlashcards,
  createFlashcardSession,
  getFlashcardSessionById,
  deleteFlashcardSession,
  updateFlashcardSessionName,
  addFlashcardsToSession,
  generateAdditionalFlashcards,
  assignFolderToSession,
  generateSessionFlashcards,
  getFlashcardsByFolderID,
  generateFlashcardsFromTranscript,
} = require("../controllers/flashcardsController");

// Apply authentication middleware to all routes in this module
router.use(authMiddleware);

/**
 * @route   GET /api/flashcards
 * @desc    Get all flashcard sessions for the authenticated user
 * @access  Private (JWT required)
 * @returns Array of flashcard session objects
 */
router.get("/", getAllFlashcards);

/**
 * @route   POST /api/flashcards
 * @desc    Create a new flashcard session
 * @access  Private (JWT required)
 * @body    {uploadId, folderID, sessionName, studyCards}
 * @returns Created flashcard session object
 */
router.post("/", createFlashcardSession);

/**
 * @route   GET /api/flashcards/:id
 * @desc    Get a single flashcard session by ID
 * @access  Private (JWT required)
 * @param   {string} id - Flashcard session ID
 * @returns Single flashcard session object
 */
router.get("/:id", getFlashcardSessionById);

/**
 * @route   DELETE /api/flashcards/:id
 * @desc    Delete a flashcard session by ID
 * @access  Private (JWT required)
 * @param   {string} id - Flashcard session ID to delete
 */
router.delete("/:id", deleteFlashcardSession);

/**
 * @route   PUT /api/flashcards/:id/name
 * @desc    Update the name of a flashcard session
 * @access  Private (JWT required)
 * @param   {string} id - Flashcard session ID
 * @body    {newName} - New name for the session (also accepts sessionName for backward compatibility)
 */
router.put("/:id/name", updateFlashcardSessionName);

/**
 * @route   PUT /api/flashcards/:id/add-flashcards
 * @desc    Add flashcards to an existing session
 * @access  Private (JWT required)
 * @param   {string} id - Flashcard session ID
 * @body    {studyCards} - Array of flashcard objects to add
 */
router.put("/:id/add-flashcards", addFlashcardsToSession);

/**
 * @route   POST /api/flashcards/:id/generate-additional-flashcards
 * @desc    Generate additional flashcards for an existing session (Premium feature)
 * @access  Private (JWT required + Premium account)
 * @param   {string} id - Flashcard session ID
 * @returns Newly generated flashcards array
 */
router.post("/:id/generate-additional-flashcards", generateAdditionalFlashcards);

/**
 * @route   PUT /api/flashcards/:id/assign-folder
 * @desc    Assign a flashcard session to a specific folder
 * @access  Private (JWT required)
 * @param   {string} id - Flashcard session ID
 * @body    {folderID} - Folder ID to assign
 */
router.put("/:id/assign-folder", assignFolderToSession);

/**
 * @route   GET /api/flashcards/folder/:folderID
 * @desc    Get flashcard sessions by folder ID
 * @access  Private (JWT required)
 * @param   {string} folderID - Folder ID (or "null" for unorganized)
 * @returns Array of flashcard sessions in the specified folder
 */
router.get("/folder/:folderID", getFlashcardsByFolderID);

/**
 * @route   POST /api/flashcards/generate-from-transcript
 * @desc    Generate flashcards from transcript text directly
 * @access  Private (JWT required)
 * @body    {transcript} - Text content to generate flashcards from
 * @returns Generated session name and flashcards array
 */
router.post("/generate-from-transcript", generateFlashcardsFromTranscript);

module.exports = router;
