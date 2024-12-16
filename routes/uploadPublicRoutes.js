const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

// @route   POST /api/upload-public
// @desc    Upload a document and extract text - no auth required
// @access  Public
router.post("/", uploadController.uploadFile);

module.exports = router;
