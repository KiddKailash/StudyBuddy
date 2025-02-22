const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Attempts to fetch a webpage and extract its main text content.
 * Ignores <script>, <style>, <nav>, <footer>, etc. for a "cleaner" transcript.
 */
exports.fetchWebsiteTranscript = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    // Fetch HTML from the site
    const { data: html } = await axios.get(url, {
      // If you need headers or user-agent:
      // headers: { "User-Agent": "Mozilla/5.0 ..." },
    });

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Remove unwanted elements before extracting text
    $("script, style, nav, footer, header, noscript, iframe").remove();

    // You can also remove sidebars or ads if you know their selectors:
    // $(".sidebar, .advertisement").remove();

    // Grab the text from what's left
    let rawText = $("body").text();

    // Replace multiple spaces/newlines with a single space
    let transcript = rawText.replace(/\s+/g, " ").trim();

    return res.json({ transcript });
  } catch (error) {
    console.error("Error scraping website:", error);
    return res.status(500).json({
      error: "Error scraping website",
      details: error.message,
    });
  }
};
