const express = require("express");
const router = express.Router();
const openaiController = require("../controllers/openaiController");

// @route   POST /api/openai/generate
// @desc    Generate flashcards using OpenAI for free tier (no auth)
// @access  Public
router.post("/generate", openaiController.generatePublicResponse);

module.exports = router;
