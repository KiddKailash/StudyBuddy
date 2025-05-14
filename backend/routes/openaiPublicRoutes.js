const express = require("express");
const router = express.Router();
const { generateFlashcardsPublic } = require("../controllers/openaiPublicController");

// @route   POST /api/openai/generate-flashcards-public
// @desc    Generate flashcards using OpenAI for free tier (no auth)
// @access  Public
router.post("/generate-flashcards-public", generateFlashcardsPublic);

module.exports = router;
