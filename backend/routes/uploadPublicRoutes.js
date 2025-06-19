/**
 * Upload Public Routes Module
 * 
 * Defines Express.js routes for public file upload functionality.
 * Provides endpoints for file uploads without requiring authentication.
 * This module handles public access to file upload services for demo and trial purposes.
 * 
 * Route Base: /api/upload-public
 * Authentication: None required (public endpoints)
 */
const express = require("express");
const router = express.Router();
const uploadsController = require("../controllers/uploadsController");

/**
 * @route   POST /api/upload-public
 * @desc    Upload a file without authentication
 * @access  Public
 * @body    {file} - Multipart form data containing the file
 * @returns {fileInfo} - Uploaded file information and processing status
 */
router.post("/", uploadsController.uploadFile);

module.exports = router;
