/**
 * Multiple Choice Quiz Routes Module
 * 
 * Defines Express.js routes for multiple choice quiz management functionality.
 * Provides endpoints for creating, reading, updating, and deleting quiz content.
 * All routes require JWT authentication for user-specific quiz management.
 * 
 * Authentication: All routes require valid JWT token
 */
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz,
  renameQuiz,
  getQuizzesByFolderID,
  assignFolderToQuiz,
} = require("../controllers/multipleChoiceQuizController");

/**
 * @route   POST /api/quiz
 * @desc    Create a new multiple choice quiz
 * @access  Private (JWT required)
 * @body    {title, questions, folderID} - Quiz data and optional folder assignment
 * @returns {quiz} - Created quiz object with ID
 */
router.post("/", authMiddleware, createQuiz);

/**
 * @route   GET /api/quiz
 * @desc    Get all quizzes for the authenticated user
 * @access  Private (JWT required)
 * @returns {quizzes[]} - Array of user's quizzes
 */
router.get("/", authMiddleware, getAllQuizzes);

/**
 * @route   GET /api/quiz/:id
 * @desc    Get a specific quiz by ID
 * @access  Private (JWT required)
 * @param   {id} - Quiz ID
 * @returns {quiz} - Quiz object with questions and answers
 */
router.get("/:id", authMiddleware, getQuizById);

/**
 * @route   DELETE /api/quiz/:id
 * @desc    Delete a quiz by ID
 * @access  Private (JWT required)
 * @param   {id} - Quiz ID to delete
 * @returns {message} - Success confirmation
 */
router.delete("/:id", authMiddleware, deleteQuiz);

/**
 * @route   PUT /api/quiz/:id/rename
 * @desc    Rename an existing quiz
 * @access  Private (JWT required)
 * @param   {id} - Quiz ID
 * @body    {title} - New quiz title
 * @returns {quiz} - Updated quiz object
 */
router.put("/:id/rename", authMiddleware, renameQuiz);

/**
 * @route   GET /api/quiz/folder/:folderID
 * @desc    Get all quizzes in a specific folder
 * @access  Private (JWT required)
 * @param   {folderID} - Folder ID to filter by
 * @returns {quizzes[]} - Array of quizzes in the folder
 */
router.get("/folder/:folderID", authMiddleware, getQuizzesByFolderID);

/**
 * @route   PUT /api/quiz/:id/assign-folder
 * @desc    Assign a quiz to a specific folder
 * @access  Private (JWT required)
 * @param   {id} - Quiz ID
 * @body    {folderID} - Target folder ID
 * @returns {quiz} - Updated quiz object with folder assignment
 */
router.put("/:id/assign-folder", authMiddleware, assignFolderToQuiz);

module.exports = router;
