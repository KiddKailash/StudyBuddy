/**
 * Flashcards Controller
 * 
 * Manages the creation, retrieval, and manipulation of flashcard study sessions.
 * Provides endpoints for generating AI-powered flashcards from transcripts,
 * managing flashcard sets, and tracking user study progress.
 * Supports both authenticated users and ephemeral (unauthenticated) sessions.
 */
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require('uuid');

// Rate Limiter Middleware for Public Routes
const createFlashcardSessionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // limit each IP to 2 create requests per windowMs
  message: {
    error: "You have reached the maximum number of study sessions allowed per day. Please try again later or create an account.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory store for ephemeral flashcard sessions
const ephemeralSessions = {};

/**
 * Create a new flashcard session
 * 
 * Creates a new flashcard study session for the authenticated user.
 * Enforces session limits for free users.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created session or error
 */
exports.createFlashcardSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountType = req.user.accountType || "free";
    const { uploadId, folderID, sessionName, studyCards  } = req.body;

    // Validate required fields
    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required." });
    }
    if (!sessionName) {
      return res.status(400).json({ error: "sessionName is required." });
    }
    if (!Array.isArray(studyCards)) {
      return res
        .status(400)
        .json({ error: "studyCards must be an array (can be empty or pre-filled)." });
    }

    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    // Enforce limit for free users
    if (accountType === "free") {
      const sessionCount = await flashcardsCollection.countDocuments({
        userId: new ObjectId(userId),
      });

      if (sessionCount >= 2) {
        return res.status(403).json({
          error:
            "You have reached the maximum number of study sessions allowed for free accounts.",
        });
      }
    }

    const newSession = {
      userId: new ObjectId(userId),
      studySession: sessionName,
      flashcardsJSON: studyCards,
      createdDate: new Date(),
      folderID: folderID,
    };

    const result = await flashcardsCollection.insertOne(newSession);

    // Include 'id' in the response for frontend consistency
    const createdSession = {
      id: result.insertedId.toString(),
      ...newSession,
    };

    res.status(201).json({
      message: "Flashcard session created successfully.",
      flashcard: createdSession,
    });
  } catch (error) {
    console.error("Create Flashcard Session Error:", error);
    res
      .status(500)
      .json({ error: "Server error while creating flashcard session." });
  }
};

/**
 * Generate flashcards from a transcript
 * 
 * Uses OpenAI to generate study flashcards from a provided transcript.
 * Returns a 2-element JSON array: [sessionName, [{question, answer}, ...]]
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with generated flashcards or error
 */
