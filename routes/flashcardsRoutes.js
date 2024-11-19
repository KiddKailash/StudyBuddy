const express = require('express');
const router = express.Router();
const flashcardsController = require('../controllers/flashcardsController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/flashcards
// @desc    Create a new flashcard session
// @access  Private
router.post('/', authMiddleware, flashcardsController.createFlashcardSession);

// @route   PUT /api/flashcards/:id
// @desc    Add flashcards to an existing session
// @access  Private
router.put('/:id', authMiddleware, flashcardsController.addFlashcardsToSession);

// @route   GET /api/flashcards
// @desc    Get all flashcard sessions for the logged-in user
// @access  Private
router.get('/', authMiddleware, flashcardsController.getUserFlashcards);

// @route   GET /api/flashcards/:id
// @desc    Get a single flashcard session by ID
// @access  Private
router.get('/:id', authMiddleware, flashcardsController.getFlashcardSessionById);

// @route   DELETE /api/flashcards/:id
// @desc    Delete a flashcard session by ID
// @access  Private
router.delete('/:id', authMiddleware, flashcardsController.deleteFlashcardSession);

// @route   PUT /api/flashcards/:id/name
// @desc    Update the name of a flashcard session
// @access  Private
router.put('/:id/name', authMiddleware, flashcardsController.updateFlashcardSessionName);

// @route   POST /api/flashcards/:id/generate
// @desc    Generate additional flashcards for a session
// @access  Private
router.post('/:id/generate', authMiddleware, flashcardsController.generateAdditionalFlashcards);

module.exports = router;
