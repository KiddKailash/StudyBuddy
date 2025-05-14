const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   GET /api/transcript
// @desc    Fetch YouTube transcript
// @access  Private
router.get("/", authMiddleware, transcriptController.fetchTranscript);

module.exports = router;
