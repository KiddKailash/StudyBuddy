/**
 * flashcardsPublicRoutes.js
 *
 * Defines the Express routes for ephemeral "free tier" flashcards.
 */

const express = require("express");
const router = express.Router();
const flashcardsController = require("../controllers/flashcardsController");

// @route   POST /api/flashcards-public
// @desc    Create a new ephemeral flashcard session
// @access  Public
router.post("/", flashcardsController.createEphemeralSession);

// @route   GET /api/flashcards-public/:id
// @desc    Get an ephemeral flashcard session by ID
// @access  Public
router.get("/:id", flashcardsController.getEphemeralSessionById);

// @route   DELETE /api/flashcards-public/:id
// @desc    Delete an ephemeral flashcard session
// @access  Public
router.delete("/:id", flashcardsController.deleteEphemeralSession);

module.exports = router;
