/**
 * Notion Controller
 * 
 * Manages integration with Notion API for content import and export.
 * Handles OAuth authentication flow, token management, and content retrieval.
 * Provides endpoints for authorizing Notion access, checking authorization status,
 * and fetching page content from Notion workspaces.
 */
const axios = require("axios");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

// Environment variables for Notion OAuth configuration
const {
  OAuth_Secret_key,
  OAuth_Client_ID,
  Authorization_URL,
} = process.env;

// OAuth redirect URI for the application
const REDIRECT_URI = "https://clipcard.netlify.app/?tab=2";

/**
 * Get the Notion authorization URL for the user.
 * 
 * Generates the OAuth authorization URL for connecting a user's Notion account.
 * Uses the user's ID as the state parameter for security and user association.
 * 
 * @param {Object} req - Express request object with authenticated user
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with authorization URL or error
 */
exports.getNotionAuthUrl = async (req, res) => {
  try {
    // Use user ID as state parameter for security and user association
    const state = req.user.id;  // user ID from authMiddleware
    const notionAuthUrl = `${Authorization_URL}&state=${state}`; 
    // Example: "https://api.notion.com/v1/oauth/authorize?client_id=...&response_type=code&redirect_uri=...&state=123456789"

    res.status(200).json({ url: notionAuthUrl });
  } catch (err) {
    console.error("Error generating Notion auth URL:", err);
    res.status(500).json({ error: "Failed to generate authorization URL." });
  }
};


/**
 * OAuth callback handler from Notion.
 * 
 * Processes the OAuth callback from Notion, exchanging the authorization code
 * for an access token and storing it with the user's account.
 * 
 * Process Flow:
 * 1. Receives authorization code and state from Notion
 * 2. Exchanges code for access token using Notion API
 * 3. Stores token and workspace information in database
 * 4. Redirects user back to frontend success page
 * 
 * @param {Object} req - Express request object with code and state query parameters
 * @param {string} req.query.code - Authorization code from Notion
 * @param {string} req.query.state - User ID passed as state parameter
 * @param {Object} res - Express response object
 * @returns {Object} Redirect to success page or JSON error response
 */
exports.notionCallback = async (req, res) => {
  const { code, state } = req.query;

  // Validate authorization code is present
  if (!code) {
    return res.status(400).json({ error: "No authorization code provided." });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      },
      {
        // Use client credentials for OAuth token exchange
        auth: {
          username: OAuth_Client_ID,
          password: OAuth_Secret_key,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract token and workspace information from response
    const {
      access_token,
      workspace_id,
      workspace_name,
      bot_id,
      owner,
    } = tokenResponse.data;

    // Validate state parameter (user ID) is present
    if (!state) {
      return res
        .status(400)
        .json({ error: "User identification (state) missing." });
    }

    const db = getDB();
    const notionIntegrationsCollection = db.collection("notion_authorizations");

    const userId = new ObjectId(state);

    // Insert or update the Notion integration for the user
    // Uses upsert to create new record or update existing one
    const result = await notionIntegrationsCollection.updateOne(
      { userId: userId },
      {
        $set: {
          accessToken: access_token,
          workspaceId: workspace_id,
          workspaceName: workspace_name,
          botId: bot_id,
          owner: owner,
          integrationDate: new Date(),
        },
      },
      { upsert: true } // Insert a new document if no match is found
    );

    // Verify the operation was successful
    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(500).json({ error: "Failed to save Notion data." });
    }

    // Redirect back to frontend to show success
    res.redirect("https://clipcard.netlify.app/notion-success");
  } catch (err) {
    console.error("Error during Notion callback:", err.response?.data || err);
    res.status(500).json({ error: "Failed to complete Notion authorization." });
  }
};

/**
 * Check if the currently logged-in user has authorized Notion.
 * 
 * Verifies whether the user has connected their Notion account
 * by checking for a stored access token.
 * 
 * @param {Object} req - Express request object with authenticated user
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with authorization status or error
 */
exports.checkNotionAuthorization = async (req, res) => {
  try {
    const db = getDB();
    const notionIntegrationsCollection = db.collection("notion_authorizations");

    // Check for existing Notion integration for the user
    const integration = await notionIntegrationsCollection.findOne(
      { userId: new ObjectId(req.user.id) },
      { projection: { accessToken: 1 } } // Only retrieve access token for efficiency
    );

    // Return boolean indicating if user has authorized Notion
    const authorized = !!integration?.accessToken;
    res.status(200).json({ authorized });
  } catch (err) {
    console.error("Error checking Notion authorization:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Fetch content from a specified Notion page.
 * 
 * Retrieves and extracts text content from a Notion page using the user's
 * stored access token. Currently extracts content from paragraph blocks.
 * 
 * Process Flow:
 * 1. Validates user has Notion authorization
 * 2. Retrieves page blocks from Notion API
 * 3. Extracts text content from paragraph blocks
 * 4. Returns formatted content to user
 * 
 * @param {Object} req - Express request object with pageId query parameter
 * @param {string} req.query.pageId - Notion page ID to fetch content from
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with page content or error
 */
exports.getNotionPageContent = async (req, res) => {
  const pageId = req.query.pageId;
  
  // Validate page ID is provided
  if (!pageId) {
    return res.status(400).json({ error: "No page ID provided." });
  }

  try {
    const db = getDB();
    const notionIntegrationsCollection = db.collection("notion_authorizations");

    // Get user's Notion access token
    const integration = await notionIntegrationsCollection.findOne(
      { userId: new ObjectId(req.user.id) },
      { projection: { accessToken: 1 } }
    );

    // Verify user has authorized Notion
    if (!integration || !integration.accessToken) {
      return res
        .status(403)
        .json({ error: "User not authorized with Notion." });
    }

    // Fetch page blocks from Notion API
    const response = await axios.get(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
          "Notion-Version": "2022-06-28", // Specify Notion API version
        },
      }
    );

    // Extract text content from page blocks
    const blocks = response.data.results || [];
    let content = "";
    
    // Process each block and extract text from paragraph blocks
    for (const block of blocks) {
      if (
        block.type === "paragraph" &&
        block.paragraph &&
        block.paragraph.rich_text
      ) {
        // Join all text parts in the paragraph
        const textParts = block.paragraph.rich_text
          .map((t) => t.plain_text)
          .join(" ");
        content += textParts + "\n";
      }
    }

    res.status(200).json({ content });
  } catch (err) {
    console.error("Error fetching Notion page content:", err.response?.data || err);
    res.status(500).json({ error: "Failed to fetch page content from Notion." });
  }
};
