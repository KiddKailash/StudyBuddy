const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected route for scraping a website
router.get("/", authMiddleware, transcriptController.getWebsiteTranscript);

module.exports = router;
