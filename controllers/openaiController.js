const axios = require("axios");
require("dotenv").config();

/**
 * Generates flashcards using OpenAI API based on the provided transcript.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.generateFlashcards = async (req, res) => {
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
    Convert the following transcript into 10 study flashcards in JSON format (return this as text, do NOT return this in markdown).
    Each flashcard should be an object with "question" and "answer" fields.
    The flashcards must cover information within the transcript.
    
    Transcript:
    ${transcript}
    
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
     - Create the flashcards in the same language as the transcript.
      `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o", // or 'gpt-4' (8,192 tokens) or 'gpt-4o-mini' (16,384 tokens)
        messages: [
          { role: "user", content: prompt.trim() },
        ],
        max_tokens: 15000,
        temperature: 0.3,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    // Remove triple backticks from the response if present
    let flashcardsText = response.data.choices[0].message.content.trim();
    if (flashcardsText.startsWith("```") && flashcardsText.endsWith("```")) {
      flashcardsText = flashcardsText.slice(3, -3).trim();
    }

    // Attempt to parse the JSON
    let flashcards;
    try {
      flashcards = JSON.parse(flashcardsText);
    } catch (parseError) {
      console.error("Error parsing flashcards JSON:", parseError);
      console.error("Flashcards Text:", flashcardsText);
      return res
        .status(500)
        .json({ error: "Failed to parse flashcards JSON." });
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
      return res
        .status(500)
        .json({ error: "Invalid flashcards format received from OpenAI." });
    }

    res.status(200).json({ flashcards });
  } catch (error) {
    console.error(
      "Error generating flashcards via OpenAI:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error generating flashcards via OpenAI." });
  }
};
