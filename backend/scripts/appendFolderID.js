/**
 * @fileoverview Script to append a folderID field to all existing flashcard sessions in MongoDB.
 * 
 * This utility script updates all documents in the flashcards collection by adding
 * a folderID field set to null (or any specified value). This is useful when
 * implementing a folder organization feature and need to migrate existing data.
 * 
 * @author StudyBuddy Team
 */

const { connectDB, getDB } = require('../database/db');
const { ObjectId } = require('mongodb');

/**
 * Updates all flashcard sessions in the database to include a folderID field.
 * 
 * This function:
 * 1. Connects to the MongoDB database
 * 2. Fetches the flashcards collection
 * 3. Updates all documents by setting a default folderID
 * 4. Logs the results and exits the process
 * 
 * @async
 * @returns {Promise<void>}
 */
async function addFolderIdToSessions() {
  try {
    // Connect to the MongoDB database
    await connectDB();
    const db = getDB();
    const flashcardsCollection = db.collection('flashcards');

    // Define a default folderID.
    // You can either use a string or create a new ObjectId:
    // const defaultFolderId = new ObjectId(); // if you need an ObjectId
    const defaultFolderId = null;

    // Update every flashcard session by setting the folderID field.
    // This will add folderID to every document (or overwrite it if it already exists).
    const result = await flashcardsCollection.updateMany(
      {}, // No filter: update all documents.
      { $set: { folderID: defaultFolderId } }
    );

    console.log(`Successfully updated ${result.modifiedCount} flashcard sessions with folderID.`);
    process.exit(0);
  } catch (error) {
    console.error("Error updating flashcard sessions:", error);
    process.exit(1);
  }
}

// Execute the function
addFolderIdToSessions();
