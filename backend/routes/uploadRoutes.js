const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   POST /api/upload
// @desc    Upload a document and extract text
// @access  Private
router.post("/", authMiddleware, uploadController.uploadFile);

module.exports = router;
