const express = require("express");
const router = express.Router();
const transcriptController = require("../controllers/transcriptController");

// @route   GET /api/transcript-public
// @desc    Fetch YouTube transcript
// @access  Public
router.get("/", transcriptController.fetchTranscript);

module.exports = router;
