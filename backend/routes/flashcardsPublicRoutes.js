/**
 * Public Flashcards Routes Module
 * 
 * Defines Express.js routes for ephemeral flashcard functionality (free tier).
 * Provides endpoints for creating and managing temporary flashcard sessions
 * without requiring user authentication. Uses in-memory storage for session data.
 */
const express = require("express");
const router = express.Router();
const flashcardsController = require("../controllers/flashcardsController");

/**
 * @route   POST /api/flashcards-public
 * @desc    Create a new ephemeral flashcard session (no authentication required)
 * @access  Public (no JWT required)
 * @body    {sessionName, studyCards, transcript}
 * @returns Created ephemeral session with UUID
 */
router.post("/", flashcardsController.createEphemeralSession);

/**
 * @route   GET /api/flashcards-public/:id
 * @desc    Get an ephemeral flashcard session by UUID
 * @access  Public (no JWT required)
 * @param   {string} id - Ephemeral session UUID
 * @returns Ephemeral session data or 404 if not found
 */
router.get("/:id", flashcardsController.getEphemeralSessionById);

/**
 * @route   DELETE /api/flashcards-public/:id
 * @desc    Delete an ephemeral flashcard session by UUID
 * @access  Public (no JWT required)
 * @param   {string} id - Ephemeral session UUID to delete
 * @returns Success/error response
 */
router.delete("/:id", flashcardsController.deleteEphemeralSession);

module.exports = router;
