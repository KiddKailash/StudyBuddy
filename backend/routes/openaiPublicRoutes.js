/**
 * OpenAI Public Routes Module
 * 
 * Defines Express.js routes for public OpenAI integration functionality.
 * Provides endpoints for AI-powered content generation without requiring authentication.
 * This module handles public access to OpenAI services for demo and trial purposes.
 * 
 * Authentication: None required (public endpoints)
 */
const express = require("express");
const router = express.Router();
const openaiController = require("../controllers/openaiController");

/**
 * @route   POST /api/openai/generate
 * @desc    Generate flashcards using OpenAI for free tier (no auth)
 * @access  Public
 * @body    {text} - Input text to generate flashcards from
 * @returns {flashcards} - Generated flashcard array with questions and answers
 */
router.post("/generate", openaiController.generatePublicResponse);

module.exports = router;
