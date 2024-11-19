const { getDB } = require('../utils/db');
const { ObjectId } = require('mongodb');
const axios = require('axios');

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
    return res.status(400).json({ error: 'sessionName, studyCards, and transcript are required.' });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection('flashcards');

    const newSession = {
      userId: new ObjectId(userId),
      studySession: sessionName,
      flashcardsJSON: studyCards,
      transcript: transcript, // Save transcript
      createdDate: new Date(),
    };

    const result = await flashcardsCollection.insertOne(newSession);

    res.status(201).json({
      message: 'Flashcard session created successfully.',
      flashcard: {
        id: result.insertedId,
        studySession: newSession.studySession,
        flashcardsJSON: newSession.flashcardsJSON,
        transcript: newSession.transcript,
        createdDate: newSession.createdDate,
      },
    });
  } catch (error) {
    console.error('Create Flashcard Session Error:', error);
    res.status(500).json({ error: 'Server error while creating flashcard session.' });
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
    const flashcardsCollection = db.collection('flashcards');

    const session = await flashcardsCollection.findOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      { projection: { flashcardsJSON: 1, studySession: 1, transcript: 1, createdDate: 1 } }
    );

    if (!session) {
      return res.status(404).json({ error: 'Flashcard session not found.' });
    }

    res.status(200).json({
      id: session._id,
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      transcript: session.transcript, // Include transcript
      createdDate: session.createdDate,
    });
  } catch (error) {
    console.error('Get Flashcard Session By ID Error:', error);
    res.status(500).json({ error: 'Server error while retrieving flashcard session.' });
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
    const flashcardsCollection = db.collection('flashcards');

    // Fetch the session
    const session = await flashcardsCollection.findOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) }
    );

    if (!session) {
      return res.status(404).json({ error: 'Flashcard session not found.' });
    }

    const { transcript, flashcardsJSON } = session;

    // Prepare data for OpenAI API
    const existingQuestions = flashcardsJSON.map((card) => card.question);

    // Call OpenAI API to generate new flashcards
    const newFlashcards = await generateFlashcards(transcript, existingQuestions);

    // Add new flashcards to the session
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { flashcardsJSON: { $each: newFlashcards } } }
    );

    res.status(200).json({ message: 'Additional flashcards generated successfully.', newFlashcards });
  } catch (error) {
    console.error('Generate Additional Flashcards Error:', error);
    res.status(500).json({ error: 'Server error while generating additional flashcards.' });
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
    throw new Error('OpenAI API key is not configured.');
  }

  const prompt = `
Given the following transcript, generate 10 new study flashcards in JSON format. Do not duplicate any of the existing questions provided.

Transcript:
${transcript}

Existing Questions:
${existingQuestions.join('\n')}

Please provide the flashcards in the following JSON format:
[
  {
    "question": "Question 1",
    "answer": "Answer 1"
  },
  ...
]
  `;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4', // Use the appropriate model
      messages: [{ role: 'user', content: prompt.trim() }],
      max_tokens: 1000,
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
    }
  );

  // Process the response
  let flashcardsText = response.data.choices[0].message.content.trim();
  if (flashcardsText.startsWith('```') && flashcardsText.endsWith('```')) {
    flashcardsText = flashcardsText.slice(3, -3).trim();
  }

  let flashcards;
  try {
    flashcards = JSON.parse(flashcardsText);
  } catch (parseError) {
    console.error('Error parsing flashcards JSON:', parseError);
    throw new Error('Failed to parse flashcards JSON.');
  }

  // Validate the flashcards format
  if (
    !Array.isArray(flashcards) ||
    !flashcards.every(
      (card) =>
        typeof card === 'object' &&
        typeof card.question === 'string' &&
        typeof card.answer === 'string'
    )
  ) {
    throw new Error('Invalid flashcards format received from OpenAI.');
  }

  return flashcards;
}
