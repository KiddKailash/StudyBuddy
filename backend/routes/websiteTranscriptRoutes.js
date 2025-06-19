/**
 * Website Transcript Routes Module
 * 
 * Defines Express.js routes for authenticated website transcript extraction functionality.
 * Provides endpoints for scraping website content with user authentication and tracking.
 * This module handles protected access to website transcript generation for registered users.
 * 
 * Authentication: All routes require valid JWT token
 */
const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   GET /api/website-transcript
 * @desc    Scrape website content and generate transcript (authenticated access)
 * @access  Private (JWT required)
 * @query   {url} - Target website URL to scrape
 * @returns {transcript} - Extracted and processed website content with user context
 */
router.get("/", authMiddleware, transcriptController.getWebsiteTranscript);

module.exports = router;
