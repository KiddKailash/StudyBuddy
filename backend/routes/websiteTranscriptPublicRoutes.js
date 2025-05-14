const express = require("express");
const router = express.Router();
const websiteTranscriptController = require("../controllers/websiteTranscriptController");

// Public route for scraping a website
router.get("/", websiteTranscriptController.fetchWebsiteTranscript);

module.exports = router;
