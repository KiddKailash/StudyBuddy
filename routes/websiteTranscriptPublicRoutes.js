const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");

// Public route for scraping a website
router.get("/", transcriptController.getWebsiteTranscriptPublic);

module.exports = router;
