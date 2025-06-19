/**
 * Transcript Public Routes Module
 * 
 * Defines Express.js routes for public YouTube transcript extraction functionality.
 * Provides endpoints for fetching YouTube video transcripts without requiring authentication.
 * This module handles public access to transcript services for demo and trial purposes.
 * 
 * Route Base: /api/transcript-public
 * Authentication: None required (public endpoints)
 */
const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");

/**
 * @route   GET /api/transcript-public
 * @desc    Fetch YouTube transcript from video URL (public access)
 * @access  Public
 * @query   {url} - YouTube video URL to extract transcript from
 * @returns {transcript} - Cleaned and formatted transcript text
 */
router.get("/", transcriptController.fetchTranscript);

module.exports = router;
