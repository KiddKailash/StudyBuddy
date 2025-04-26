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

    // Remove triple backticks from the response if present
    let flashcardsText = response.data.choices[0].message.content.trim();
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

    // Validate the new 2-element array format
    // Expect: [ sessionName (string), arrayOfFlashcards (array of objects) ]
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

    // Validate the flashcards array
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

