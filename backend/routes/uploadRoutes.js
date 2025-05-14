const express = require("express");
const router = express.Router();
const uploadsController = require("../controllers/uploadsController");
const authMiddleware = require("../middleware/authMiddleware");

// Middleware to extract folderID
const extractFolderID = (req, res, next) => {
  console.log("Request body for folderID extraction:", req.body);
  console.log("FormData fields:", req.body.folderID);
  
  if (req.body && req.body.folderID !== undefined) {
    // Convert "null" string to actual null
    req.folderID = req.body.folderID === "null" ? null : req.body.folderID;
    console.log("Extracted folderID from request:", req.folderID);
  } else {
    req.folderID = null;
    console.log("No folderID in request, using null");
  }
  next();
};

// @route   GET /api/upload
// @desc    Get all uploads for the current user
// @access  Private
router.get("/", authMiddleware, uploadsController.getAllUploads);

// @route   POST /api/upload
// @desc    Upload a document and extract text
// @access  Private
router.post("/", authMiddleware, extractFolderID, uploadsController.uploadFile);

// @route   DELETE /api/upload/:id
// @desc    Delete uploaded file by ID or filename
// @access  Private
router.delete("/:filename", authMiddleware, uploadsController.deleteFile);

// @route   GET /api/upload/:id
// @desc    Get a specific upload by ID
// @access  Private
router.get("/:id", authMiddleware, uploadsController.getUploadById);

module.exports = router;
