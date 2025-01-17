const axios = require("axios");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

// Environment variables
const {
  OAuth_Secret_key,
  OAuth_Client_ID,
  Authorization_URL,
} = process.env;

const REDIRECT_URI = "https://clipcard.netlify.app/?tab=2";

/**
 * Get the Notion authorization URL for the user.
 * Assumes user is already authenticated (authMiddleware ran).
 */
exports.getNotionAuthUrl = async (req, res) => {
  try {
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
 * OAuth callback from Notion.
 * Exchanges the authorization code for an access token and associates it with the user.
 * The user id/state needs to be provided if you're managing states (not shown in this snippet).
 */
exports.notionCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No authorization code provided." });
  }

  try {
    const tokenResponse = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      },
      {
        auth: {
          username: OAuth_Client_ID,
          password: OAuth_Secret_key,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const {
      access_token,
      workspace_id,
      workspace_name,
      bot_id,
      owner,
    } = tokenResponse.data;

    if (!state) {
      return res
        .status(400)
        .json({ error: "User identification (state) missing." });
    }

    const db = getDB();
    const notionIntegrationsCollection = db.collection("notion_authorizations");

    const userId = new ObjectId(state);

    // Insert or update the Notion integration
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

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(500).json({ error: "Failed to save Notion data." });
    }

    // Redirect back to your frontend to show success
    res.redirect("https://clipcard.netlify.app/notion-success");
  } catch (err) {
    console.error("Error during Notion callback:", err.response?.data || err);
    res.status(500).json({ error: "Failed to complete Notion authorization." });
  }
};

/**
 * Check if the currently logged-in user has authorized Notion.
 */
exports.checkNotionAuthorization = async (req, res) => {
  try {
    const db = getDB();
    const notionIntegrationsCollection = db.collection("notion_authorizations");

    const integration = await notionIntegrationsCollection.findOne(
      { userId: new ObjectId(req.user.id) },
      { projection: { accessToken: 1 } }
    );

    const authorized = !!integration?.accessToken;
    res.status(200).json({ authorized });
  } catch (err) {
    console.error("Error checking Notion authorization:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Fetch content from a specified Notion page.
 * Requires user to be authenticated and have a notionAccessToken.
 */
exports.getNotionPageContent = async (req, res) => {
  const pageId = req.query.pageId;
  if (!pageId) {
    return res.status(400).json({ error: "No page ID provided." });
  }

  try {
    const db = getDB();
    const notionIntegrationsCollection = db.collection("notion_authorizations");

    const integration = await notionIntegrationsCollection.findOne(
      { userId: new ObjectId(req.user.id) },
      { projection: { accessToken: 1 } }
    );

    if (!integration || !integration.accessToken) {
      return res
        .status(403)
        .json({ error: "User not authorized with Notion." });
    }

    const response = await axios.get(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    const blocks = response.data.results || [];
    let content = "";
    for (const block of blocks) {
      if (
        block.type === "paragraph" &&
        block.paragraph &&
        block.paragraph.rich_text
      ) {
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
