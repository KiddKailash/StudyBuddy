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
 * @route GET /api/notion/auth-url
 * @description Get the Notion authorization URL to start the OAuth flow.
 * @access Protected (User must be logged in)
 */
router.get('/auth-url', authMiddleware, getNotionAuthUrl);

/**
 * @route GET /api/notion/callback
 * @description OAuth callback endpoint for Notion.
 * @access Public
 */
router.get('/callback', notionCallback);

/**
 * @route GET /api/notion/is-authorized
 * @description Check if the currently logged-in user has authorized Notion.
 * @access Protected (User must be logged in)
 */
router.get('/is-authorized', authMiddleware, checkNotionAuthorization);

/**
 * @route GET /api/notion/page-content
 * @description Fetch content from a specified Notion page.
 * @access Protected (User must be logged in and have authorized Notion)
 */
router.get('/page-content', authMiddleware, requireNotionAuth, getNotionPageContent);

module.exports = router;
