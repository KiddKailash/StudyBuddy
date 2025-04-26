const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require('uuid');
const axios = require("axios");

// Rate Limiter Middleware for Public Routes
const createFlashcardSessionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // limit each IP to 2 create requests per windowMs
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

/**
 * Generate flashcards from a transcript text for public/unauthenticated users
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
