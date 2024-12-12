const axios = require("axios");
const User = require("../models/User"); // Adjust path as needed

// Environment variables for Notion
const {
  NOTION_CLIENT_ID,
  NOTION_CLIENT_SECRET,
  NOTION_REDIRECT_URI
} = process.env;

/**
 * Generates the Notion authorization URL and returns it to the frontend.
 */
exports.getNotionAuthUrl = async (req, res) => {
  try {
    // Your Notion OAuth URL: https://www.notion.so/my-integrations
    const params = new URLSearchParams({
      client_id: NOTION_CLIENT_ID,
      response_type: "code",
      owner: "user",
      redirect_uri: NOTION_REDIRECT_URI
    });

    const authUrl = `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;

    res.status(200).json({ url: authUrl });
  } catch (err) {
    console.error("Error generating Notion auth URL:", err);
    res.status(500).json({ error: "Failed to generate authorization URL." });
  }
};

/**
 * Handles the OAuth callback from Notion.
 * Exchanges the authorization code for an access token and stores it in the user's profile.
 */
exports.notionCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "No authorization code provided." });
  }

  try {
    const tokenResponse = await axios.post("https://api.notion.com/v1/oauth/token", {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: NOTION_REDIRECT_URI
    }, {
      auth: {
        username: NOTION_CLIENT_ID,
        password: NOTION_CLIENT_SECRET
      }
    });

    const { access_token } = tokenResponse.data;

    // Here you need to identify the user. Typically, you might store a state parameter
    // during the initial auth request and then retrieve it here. For simplicity,
    // assume the user is currently logged in and their JWT token is available.
    // If this is a separate flow, you might need to store the user’s ID in the state.
    // For now, let's assume you have a cookie or session that identifies the user.
    // In a real app, you may need to redirect them back to the frontend to handle this.

    // Example: if you use a JWT and store user info in it, you'd extract it from req.user
    // after verifying the token. This might mean you need to protect this route and store
    // a temporary state. For demonstration, assume we have a userId in query or some logic.
    const userId = req.query.state; 
    // NOTE: In a real implementation, you'd pass a `state` param during the initial
    // auth request that includes the user ID or session ID, then verify it here.

    if (!userId) {
      return res.status(400).json({ error: "User not identified." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Store the Notion access token in the user's record
    user.notionAccessToken = access_token;
    await user.save();

    // Redirect the user back to your frontend, or respond with success
    // Usually you'd redirect to a success page in the frontend:
    // res.redirect("http://your-frontend.com/notion-success");
    res.status(200).json({ message: "Notion authorized successfully!" });
  } catch (err) {
    console.error("Error handling Notion callback:", err.response?.data || err);
    res.status(500).json({ error: "Failed to complete Notion authorization." });
  }
};

/**
 * Checks if the currently authenticated user is authorized with Notion.
 */
exports.checkNotionAuthorization = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // requireAuth sets req.user
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
 * Fetches content from a Notion page.
 * Assumes the user has authorized and we have their Notion access token.
 * You need a page_id. You can store this or ask user to provide it.
 */
exports.getNotionPageContent = async (req, res) => {
  const pageId = req.query.pageId; 
  // or define a default page if you have one stored in user's profile
  
  if (!pageId) {
    return res.status(400).json({ error: "No page ID provided." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.notionAccessToken) {
      return res.status(403).json({ error: "User not authorized with Notion." });
    }

    // The Notion API for retrieving page content depends on what you consider as "content"
    // For a page, you might retrieve block children and then parse their text.
    const response = await axios.get(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        Authorization: `Bearer ${user.notionAccessToken}`,
        "Notion-Version": "2022-06-28"
      }
    });

    // Extract text content from the blocks
    const blocks = response.data.results || [];
    let content = "";
    for (const block of blocks) {
      // For simplicity, only handle paragraph-type blocks
      if (block.type === "paragraph" && block.paragraph && block.paragraph.rich_text) {
        const textParts = block.paragraph.rich_text.map(t => t.plain_text).join(" ");
        content += textParts + "\n";
      }
    }

    res.status(200).json({ content });
  } catch (err) {
    console.error("Error fetching Notion page content:", err.response?.data || err);
    res.status(500).json({ error: "Failed to fetch page content from Notion." });
  }
};
