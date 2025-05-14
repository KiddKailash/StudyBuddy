const express = require("express");
const router = express.Router();
const websiteTranscriptController = require("../controllers/websiteTranscriptController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route for scraping a website
router.get("/", authMiddleware, websiteTranscriptController.fetchWebsiteTranscript);

module.exports = router;
