/**
 * Folders Routes Module
 */
const express = require("express");
const router = express.Router();
const foldersController = require("../controllers/foldersController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   POST /api/folders
 * @desc    Create a new folder for organizing user content
 * @access  Private (JWT required)
 * @body    {folderName} - Name for the new folder
 * @returns Created folder object with ID
 */
router.post("/", authMiddleware, foldersController.createFolder);

/**
 * @route   GET /api/folders
 * @desc    Retrieve all folders for the authenticated user
 * @access  Private (JWT required)
 * @returns Array of folder objects
 */
router.get("/", authMiddleware, foldersController.getFolders);

/**
 * @route   PUT /api/folders/:id/rename
 * @desc    Rename an existing folder
 * @access  Private (JWT required)
 * @param   {string} id - Folder ID to rename
 * @body    {newName} - New name for the folder
 */
router.put("/:id/rename", authMiddleware, foldersController.renameFolder);

/**
 * @route   DELETE /api/folders/:id
 * @desc    Delete a folder (content becomes unorganized)
 * @access  Private (JWT required)
 * @param   {string} id - Folder ID to delete
 */
router.delete("/:id", authMiddleware, foldersController.deleteFolder);

module.exports = router;
