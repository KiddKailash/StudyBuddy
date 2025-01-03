const express = require('express');
const router = express.Router();
const openaiController = require('../controllers/openaiController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/openai/generate-flashcards
// @desc    Generate flashcards using OpenAI
// @access  Private
router.post('/generate-flashcards', authMiddleware, openaiController.generateFlashcards);

module.exports = router;
