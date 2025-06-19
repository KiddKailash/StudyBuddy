/**
 * Transcript Routes Module
 * 
 * Defines Express.js routes for YouTube transcript extraction functionality.
 * Provides endpoints for fetching and processing YouTube video transcripts.
 * All routes require JWT authentication for user-specific transcript management.
 */
const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   GET /api/transcript
 * @desc    Fetch YouTube transcript from video URL
 * @access  Private (JWT required)
 * @query   {url} - YouTube video URL
 * @returns {transcript} - Cleaned transcript text
 */
router.get("/", authMiddleware, transcriptController.fetchTranscript);

module.exports = router;
