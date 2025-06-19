/**
 * Notion Integration Routes Module
 * 
 * Defines Express.js routes for Notion API integration and OAuth flow.
 * Provides endpoints for Notion authorization, content retrieval, and integration management.
 * Mix of public routes (OAuth callback) and protected routes (user-specific operations).
 */
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { requireNotionAuth } = require('../middleware/authMiddleware');
const {
  getNotionAuthUrl,
  notionCallback,
  checkNotionAuthorization,
  getNotionPageContent
} = require('../controllers/notionController');

const router = express.Router();

/**
 * @route   GET /api/notion/auth-url
 * @desc    Get the Notion authorization URL to start the OAuth flow
 * @access  Private (JWT required)
 * @returns {url} - Notion OAuth authorization URL
 */
router.get('/auth-url', authMiddleware, getNotionAuthUrl);

/**
 * @route   GET /api/notion/callback
 * @desc    OAuth callback endpoint for Notion authorization
 * @access  Public (called by Notion after user authorization)
 * @query   {code, state} - Authorization code and user state
 * @returns Redirect to success page or error response
 */
router.get('/callback', notionCallback);

/**
 * @route   GET /api/notion/is-authorized
 * @desc    Check if the currently logged-in user has authorized Notion
 * @access  Private (JWT required)
 * @returns {authorized} - Boolean indicating Notion authorization status
 */
router.get('/is-authorized', authMiddleware, checkNotionAuthorization);

/**
 * @route   GET /api/notion/page-content
 * @desc    Fetch content from a specified Notion page
 * @access  Private (JWT required + Notion authorization required)
 * @query   {pageId} - Notion page ID to retrieve content from
 * @returns {content} - Extracted text content from Notion page
 */
router.get('/page-content', authMiddleware, requireNotionAuth, getNotionPageContent);

module.exports = router;
