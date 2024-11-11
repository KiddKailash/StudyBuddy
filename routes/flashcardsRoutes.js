// routes/flashcardsRoutes.js
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

module.exports = router;
