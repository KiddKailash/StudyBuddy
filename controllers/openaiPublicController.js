const axios = require("axios");
require("dotenv").config();

/**
 * Public (unauthenticated) version of generateFlashcards,
 * called via /api/openai/generate-flashcards-public.
 * Returns data in the format: [ sessionName, [ ...flashcards ] ]
 */
exports.generateFlashcardsPublic = async (req, res) => {
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
        - Ignore information within the transcript pertaining to personnel or course structure. Flashcards are for educational content.
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o", // or "gpt-4"
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

    // Remove triple backticks if present
    let flashcardsText = response.data.choices[0].message.content.trim();
    if (flashcardsText.startsWith("```") && flashcardsText.endsWith("```")) {
      flashcardsText = flashcardsText.slice(3, -3).trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(flashcardsText); // Expecting a 2-element array
    } catch (parseError) {
      console.error("Error parsing flashcards JSON:", parseError);
      console.error("Flashcards Text:", flashcardsText);
      return res
        .status(500)
        .json({ error: "Failed to parse flashcards JSON." });
    }

    // Validate the 2-element array structure: [ sessionName, flashcardsArray ]
    if (
      !Array.isArray(parsedData) ||
      parsedData.length !== 2 ||
      typeof parsedData[0] !== "string" ||
      !Array.isArray(parsedData[1])
    ) {
      return res.status(500).json({
        error:
          "Invalid format from OpenAI. Expected [sessionName, [{question,answer}...]].",
      });
    }

    const sessionName = parsedData[0];
    const flashcardsArray = parsedData[1];

    // Validate each flashcard object
    if (
      !flashcardsArray.every(
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

    // Return the same structure to the frontend
    // So the frontend can do: const [sessionName, flashcards] = resp.data.flashcards;
    // We'll nest them under 'flashcards' property to match the frontend usage
    res.status(200).json({ flashcards: parsedData });
  } catch (error) {
    console.error(
      "Error generating public flashcards via OpenAI:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error generating flashcards via OpenAI." });
  }
};
