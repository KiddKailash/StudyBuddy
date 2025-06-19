/**
 * Summary Routes Module
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSummary,
  getAllSummaries,
  getSummaryById,
  deleteSummary,
  renameSummary,
  getSummariesByFolderID,
  assignFolderToSummary,
  queryDocument,
} = require("../controllers/summaryController");

/**
 * @route   POST /api/summaries
 * @desc    Create a new AI-generated summary from a document
 * @access  Private (JWT required)
 * @body    {uploadId, userMessage, folderID}
 */
router.post("/", authMiddleware, createSummary);

/**
 * @route   GET /api/summaries
 * @desc    Retrieve all summaries for the authenticated user
 * @access  Private (JWT required)
 * @returns Array of summary objects
 */
router.get("/", authMiddleware, getAllSummaries);

/**
 * @route   GET /api/summaries/:id
 * @desc    Retrieve a specific summary by ID
 * @access  Private (JWT required)
 * @param   {string} id - Summary ID
 * @returns Single summary object
 */
router.get("/:id", authMiddleware, getSummaryById);

/**
 * @route   DELETE /api/summaries/:id
 * @desc    Delete a summary by ID
 * @access  Private (JWT required)
 * @param   {string} id - Summary ID to delete
 */
router.delete("/:id", authMiddleware, deleteSummary);

/**
 * @route   PUT /api/summaries/:id/rename
 * @desc    Rename an existing summary
 * @access  Private (JWT required)
 * @param   {string} id - Summary ID
 * @body    {newName} - New name for the summary
 */
router.put("/:id/rename", authMiddleware, renameSummary);

/**
 * @route   GET /api/summaries/folder/:folderID
 * @desc    Retrieve all summaries in a specific folder
 * @access  Private (JWT required)
 * @param   {string} folderID - Folder ID (or "null" for unorganized)
 * @returns Array of summaries in the specified folder
 */
router.get("/folder/:folderID", authMiddleware, getSummariesByFolderID);

/**
 * @route   PUT /api/summaries/:id/assign-folder
 * @desc    Assign a summary to a specific folder
 * @access  Private (JWT required)
 * @param   {string} id - Summary ID
 * @body    {folderID} - Folder ID to assign
 */
router.put("/:id/assign-folder", authMiddleware, assignFolderToSummary);

/**
 * @route   POST /api/summaries/query-document
 * @desc    Query a document with specific questions using AI
 * @access  Private (JWT required)
 * @body    {uploadId, question} - Document ID and question to ask
 */
router.post("/query-document", authMiddleware, queryDocument);

module.exports = router;
