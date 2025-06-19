/**
 * AI Chat Routes Module
 * 
 * Defines Express.js routes for AI chat functionality with document context.
 * Provides endpoints for creating, managing, and organizing AI chat sessions.
 * All routes require JWT authentication for user-specific chat management.
 * 
 * Key Features:
 * - AI chat session creation and management
 * - Chat history retrieval and organization
 * - Folder-based chat organization
 * - Chat session renaming and deletion
 * - Context-aware AI responses based on documents
 * 
 * Dependencies:
 * - Express.js for route handling
 * - authMiddleware for JWT authentication
 * - aiChatController for business logic
 * 
 * Route Base: /api/aichats
 * Authentication: All routes require valid JWT token
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createChat,
  getAllChats,
  getChatById,
  deleteChat,
  renameAiChat,
  getChatsByFolderID,
  assignFolderToChat,
} = require("../controllers/aiChatController");

/**
 * @route   POST /api/aichats
 * @desc    Create a new AI chat session with document context
 * @access  Private (JWT required)
 * @body    {uploadId, userMessage, folderID}
 */
router.post("/", authMiddleware, createChat);

/**
 * @route   GET /api/aichats
 * @desc    Retrieve all AI chat sessions for the authenticated user
 * @access  Private (JWT required)
 * @returns Array of chat session objects
 */
router.get("/", authMiddleware, getAllChats);

/**
 * @route   GET /api/aichats/:id
 * @desc    Retrieve a specific AI chat session by ID
 * @access  Private (JWT required)
 * @param   {string} id - Chat session ID
 * @returns Single chat session object
 */
router.get("/:id", authMiddleware, getChatById);

/**
 * @route   DELETE /api/aichats/:id
 * @desc    Delete an AI chat session by ID
 * @access  Private (JWT required)
 * @param   {string} id - Chat session ID to delete
 */
router.delete("/:id", authMiddleware, deleteChat);

/**
 * @route   PUT /api/aichats/:id/rename
 * @desc    Rename an existing AI chat session
 * @access  Private (JWT required)
 * @param   {string} id - Chat session ID
 * @body    {newName} - New name for the chat session
 */
router.put("/:id/rename", authMiddleware, renameAiChat);

/**
 * @route   GET /api/aichats/folder/:folderID
 * @desc    Retrieve all AI chat sessions in a specific folder
 * @access  Private (JWT required)
 * @param   {string} folderID - Folder ID (or "null" for unorganized)
 * @returns Array of chat sessions in the specified folder
 */
router.get("/folder/:folderID", authMiddleware, getChatsByFolderID);

/**
 * @route   PUT /api/aichats/:id/assign-folder
 * @desc    Assign an AI chat session to a specific folder
 * @access  Private (JWT required)
 * @param   {string} id - Chat session ID
 * @body    {folderID} - Folder ID to assign
 */
router.put("/:id/assign-folder", authMiddleware, assignFolderToChat);

module.exports = router;
