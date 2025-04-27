/**
 * Transcript Controller
 * 
 * Manages the acquisition and processing of transcripts from various sources.
 * Provides endpoints for fetching transcripts from YouTube videos and websites.
 * Supports storing and retrieving transcript data for authenticated users.
 * Includes utilities for cleaning and formatting transcript text.
 */
const { YoutubeTranscript } = require('youtube-transcript');
const he = require('he');
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Extracts the video ID from various YouTube URL formats.
 *
 * @param {string} url - The YouTube video URL.
 * @returns {string|null} - The extracted video ID or null if invalid.
 */
const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    } else if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com' ||
      urlObj.hostname === 'm.youtube.com'
    ) {
      return urlObj.searchParams.get('v');
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
    return null;
  }
};

/**
 * Fetches the transcript for a given YouTube URL via the backend.
 *
 * Extracts video ID from different YouTube URL formats, fetches transcript,
 * and cleans up the text by removing brackets, decoding HTML entities, and
 * normalizing whitespace.
 *
 * @param {Object} req - Express request object containing 'url' query parameter
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with transcript text or error
 */
exports.fetchTranscript = async (req, res) => {
  const videoUrl = req.query.url;

  console.log(`Received request for URL: ${videoUrl}`);

  if (!videoUrl) {
    res.status(400).json({ error: "Missing 'url' query parameter" });
    return;
  }

  const videoId = extractVideoId(videoUrl);

  console.log(`Extracted Video ID: ${videoId}`);

  if (!videoId) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  try {
    console.log(`Fetching transcript for Video ID: ${videoId}`);
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`Fetched transcript successfully for Video ID: ${videoId}`);

    const transcriptString = transcriptArray
      .map((entry) => {
        if (entry.text) {
          let cleanedText = entry.text.replace(/\[.*?\]/g, '').trim();
          cleanedText = he.decode(cleanedText);
          cleanedText = he.decode(cleanedText);
          return cleanedText;
        }
        return '';
      })
      .join(' ');

    const cleanedTranscript = transcriptString.replace(/\s{2,}/g, ' ');

    console.log(`Processed transcript for Video ID: ${videoId}`);

    res.json({ transcript: cleanedTranscript });
  } catch (error) {
    console.error('Error fetching transcript:', error);

    if (
      error.message.includes('Transcript is disabled') ||
      error.message.includes('Could not retrieve transcript') ||
      error.message.includes('Could not find captions')
    ) {
      res.status(404).json({
        error: 'Transcript not found',
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: 'Error fetching transcript',
        details: error.message,
      });
    }
  }
};

// Website transcript functions
/**
 * Extracts text content from a website URL for authenticated users.
 *
 * Fetches webpage content, removes script and style elements,
 * extracts readable text, and stores it in the database.
 *
 * @param {Object} req - Express request object with 'url' query parameter
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with extracted text or error
 */
exports.getWebsiteTranscript = async (req, res) => {
  const { url } = req.query;
  const userId = req.user.id;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove script tags, style tags, and comments
    $("script").remove();
    $("style").remove();
    $("noscript").remove();
    $("iframe").remove();
    
    // Get text content
    let text = $("body").text();
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    // Store in database for authenticated users
    const db = getDB();
    await db.collection("websiteTranscripts").insertOne({
      userId: new ObjectId(userId),
      url,
      transcript: text,
      createdAt: new Date()
    });

    res.json({ transcript: text });
  } catch (error) {
    console.error("Website transcript error:", error);
    res.status(500).json({ error: "Failed to get website content" });
  }
};

/**
 * Public endpoint to extract text content from a website URL.
 *
 * Similar to getWebsiteTranscript but doesn't require authentication
 * and doesn't store results in the database.
 *
 * @param {Object} req - Express request object with 'url' query parameter
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with extracted text or error
 */
exports.getWebsiteTranscriptPublic = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove script tags, style tags, and comments
    $("script").remove();
    $("style").remove();
    $("noscript").remove();
    $("iframe").remove();
    
    // Get text content
    let text = $("body").text();
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();

    res.json({ transcript: text });
  } catch (error) {
    console.error("Website transcript error:", error);
    res.status(500).json({ error: "Failed to get website content" });
  }
};

// Regular transcript functions
/**
 * Creates a new transcript entry from provided text.
 *
 * Stores user-provided transcript text in the database.
 *
 * @param {Object} req - Express request object with text in request body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.createTranscript = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const db = getDB();
    const result = await db.collection("transcripts").insertOne({
      userId: new ObjectId(userId),
      text,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Transcript created successfully",
      transcriptId: result.insertedId,
    });
  } catch (error) {
    console.error("Create transcript error:", error);
    res.status(500).json({ error: "Failed to create transcript" });
  }
};

/**
 * Get all transcripts for authenticated user
 * 
 * Retrieves all transcript entries created by the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of transcript objects or error
 */
exports.getTranscripts = async (req, res) => {
  const userId = req.user.id;

  try {
    const db = getDB();
    const transcripts = await db
      .collection("transcripts")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    res.json({ transcripts });
  } catch (error) {
    console.error("Get transcripts error:", error);
    res.status(500).json({ error: "Failed to get transcripts" });
  }
};
