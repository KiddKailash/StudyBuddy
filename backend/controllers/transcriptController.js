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
 * Supports multiple YouTube URL formats including:
 * - youtu.be/VIDEO_ID
 * - youtube.com/watch?v=VIDEO_ID
 * - www.youtube.com/watch?v=VIDEO_ID
 * - m.youtube.com/watch?v=VIDEO_ID
 *
 * @param {string} url - The YouTube video URL.
 * @returns {string|null} - The extracted video ID or null if invalid.
 */
const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be short URLs (YouTube's URL shortener)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1); // Remove leading slash to get video ID
    } 
    // Handle standard YouTube URLs (www.youtube.com, youtube.com, m.youtube.com)
    // All these formats use the 'v' query parameter for the video ID
    else if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com' ||
      urlObj.hostname === 'm.youtube.com'
    ) {
      return urlObj.searchParams.get('v');
    } else {
      return null; // Unsupported URL format
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
    return null; // Return null for any URL parsing errors
  }
};

/**
 * Fetches the transcript for a given YouTube URL via the backend.
 *
 * Extracts video ID from different YouTube URL formats, fetches transcript,
 * and cleans up the text by removing brackets, decoding HTML entities, and
 * normalizing whitespace.
 * 
 * Process Flow:
 * 1. Validates and extracts video ID from URL
 * 2. Fetches transcript from YouTube using youtube-transcript library
 * 3. Cleans and formats the transcript text
 * 4. Returns processed transcript to user
 *
 * @param {Object} req - Express request object containing 'url' query parameter
 * @param {string} req.query.url - YouTube video URL to extract transcript from
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with transcript text or error
 */
exports.fetchTranscript = async (req, res) => {
  const videoUrl = req.query.url;

  console.log(`Received request for URL: ${videoUrl}`);

  // Validate URL parameter is provided
  if (!videoUrl) {
    res.status(400).json({ error: "Missing 'url' query parameter" });
    return;
  }

  // Extract video ID from the URL
  const videoId = extractVideoId(videoUrl);

  console.log(`Extracted Video ID: ${videoId}`);

  // Validate video ID was successfully extracted
  if (!videoId) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  try {
    console.log(`Fetching transcript for Video ID: ${videoId}`);
    
    // Fetch transcript array from YouTube using youtube-transcript library
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`Fetched transcript successfully for Video ID: ${videoId}`);

    // Process and clean the transcript text
    const transcriptString = transcriptArray
      .map((entry) => {
        if (entry.text) {
          // Remove bracketed content (like [Music], [Applause], etc.) that doesn't add educational value
          let cleanedText = entry.text.replace(/\[.*?\]/g, '').trim();
          // Decode HTML entities (double decode for nested entities that may occur in transcripts)
          cleanedText = he.decode(cleanedText);
          cleanedText = he.decode(cleanedText);
          return cleanedText;
        }
        return '';
      })
      .join(' ');

    // Normalize whitespace (remove multiple spaces, newlines, etc.) for consistent formatting
    const cleanedTranscript = transcriptString.replace(/\s{2,}/g, ' ');

    console.log(`Processed transcript for Video ID: ${videoId}`);

    res.json({ transcript: cleanedTranscript });
  } catch (error) {
    console.error('Error fetching transcript:', error);

    // Handle specific transcript-related errors with appropriate status codes
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
 * Process Flow:
 * 1. Validates URL parameter
 * 2. Fetches webpage content using axios
 * 3. Parses HTML and removes unwanted elements
 * 4. Extracts and cleans text content
 * 5. Stores transcript in database for authenticated users
 *
 * @param {Object} req - Express request object with 'url' query parameter
 * @param {string} req.query.url - Website URL to extract content from
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with extracted text or error
 */
exports.getWebsiteTranscript = async (req, res) => {
  const { url } = req.query;
  const userId = req.user.id;

  // Validate URL parameter is provided
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Fetch webpage content
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove unwanted HTML elements that don't contain readable content
    // These elements typically contain code, styling, or non-educational content
    $("script").remove(); // Remove JavaScript code
    $("style").remove(); // Remove CSS styles
    $("noscript").remove(); // Remove noscript content
    $("iframe").remove(); // Remove iframe content
    
    // Extract text content from the body element
    // This gets all visible text content from the webpage
    let text = $("body").text();
    
    // Clean up the extracted text by removing excessive whitespace
    // This improves readability and reduces file size
    text = text.replace(/\s+/g, ' ').trim();
    
    // Store transcript in database for authenticated users
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
 * Process Flow:
 * 1. Validates URL parameter
 * 2. Fetches webpage content using axios
 * 3. Parses HTML and removes unwanted elements
 * 4. Extracts and cleans text content
 * 5. Returns transcript without storing in database
 *
 * @param {Object} req - Express request object with 'url' query parameter
 * @param {string} req.query.url - Website URL to extract content from
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with extracted text or error
 */
exports.getWebsiteTranscriptPublic = async (req, res) => {
  const { url } = req.query;

  // Validate URL parameter is provided
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Fetch webpage content
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove unwanted HTML elements that don't contain readable content
    $("script").remove(); // Remove JavaScript code
    $("style").remove(); // Remove CSS styles
    $("noscript").remove(); // Remove noscript content
    $("iframe").remove(); // Remove iframe content
    
    // Extract text content from the body
    let text = $("body").text();
    
    // Clean up whitespace (normalize spaces, tabs, newlines)
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
 * Used for manually entered or pasted transcript content.
 *
 * @param {Object} req - Express request object with text in request body
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.text - Transcript text to store
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.createTranscript = async (req, res) => {
  const { text } = req.body;
  const userId = req.user.id;

  try {
    const db = getDB();
    
    // Store transcript in database
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
 * Returns transcripts in a consistent format.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of transcript objects or error
 */
exports.getTranscripts = async (req, res) => {
  const userId = req.user.id;

  try {
    const db = getDB();
    
    // Fetch all transcripts for the user
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
