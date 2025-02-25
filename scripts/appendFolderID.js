const { connectDB, getDB } = require('../database/db');
const { ObjectId } = require('mongodb');

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

addFolderIdToSessions();
