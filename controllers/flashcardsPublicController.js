/**
 * flashcardsPublicController.js
 *
 * Controller for handling "free tier" flashcard sessions stored in system memory
 * rather than persisted in a database.
 */

const { v4: uuidv4 } = require('uuid');

/**
 * In-memory store for ephemeral flashcard sessions.
 * This is a simple JavaScript object keyed by sessionId.
 * The value is an object containing session details.
 *
 * Example structure:
 * {
 *   "some-uuid": {
 *       sessionName: "Session: 9/21/2024, 1:00:00 PM",
 *       flashcards: [ { question: "Q1", answer: "A1" }, ... ],
 *       transcript: "User-provided transcript text",
 *       createdDate: Date
 *   }
 * }
 */
const ephemeralSessions = {};

/**
 * Create a new ephemeral flashcard session
 * POST /api/flashcards-public
 *
 * Expected request body:
 * {
 *   "sessionName": "string",
 *   "studyCards": [ { question: '...', answer: '...' }, ... ],
 *   "transcript": "string"
 * }
 *
 * Response: 
 * {
 *   "message": "Created ephemeral flashcard session successfully.",
 *   "session": {
 *       "id": "<generated UUID>",
 *       "sessionName": "...",
 *       "flashcards": [...],
 *       "transcript": "...",
 *       "createdDate": ...
 *   }
 * }
 */
exports.createEphemeralSession = (req, res) => {
  const { sessionName, studyCards, transcript } = req.body;

  // Basic validation
  if (!sessionName || !Array.isArray(studyCards) || !transcript) {
    return res.status(400).json({
      error: "sessionName, studyCards, and transcript are required.",
    });
  }

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
};

/**
 * Retrieve a single ephemeral session by ID
 * GET /api/flashcards-public/:id
 *
 * Response (if found):
 * {
 *   "id": "<sessionId>",
 *   "sessionName": "...",
 *   "flashcards": [...],
 *   "transcript": "...",
 *   "createdDate": ...
 * }
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
 *
 * Response: 
 * {
 *   "message": "Deleted ephemeral flashcard session successfully."
 * }
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
