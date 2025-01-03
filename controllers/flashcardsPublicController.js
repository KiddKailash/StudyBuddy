// flashcardsPublicController.js
const { getDB } = require("../utils/db");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require('uuid');

// Rate Limiter Middleware for Public Routes
const createFlashcardSessionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 5 create requests per windowMs
  message: {
    error: "You have reached the maximum number of study sessions allowed per day. Please try again later or create an account.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * In-memory store for ephemeral flashcard sessions.
 */
const ephemeralSessions = {};

/**
 * Create a new ephemeral flashcard session
 * POST /api/flashcards-public
 */
exports.createEphemeralSession = [
  createFlashcardSessionLimiter, // Apply rate limiter
  (req, res) => {
    const { sessionName, studyCards, transcript } = req.body;

    // Basic validation
    if (!sessionName || !Array.isArray(studyCards) || !transcript) {
      return res.status(400).json({
        error: "sessionName, studyCards, and transcript are required.",
      });
    }

    // Optional: Implement additional checks like per-IP session count
    // For simplicity, we're using express-rate-limit above

    // Generate a unique ID for this ephemeral session
    const sessionId = uuidv4();

    // Create the ephemeral session object
    const newSession = {
      sessionName,
      flashcards: studyCards,
      transcript,
      createdDate: new Date(),
    };

    // Store in memory
    ephemeralSessions[sessionId] = newSession;

    return res.status(201).json({
      message: "Created ephemeral flashcard session successfully.",
      session: {
        id: sessionId,
        ...newSession,
      },
    });
  },
];

/**
 * Retrieve a single ephemeral session by ID
 * GET /api/flashcards-public/:id
 */
exports.getEphemeralSessionById = (req, res) => {
  const { id } = req.params;

  const session = ephemeralSessions[id];
  if (!session) {
    return res.status(404).json({ error: "Ephemeral flashcard session not found." });
  }

  return res.status(200).json({
    id,
    ...session,
  });
};

/**
 * Delete an ephemeral session by ID
 * DELETE /api/flashcards-public/:id
 */
exports.deleteEphemeralSession = (req, res) => {
  const { id } = req.params;

  if (!ephemeralSessions[id]) {
    return res.status(404).json({ error: "Ephemeral flashcard session not found." });
  }

  // Delete from the in-memory store
  delete ephemeralSessions[id];

  return res.status(200).json({
    message: "Deleted ephemeral flashcard session successfully.",
  });
};
