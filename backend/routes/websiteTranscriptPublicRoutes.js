/**
 * Website Transcript Public Routes Module
 * 
 * Defines Express.js routes for public website transcript extraction functionality.
 * Provides endpoints for scraping website content without requiring authentication.
 * This module handles public access to website transcript generation for demo/trial purposes.
 * 
 * Authentication: None required (public endpoints)
 */
const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");

/**
 * @route   GET /api/website-transcript-public
 * @desc    Scrape website content and generate transcript (public access)
 * @access  Public
 * @query   {url} - Target website URL to scrape
 * @returns {transcript} - Extracted and processed website content
 */
router.get("/", transcriptController.getWebsiteTranscriptPublic);

module.exports = router;
