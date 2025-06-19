/**
 * OpenAI Controller
 * 
 * Provides endpoints for interacting with the OpenAI API.
 * Handles flashcard generation, question answering, and text completion.
 * Supports both authenticated and public endpoints with different usage limits.
 * Manages API interactions and response parsing for OpenAI services.
 */
const axios = require("axios");
require("dotenv").config();
const { getDB } = require("../database/db");

// OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

/**
 * Generates flashcards using OpenAI API based on the provided transcript.
 * 
 * Creates a set of study flashcards with questions and answers from transcript content.
 * Returns a structured JSON response with session name and flashcard array.
 * 
 * Process Flow:
 * 1. Validates transcript input
 * 2. Constructs OpenAI prompt for flashcard generation
 * 3. Calls OpenAI API with specific format requirements
 * 4. Parses and validates the JSON response
 * 5. Returns formatted flashcard data
 * 
 * @param {Object} req - Express request object with transcript in request body
 * @param {Object} req.body - Request body
 * @param {string} req.body.transcript - Text content to generate flashcards from
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with flashcards array or error
 */
exports.generateFlashcards = async (req, res) => {
  const { transcript } = req.body;

  // Validate required input
  if (!transcript) {
    return res.status(400).json({ error: "Transcript is required." });
  }

  try {
    // Validate OpenAI API key configuration
    if (!openaiApiKey) {
      return res
        .status(500)
        .json({ error: "OpenAI API key is not configured." });
    }

    // Construct prompt for flashcard generation with specific format requirements
    const prompt = `
    Convert the following transcript into 15 study flashcards in JSON format (return this as text, do NOT return this in markdown).
    Also generate a short session name. The final JSON format should be:
    [
      "sessionName",
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
    ]

    Transcript:
    ${transcript}

    Requirements:
      - Return only the JSON array in the exact format specified.
      - Index 0: A short sessionName (string).
      - Index 1: An array of flashcard objects, each with "question" and "answer" fields.
      - No extra text, explanations, or code snippets.
      - Do not use markdown formatting or code blocks.
      - Ensure the JSON is valid and can be parsed.
      - Create the flashcards in the same language as the transcript.
      - Ignore information within the transcript pertaining to personnel, course structure, or course tools. Flashcards are for educational content.
  `;

    // Make API call to OpenAI for flashcard generation
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: 15000,
        temperature: 0.1, // Low temperature for consistent, focused flashcards
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    // Extract and clean the response text
    let flashcardsText = response.data.choices[0].message.content.trim();
    // Remove markdown code block formatting if present
    if (flashcardsText.startsWith("```") && flashcardsText.endsWith("```")) {
      flashcardsText = flashcardsText.slice(3, -3).trim();
    }

    // Parse the JSON response from OpenAI
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

    // Validate the expected 2-element array format: [sessionName, arrayOfFlashcards]
    if (
      !Array.isArray(parsedResponse) ||
      parsedResponse.length !== 2 ||
      typeof parsedResponse[0] !== "string" ||
      !Array.isArray(parsedResponse[1])
    ) {
      return res.status(500).json({
        error:
          "Invalid format: Expected [sessionName, [{question, answer}...]].",
      });
    }

    const sessionName = parsedResponse[0];
    const flashcards = parsedResponse[1];

    // Validate the flashcards array structure
    if (
      !flashcards.every(
        (card) =>
          typeof card === "object" &&
          typeof card.question === "string" &&
          typeof card.answer === "string"
      )
    ) {
      return res.status(500).json({
        error: "Invalid flashcards format received from OpenAI.",
      });
    }

    res.status(200).json({ flashcards: parsedResponse });
  } catch (error) {
    console.error(
      "Error generating flashcards via OpenAI:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error generating flashcards via OpenAI." });
  }
};

/**
 * Public endpoint for generating text responses from OpenAI.
 * 
 * Available without authentication for limited usage.
 * Uses OpenAI completions API with the text-davinci-003 model.
 * 
 * @param {Object} req - Express request object with prompt in request body
 * @param {Object} req.body - Request body
 * @param {string} req.body.prompt - Text prompt for AI completion
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with AI-generated text or error
 */
exports.generatePublicResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Validate required input
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Validate OpenAI API key configuration
    if (!openaiApiKey) {
      return res.status(500).json({ error: "OpenAI API key is not configured." });
    }

    // Make API call to OpenAI for text completion
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 2000, // Limited tokens for public endpoint
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    res.json({ response: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

/**
 * Authenticated endpoint for generating text responses from OpenAI.
 * 
 * Provides different token limits based on user subscription status.
 * Uses OpenAI completions API with the text-davinci-003 model.
 * Stores conversation history for authenticated users.
 * 
 * Process Flow:
 * 1. Validates user authentication and prompt input
 * 2. Checks user subscription status for token limits
 * 3. Makes API call to OpenAI with appropriate limits
 * 4. Stores conversation in history database
 * 5. Returns AI response to user
 * 
 * @param {Object} req - Express request object with prompt in request body
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.prompt - Text prompt for AI completion
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with AI-generated text or error
 */
exports.generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id;
    
    // Validate required input
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Validate OpenAI API key configuration
    if (!openaiApiKey) {
      return res.status(500).json({ error: "OpenAI API key is not configured." });
    }

    // Get user's subscription status to determine token limits
    const db = getDB();
    const user = await db.collection("users").findOne({ _id: userId });
    
    // Configure token limit based on subscription status
    const maxTokens = user.isPro ? 4000 : 2000;

    // Make API call to OpenAI for text completion
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: maxTokens,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    // Store the interaction in history for authenticated users
    await db.collection("aiHistory").insertOne({
      userId,
      prompt,
      response: response.data.choices[0].text,
      timestamp: new Date(),
    });

    res.json({ response: response.data.choices[0].text.trim() });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};