exports.generateSessionFlashcards = async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required." });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res
        .status(500)
        .json({ error: "OpenAI API key is not configured." });
    }

    const prompt = `
      Convert the following transcript into 15 study flashcards in JSON format (return this as text, no markdown).
      Also generate a short session name. The final JSON format should be:
      [
        "sessionName",
        [
          {
            "question": "Question 1",
            "answer": "Answer 1"
          },
          ...
        ]
      ]

      Transcript:
      ${transcript}

      Requirements:
        - Return only the JSON array in the exact format specified.
        - Index 0: A short sessionName (string).
        - Index 1: An array of flashcard objects, each with "question" and "answer" fields.
        - No extra text, explanations, or code snippets.
        - Ensure the JSON is valid and can be parsed.
        - Use the same language as the transcript.
        - Ignore info about personnel, course structure, or tools; focus on educational content.
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: 15000,
        temperature: 0.1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    let flashcardsText = response.data.choices[0].message.content.trim();
    // Strip triple backticks if present
    if (flashcardsText.startsWith("```") && flashcardsText.endsWith("```")) {
      flashcardsText = flashcardsText.slice(3, -3).trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(flashcardsText);
    } catch (parseError) {
      console.error("Error parsing flashcards JSON:", parseError);
      console.error("Flashcards Text:", flashcardsText);
      return res
        .status(500)
        .json({ error: "Failed to parse flashcards JSON." });
    }

    // Validate the 2-element array format
    if (
      !Array.isArray(parsedResponse) ||
      parsedResponse.length !== 2 ||
      typeof parsedResponse[0] !== "string" ||
      !Array.isArray(parsedResponse[1])
    ) {
      return res.status(500).json({
        error: "Invalid format: Expected [sessionName, [{question, answer}...]].",
      });
    }

    const sessionName = parsedResponse[0];
    const flashcards = parsedResponse[1];

    // Validate flashcards array structure
    if (
      !flashcards.every(
        (card) =>
          typeof card === "object" &&
          typeof card.question === "string" &&
          typeof card.answer === "string"
      )
    ) {
      return res
        .status(500)
        .json({ error: "Invalid flashcards format received from OpenAI." });
    }

    return res.status(200).json({ flashcards: parsedResponse });
  } catch (error) {
    console.error(
      "Error generating flashcards via OpenAI:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ error: "Error generating flashcards via OpenAI." });
  }
};

/**
 * Add flashcards to an existing session
 * 
 * Appends new flashcards to a user's existing flashcard session.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.addFlashcardsToSession = async (req, res) => {
  const { id } = req.params;
  const { studyCards } = req.body;
  const userId = req.user.id;

  // Basic validation
  if (!Array.isArray(studyCards) || studyCards.length === 0) {
    return res
      .status(400)
      .json({ error: "studyCards (non-empty array) are required." });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!session) {
      return res.status(404).json({ error: "Flashcard session not found." });
    }

    // Update the session by pushing new flashcards
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { flashcardsJSON: { $each: studyCards } } }
    );

    res
      .status(200)
      .json({ message: "Flashcards added successfully to the session." });
  } catch (error) {
    console.error("Add Flashcards Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while adding flashcards." });
  }
};

/**
 * Retrieve all flashcard sessions for the logged-in user
 */
exports.getAllFlashcards = async (req, res) => {
  const userId = req.user.id;

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    const sessions = await flashcardsCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Convert _id to id
    const formattedSessions = sessions.map((session) => ({
      id: session._id.toString(),
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      transcript: session.transcript,
      createdDate: session.createdDate,
    }));

    res.status(200).json({ flashcards: formattedSessions });
  } catch (error) {
    console.error("Get All Flashcards Error:", error);
    res
      .status(500)
      .json({ error: "Server error while retrieving flashcards." });
  }
};

/**
 * Retrieve a single flashcard session by ID
 */
exports.getFlashcardSessionById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    const session = await flashcardsCollection.findOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      {
        projection: {
          flashcardsJSON: 1,
          studySession: 1,
          transcript: 1,
          createdDate: 1,
        },
      }
    );

    if (!session) {
      return res.status(404).json({ error: "Flashcard session not found." });
    }

    const responseData = {
      id: session._id.toString(),
      userId: session.userId,
      uploadId: session.uploadId,
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      transcript: session.transcript,
      createdDate: session.createdDate,
      folderID: session.folderID || null,
    };

    return res.status(200).json({ data: responseData });
  } catch (error) {
    console.error("Get Flashcard Session By ID Error:", error);
    res
      .status(500)
      .json({ error: "Server error while retrieving flashcard session." });
  }
};

/**
 * Delete a flashcard session by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteFlashcardSession = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!session) {
      return res.status(404).json({ error: "Flashcard session not found." });
    }

    // Delete the session
    await flashcardsCollection.deleteOne({ _id: new ObjectId(id) });

    res
      .status(200)
      .json({ message: "Flashcard session deleted successfully." });
  } catch (error) {
    console.error("Delete Flashcard Session Error:", error);
    res
      .status(500)
      .json({ error: "Server error while deleting flashcard session." });
  }
};

/**
 * Update the name of a flashcard session
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateFlashcardSessionName = async (req, res) => {
  const { id } = req.params;
  const { sessionName } = req.body;
  const userId = req.user.id;

  // Basic validation
  if (!sessionName) {
    return res.status(400).json({ error: "sessionName is required." });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!session) {
      return res.status(404).json({ error: "Flashcard session not found." });
    }

    // Update the session name
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { studySession: sessionName, updatedDate: new Date() } }
    );

    res
      .status(200)
      .json({ message: "Flashcard session name updated successfully." });
  } catch (error) {
    console.error("Update Flashcard Session Name Error:", error);
    res
      .status(500)
      .json({ error: "Server error while updating flashcard session name." });
  }
};

/**
 * Assign a folder to an existing flashcard session.
 */
exports.assignFolderToSession = async (req, res) => {
  const { id } = req.params;
  const { folderID } = req.body;
  const userId = req.user.id;

  if (!folderID) {
    return res.status(400).json({ error: "folderID is required." });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!session) {
      return res.status(404).json({ error: "Flashcard session not found." });
    }

    // Update the session to assign the folder
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { folderID } }
    );

    res.status(200).json({ message: "Folder assigned successfully." });
  } catch (error) {
    console.error("Error assigning folder:", error);
    res.status(500).json({ error: "Server error assigning folder." });
  }
};

/**
 * Generate additional flashcards for an existing session
 * 
 * Creates additional flashcards for an existing session, ensuring they
 * don't duplicate existing questions and cover new content.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with newly generated flashcards or error
 */
exports.generateAdditionalFlashcards = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const accountType = req.user.accountType || "free";

  // Enforce premium requirement
  if (accountType === "free") {
    return res.status(403).json({
      error: "This feature is available for paid accounts only.",
    });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!session) {
      return res.status(404).json({ error: "Flashcard session not found." });
    }

    const transcript = session.transcript;
    const existingQuestions = session.flashcardsJSON.map(
      (card) => card.question
    );

    // Generate new flashcards via OpenAI
    const newFlashcards = await generateFlashcardsHelper(transcript, existingQuestions);

    // Update the session by adding new flashcards
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { flashcardsJSON: { $each: newFlashcards } } }
    );

    res.status(200).json({
      message: "Additional flashcards generated and added successfully.",
      newFlashcards: newFlashcards,
    });
  } catch (error) {
    console.error("Generate Additional Flashcards Error:", error);
    res.status(500).json({
      error: "Server error while generating additional flashcards.",
    });
  }
};

/**
 * Helper function to generate flashcards using OpenAI API
 * 
 * Generates flashcards based on a transcript while avoiding duplication
 * with existing questions. Uses prompt engineering to ensure varied content.
 * 
 * @param {string} transcript - Text content to generate flashcards from
 * @param {Array<string>} existingQuestions - Array of existing questions to avoid duplicating
 * @returns {Array<Object>} Array of flashcard objects with question and answer properties
 * @throws {Error} If OpenAI API is not configured or response parsing fails
 */
async function generateFlashcardsHelper(transcript, existingQuestions) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const prompt = `
    Convert the following transcript into 10 more study flashcards in JSON format (return this as text, do NOT return this in markdown).
    Each flashcard should be an object with "question" and "answer" fields.
    Ensure that the flashcards cover the important information in the transcript.
    Do not duplicate already existing flashcards, these 10 new flashcards MUST cover new content and topics within the transcript that are not covered by the existing flashcards.

    Transcript:
    ${transcript}

    Already Existing Flashcards:
    ${existingQuestions.join("\n")}

    Provide the flashcards in the following JSON format:
    [
      {
        "question": "Question 1",
        "answer": "Answer 1"
      },
      {
        "question": "Question 2",
        "answer": "Answer 2"
      }
    ]

    Requirements:
      - Return only the JSON array of flashcards.
      - Do not include any extra text, explanations, or code snippets.
      - Do not use markdown formatting or code blocks.
      - Ensure the JSON is valid and can be parsed.
      - Generated flashcards MUST be in the same language as the transcript. If the transcript is a language other than English, generated output MUST be in that language.
      - Ignore information within the transcript pertaining to personnel or course structure. Flashcards are for educational content.
  `;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt.trim() }],
      max_tokens: 15000,
      temperature: 0.1,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
    }
  );

  // Process the response
  let flashcardsText = response.data.choices[0].message.content.trim();
  if (flashcardsText.startsWith("```") && flashcardsText.endsWith("```")) {
    flashcardsText = flashcardsText.slice(3, -3).trim();
  }

  let flashcards;
  try {
    flashcards = JSON.parse(flashcardsText);
  } catch (parseError) {
    console.error("Error parsing flashcards JSON:", parseError);
    throw new Error("Failed to parse flashcards JSON.");
  }

  // Validate the flashcards format
  if (
    !Array.isArray(flashcards) ||
    !flashcards.every(
      (card) =>
        typeof card === "object" &&
        typeof card.question === "string" &&
        typeof card.answer === "string"
    )
  ) {
    throw new Error("Invalid flashcards format received from OpenAI.");
  }

  return flashcards;
}

/**
 * Get flashcards by folder ID
 * 
 * Retrieves all flashcard sessions in a specific folder for the authenticated user.
 * Handles special case where folderID is "null" to find unorganized flashcards.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with flashcard sessions or error
 */
exports.getFlashcardsByFolderID = async (req, res) => {
  try {
    const userId = req.user.id;
    let { folderID } = req.params;

    // Re-map "null" → null
    const folderValue = folderID === "null" ? null : folderID;

    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    const sessions = await flashcardsCollection
      .find({
        userId: new ObjectId(userId),
        folderID: folderValue,
      })
      .toArray();

    const formattedSessions = sessions.map((session) => ({
      id: session._id.toString(),
      userId: session.userId,
      uploadId: session.uploadId,
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      transcript: session.transcript,
      createdDate: session.createdDate,
      folderID: session.folderID || null,
    }));

    return res.status(200).json({ data: formattedSessions });
  } catch (error) {
    console.error("Get Flashcards By FolderID Error:", error);
    return res.status(500).json({
      error: "Server error while retrieving flashcards by folder.",
    });
  }
};

/**
 * Generate flashcards from a transcript text directly
 * 
 * Creates flashcards from a raw transcript without requiring an upload.
 * Returns data in the format expected by the frontend with session name and flashcards.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with generated session name and flashcards or error
 */
exports.generateFlashcardsFromTranscript = async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required." });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res
        .status(500)
        .json({ error: "OpenAI API key is not configured." });
    }

    const prompt = `
      Convert the following transcript into 15 study flashcards in JSON format (return this as text, no markdown).
      Also generate a short session name. The final JSON format should be:
      [
        "sessionName",
        [
          {
            "question": "Question 1",
            "answer": "Answer 1"
          },
          ...
        ]
      ]

      Transcript:
      ${transcript}

      Requirements:
        - Return only the JSON array in the exact format specified.
        - Index 0: A short sessionName (string).
        - Index 1: An array of flashcard objects, each with "question" and "answer" fields.
        - No extra text, explanations, or code snippets.
        - Ensure the JSON is valid and can be parsed.
        - Use the same language as the transcript.
        - Ignore info about personnel, course structure, or tools; focus on educational content.
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: 15000,
        temperature: 0.1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    let flashcardsText = response.data.choices[0].message.content.trim();
    // Strip triple backticks if present
    if (flashcardsText.startsWith("```") && flashcardsText.endsWith("```")) {
      flashcardsText = flashcardsText.slice(3, -3).trim();
    }
    // Strip json identifier if present
    if (flashcardsText.startsWith("```json") && flashcardsText.endsWith("```")) {
      flashcardsText = flashcardsText.slice(7, -3).trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(flashcardsText);
    } catch (parseError) {
      console.error("Error parsing flashcards JSON:", parseError);
      console.error("Flashcards Text:", flashcardsText);
      return res
        .status(500)
        .json({ error: "Failed to parse flashcards JSON." });
    }

    // Validate the 2-element array format
    if (
      !Array.isArray(parsedResponse) ||
      parsedResponse.length !== 2 ||
      typeof parsedResponse[0] !== "string" ||
      !Array.isArray(parsedResponse[1])
    ) {
      return res.status(500).json({
        error: "Invalid format: Expected [sessionName, [{question, answer}...]].",
      });
    }

    const sessionName = parsedResponse[0];
    const flashcards = parsedResponse[1];

    // Validate flashcards array structure
    if (
      !flashcards.every(
        (card) =>
          typeof card === "object" &&
          typeof card.question === "string" &&
          typeof card.answer === "string"
      )
    ) {
      return res
        .status(500)
        .json({ error: "Invalid flashcards format received from OpenAI." });
    }

    return res.status(200).json({ 
      sessionName: sessionName,
      flashcards: flashcards
    });
  } catch (error) {
    console.error(
      "Error generating flashcards via OpenAI:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ error: "Error generating flashcards via OpenAI." });
  }
};

// Public endpoints
/**
 * Create a new ephemeral flashcard session
 * 
 * Creates a temporary (non-persistent) flashcard session for unauthenticated users.
 * Uses rate limiting to prevent abuse of the public endpoint.
 * Stores session data in memory with a UUID for reference.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with session ID or error
 */
exports.createEphemeralSession = [
  createFlashcardSessionLimiter,
  (req, res) => {
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
  },
];

/**
 * Retrieve a single ephemeral session by ID
 * 
 * Fetches a temporary flashcard session by its UUID from in-memory storage.
 * Used by unauthenticated users to access their previously created sessions.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with session data or error
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
 * 
 * Removes a temporary flashcard session from in-memory storage.
 * Used for cleanup when a public user is done with their session.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
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

module.exports = exports;
