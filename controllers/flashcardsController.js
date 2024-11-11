const { getDB } = require('../utils/db');
const { ObjectId } = require('mongodb');

/**
 * Create a new flashcard session
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createFlashcardSession = async (req, res) => {
  const { sessionName, studyCards } = req.body;
  const userId = req.user.id;

  console.log('Received createFlashcardSession request:');
  console.log('Session Name:', sessionName);
  console.log('Study Cards:', studyCards);

  // Basic validation
  if (!sessionName || !Array.isArray(studyCards)) {
    return res.status(400).json({ error: 'sessionName and studyCards are required.' });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection('flashcards');

    const newSession = {
      userId: new ObjectId(userId),
      studySession: sessionName, // Updated to camelCase
      flashcardsJSON: studyCards, // Updated to camelCase
      createdDate: new Date(), // Updated to camelCase
    };

    const result = await flashcardsCollection.insertOne(newSession);

    res.status(201).json({
      message: 'Flashcard session created successfully.',
      flashcard: {
        id: result.insertedId,
        studySession: newSession.studySession,
        flashcardsJSON: newSession.flashcardsJSON,
        createdDate: newSession.createdDate,
      },
    });
  } catch (error) {
    console.error('Create Flashcard Session Error:', error);
    res.status(500).json({ error: 'Server error while creating flashcard session.' });
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
    return res.status(400).json({ error: 'studyCards (non-empty array) are required.' });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection('flashcards');

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    if (!session) {
      return res.status(404).json({ error: 'Flashcard session not found.' });
    }

    // Update the session by pushing new flashcards
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $push: { flashcardsJSON: { $each: studyCards } } }
    );

    res.status(200).json({ message: 'Flashcards added successfully to the session.' });
  } catch (error) {
    console.error('Add Flashcards Error:', error);
    res.status(500).json({ error: 'Server error while adding flashcards.' });
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
    const flashcardsCollection = db.collection('flashcards');

    const sessions = await flashcardsCollection.find({ userId: new ObjectId(userId) }).toArray();

    // Map sessions to a cleaner format
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      createdDate: session.createdDate,
    }));

    res.status(200).json({ flashcards: formattedSessions });
  } catch (error) {
    console.error('Get User Flashcards Error:', error);
    res.status(500).json({ error: 'Server error while retrieving flashcards.' });
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
      { projection: { flashcardsJSON: 1, studySession: 1, createdDate: 1 } }
    );

    if (!session) {
      return res.status(404).json({ error: 'Flashcard session not found.' });
    }

    res.status(200).json({
      id: session._id,
      studySession: session.studySession,
      flashcardsJSON: session.flashcardsJSON,
      createdDate: session.createdDate,
    });
  } catch (error) {
    console.error('Get Flashcard Session By ID Error:', error);
    res.status(500).json({ error: 'Server error while retrieving flashcard session.' });
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
    const flashcardsCollection = db.collection('flashcards');

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    if (!session) {
      return res.status(404).json({ error: 'Flashcard session not found.' });
    }

    // Delete the session
    await flashcardsCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: 'Flashcard session deleted successfully.' });
  } catch (error) {
    console.error('Delete Flashcard Session Error:', error);
    res.status(500).json({ error: 'Server error while deleting flashcard session.' });
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
    return res.status(400).json({ error: 'sessionName is required.' });
  }

  try {
    const db = getDB();
    const flashcardsCollection = db.collection('flashcards');

    // Verify that the session exists and belongs to the user
    const session = await flashcardsCollection.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });

    if (!session) {
      return res.status(404).json({ error: 'Flashcard session not found.' });
    }

    // Update the session name
    await flashcardsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { studySession: sessionName, updatedDate: new Date() } }
    );

    res.status(200).json({ message: 'Flashcard session name updated successfully.' });
  } catch (error) {
    console.error('Update Flashcard Session Name Error:', error);
    res.status(500).json({ error: 'Server error while updating flashcard session name.' });
  }
};
