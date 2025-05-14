const express = require("express");
const router = express.Router();
const uploadsController = require("../controllers/uploadsController");

// @route   POST /api/upload-public
// @desc    Upload a file without authentication
// @access  Public
router.post("/", uploadsController.uploadFile);

module.exports = router;
