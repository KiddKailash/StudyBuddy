const axios = require("axios");
const { getDB } = require("../utils/db");
const { ObjectId } = require("mongodb");

// Environment variables
const {
  OAuth_Secret_key,
  OAuth_Client_ID,
  Authorization_URL,
} = process.env;

const REDIRECT_URI = "https://clipcard.netlify.app/";

/**
 * Get the Notion authorization URL for the user.
 * Assumes user is already authenticated (authMiddleware ran).
 */
exports.getNotionAuthUrl = async (req, res) => {
  try {
    // If needed, add state parameter to identify user:
    // const state = req.user.id; 
    // Then append `&state=${state}` to the Authorization_URL if Notion supports it.
    // For now, just return the URL as is.
    res.status(200).json({ url: Authorization_URL });
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

    const { access_token } = tokenResponse.data;

    // In a real implementation, you'd have `state` represent the user’s ID.
    // For this example, assume `state` is provided and corresponds to a user’s ID.
    // If you're not using state, you need another way to identify the user.
    if (!state) {
      return res
        .status(400)
        .json({ error: "User identification (state) missing." });
    }

    const db = getDB();
    const usersCollection = db.collection("users");
    const userId = new ObjectId(state);

    const result = await usersCollection.updateOne(
      { _id: userId },
      { $set: { notionAccessToken: access_token } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found." });
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
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { notionAccessToken: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const authorized = !!user.notionAccessToken;
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
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { notionAccessToken: 1 } }
    );

    if (!user || !user.notionAccessToken) {
      return res
        .status(403)
        .json({ error: "User not authorized with Notion." });
    }

    const response = await axios.get(
      `https://api.notion.com/v1/blocks/${pageId}/children`,
      {
        headers: {
          Authorization: `Bearer ${user.notionAccessToken}`,
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
