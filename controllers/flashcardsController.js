const { getDB } = require("../utils/db");
const { ObjectId } = require("mongodb");
const axios = require("axios");

/**
 * Create a new flashcard session
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createFlashcardSession = async (req, res) => {
  const { sessionName, studyCards, transcript } = req.body; // Include transcript
  const userId = req.user.id;

  // Basic validation
  if (!sessionName || !Array.isArray(studyCards) || !transcript) {
    return res
      .status(400)
      .json({ error: "sessionName, studyCards, and transcript are required." });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    const newSession = {
      userId: new ObjectId(userId),
      studySession: sessionName,
      flashcardsJSON: studyCards,
      transcript: transcript, // Save transcript
      createdDate: new Date(),
    };

    const result = await flashcardsCollection.insertOne(newSession);

    res.status(201).json({
      message: "Flashcard session created successfully.",
      flashcard: {
        id: result.insertedId,
        studySession: newSession.studySession,
        flashcardsJSON: newSession.flashcardsJSON,
        transcript: newSession.transcript,
        createdDate: newSession.createdDate,
      },
    });
  } catch (error) {
    console.error("Create Flashcard Session Error:", error);
    res
      .status(500)
      .json({ error: "Server error while creating flashcard session." });
  }
};

/**
 * Add flashcards to an existing session
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addFlashcardsToSession = async (req, res) => {
  const { id } = req.params; // Flashcard session ID
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
    res.status(500).json({ error: "Server error while adding flashcards." });
  }
};

/**
 * Retrieve all flashcard sessions for the logged-in user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserFlashcards = async (req, res) => {
  const userId = req.user.id;

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    const sessions = await flashcardsCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Map sessions to a cleaner format
    const formattedSessions = sessions.map((session) => ({
      id: session._id,
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      transcript: session.transcript,
      createdDate: session.createdDate,
    }));

    res.status(200).json({ flashcards: formattedSessions });
  } catch (error) {
    console.error("Get User Flashcards Error:", error);
    res
      .status(500)
      .json({ error: "Server error while retrieving flashcards." });
  }
};

/**
 * Retrieve a single flashcard session by ID
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFlashcardSessionById = async (req, res) => {
  const { id } = req.params; // Flashcard session ID
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

    res.status(200).json({
      id: session._id,
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      transcript: session.transcript,
      createdDate: session.createdDate,
    });
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
  const { id } = req.params; // Flashcard session ID
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
  const { id } = req.params; // Flashcard session ID
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
 * Generate additional flashcards for an existing session
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateAdditionalFlashcards = async (req, res) => {
  const { id } = req.params; // Flashcard session ID
  const userId = req.user.id;

  try {
    const db = getDB();
    const flashcardsCollection = db.collection("flashcards");

    // Fetch the session
    const session = await flashcardsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!session) {
      return res.status(404).json({ error: "Flashcard session not found." });
    }

    const { transcript, flashcardsJSON } = session;

    // Prepare data for OpenAI API
    const existingQuestions = flashcardsJSON.map((card) => card.question);

    // Call OpenAI API to generate new flashcards
    const newFlashcards = await generateFlashcards(
      transcript,
      existingQuestions
    );

    // Add new flashcards to the session
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { flashcardsJSON: { $each: newFlashcards } } }
    );

    res.status(200).json({
      message: "Additional flashcards generated successfully.",
      newFlashcards,
    });
  } catch (error) {
    console.error("Generate Additional Flashcards Error:", error);
    res
      .status(500)
      .json({ error: "Server error while generating additional flashcards." });
  }
};

/**
 * Helper function to generate flashcards using OpenAI API
 *
 * @param {string} transcript - The transcript text.
 * @param {Array} existingQuestions - Array of existing flashcard questions.
 * @returns {Array} - An array of new flashcards.
 */
async function generateFlashcards(transcript, existingQuestions) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const prompt = `
    Convert the following transcript into 10 more study flashcards in JSON format (return this as text, do NOT return this in markdown).
    Each flashcard should be an object with "question" and "answer" fields.
    Ensure that the flashcards cover the important information in the transcript.
    Do not duplicate already existing flashcards.
    
    Transcript:
    ${transcript}

    Already Existing Flashcards:
    ${existingQuestions.join("\n")}
    
    Please provide the flashcards in the following JSON format:
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
  `;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini", // Use the appropriate model
      messages: [{ role: "user", content: prompt.trim() }],
      max_tokens: 10000,
      temperature: 0.2,
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
    console.log(`API Response: ${flashcardsText}`);
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
