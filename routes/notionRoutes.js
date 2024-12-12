const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getNotionAuthUrl,
  notionCallback,
  checkNotionAuthorization,
  getNotionPageContent
} = require("../controllers/notionController");

const router = express.Router();

// Get the Notion authorization URL
router.get("/auth-url", requireAuth, getNotionAuthUrl);

// This is the OAuth callback that Notion will redirect to after user authorizes
router.get("/callback", notionCallback);

// Check if user is authorized with Notion
router.get("/is-authorized", requireAuth, checkNotionAuthorization);

// Fetch Notion page content
router.get("/page-content", requireAuth, getNotionPageContent);

module.exports = router;
