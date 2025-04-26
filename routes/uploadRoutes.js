const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const uploadsController = require("../controllers/uploadsController");
const authMiddleware = require("../middleware/authMiddleware");

// @route   GET /api/upload
// @desc    Get all uploads for the current user
// @access  Private
router.get("/", authMiddleware, uploadsController.getAllUploads);

// @route   POST /api/upload
// @desc    Upload a document and extract text
// @access  Private
router.post("/", authMiddleware, uploadController.uploadFile);

// @route   DELETE /api/upload/:id
// @desc    Delete uploaded file by ID or filename
// @access  Private
router.delete("/:filename", authMiddleware, uploadController.deleteFile);

// @route   GET /api/upload/:id
// @desc    Get a specific upload by ID
// @access  Private
router.get("/:id", authMiddleware, uploadsController.getUploadById);

module.exports = router;
