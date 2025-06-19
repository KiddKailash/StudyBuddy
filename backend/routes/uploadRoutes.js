/**
 * Upload Routes Module
 * 
 * Defines Express.js routes for document upload and management functionality.
 * Provides endpoints for uploading files, retrieving uploads, and managing user documents.
 */
const express = require("express");
const router = express.Router();
const uploadsController = require("../controllers/uploadsController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Custom middleware to extract and process folderID from request body
 * 
 * Handles the conversion of "null" string to actual null value for folder organization.
 * Logs folder ID extraction for debugging purposes.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const extractFolderID = (req, res, next) => {
  // Log request body for debugging folder ID extraction
  console.log("Request body for folderID extraction:", req.body);
  console.log("FormData fields:", req.body.folderID);
  
  // Extract folderID from request body with null handling
  if (req.body && req.body.folderID !== undefined) {
    // Convert "null" string to actual null for database consistency
    req.folderID = req.body.folderID === "null" ? null : req.body.folderID;
    console.log("Extracted folderID from request:", req.folderID);
  } else {
    // Default to null if no folderID provided
    req.folderID = null;
    console.log("No folderID in request, using null");
  }
  next();
};

/**
 * @route   GET /api/uploads
 * @desc    Get all uploads for the current authenticated user
 * @access  Private (JWT required)
 * @returns Array of upload objects with metadata
 */
router.get("/", authMiddleware, uploadsController.getAllUploads);

/**
 * @route   POST /api/uploads
 * @desc    Upload a document and extract text content
 * @access  Private (JWT required)
 * @body    FormData with file and optional folderID
 * @returns Upload object with extracted transcript
 */
router.post("/", authMiddleware, extractFolderID, uploadsController.uploadFile);

/**
 * @route   DELETE /api/uploads/:filename
 * @desc    Delete uploaded file by filename
 * @access  Private (JWT required)
 * @param   {string} filename - Name of file to delete
 */
router.delete("/:filename", authMiddleware, uploadsController.deleteFile);

/**
 * @route   GET /api/uploads/:id
 * @desc    Get a specific upload by ID
 * @access  Private (JWT required)
 * @param   {string} id - Upload ID to retrieve
 * @returns Single upload object with transcript
 */
router.get("/:id", authMiddleware, uploadsController.getUploadById);

module.exports = router;
