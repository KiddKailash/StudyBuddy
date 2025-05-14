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

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Define routes

// @route   GET /api/flashcards
// @desc    Get all flashcard sessions for the logged-in user
// @access  Private
router.get("/", getAllFlashcards);

// @route   POST /api/flashcards
// @desc    Create a new flashcard session
// @access  Private
router.post("/", createFlashcardSession);

// @route   GET /api/flashcards/:id
// @desc    Get a single flashcard session by ID
// @access  Private
router.get("/:id", getFlashcardSessionById);

// @route   DELETE /api/flashcards/:id
// @desc    Delete a flashcard session by ID
// @access  Private
router.delete("/:id", deleteFlashcardSession);

// @route   PUT /api/flashcards/:id/name
// @desc    Update the name of a flashcard session
// @access  Private
router.put("/:id/name", updateFlashcardSessionName);

// @route   PUT /api/flashcards/:id/add-flashcards
// @desc    Add flashcards to an existing session
// @access  Private
router.put("/:id/add-flashcards", addFlashcardsToSession);

// @route   POST /api/flashcards/:id/generate-additional-flashcards
// @desc    Generate additional flashcards for an existing session
// @access  Private
router.post("/:id/generate-additional-flashcards", generateAdditionalFlashcards);

/**
 * 9) Assign a folder to a flashcard session
 *    PUT /api/flashcards/:id/assign-folder
 */
router.put("/:id/assign-folder", assignFolderToSession);

/**
 * 10) Get flashcard sessions by FolderID
 *     GET /api/flashcards/folder/:id
 */
router.get("/folder/:folderID", getFlashcardsByFolderID);

/**
 * 11) Generate flashcards from transcript text
 *     POST /api/flashcards/generate-from-transcript
 */
router.post("/generate-from-transcript", generateFlashcardsFromTranscript);

module.exports = router;
