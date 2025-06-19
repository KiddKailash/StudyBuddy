/**
 * Database Migration Script - Folder ID Addition
 * 
 * Utility script for migrating existing flashcard sessions to support folder organization.
 * Updates all documents in the flashcards collection by adding a folderID field
 * to enable folder-based organization of study materials.
 */

const { connectDB, getDB } = require('../database/db');
const { ObjectId } = require('mongodb');

/**
 * Updates all flashcard sessions in the database to include a folderID field.
 * 
 * Performs a bulk migration operation to add folder organization support
 * to existing flashcard sessions. This is typically run once when implementing
 * the folder feature to ensure all existing data is compatible.
 * 
 * Process Flow:
 * 1. Establishes database connection using connectDB utility
 * 2. Accesses flashcards collection for bulk operations
 * 3. Defines default folder ID value (null for unorganized items)
 * 4. Performs bulk update on all flashcard documents
 * 5. Reports results and exits with appropriate status code
 * 
 * Migration Strategy:
 * - Uses updateMany() for efficient bulk operations
 * - Sets folderID to null by default (unorganized items)
 * - Can be customized to assign specific folder IDs if needed
 * - Safe operation that can be run multiple times
 * 
 * @async
 * @function addFolderIdToSessions
 * @returns {Promise<void>}
 * @throws {Error} If database connection or update operations fail
 */
async function addFolderIdToSessions() {
  try {
    // Step 1: Establish database connection and get flashcards collection
    await connectDB();
    const db = getDB();
    const flashcardsCollection = db.collection('flashcards');

    // Step 2: Define default folder ID for migration
    // Options: null (unorganized), string ID, or new ObjectId()
    // Using null as default to mark existing items as unorganized
    const defaultFolderId = null;
    
    // Alternative options for different migration strategies:
    // const defaultFolderId = new ObjectId(); // Create new folder for all items
    // const defaultFolderId = "existing-folder-id"; // Assign to specific folder

    // Step 3: Perform bulk update on all flashcard sessions
    // updateMany() efficiently updates all documents matching the filter
    // Empty filter {} means update all documents in the collection
    const result = await flashcardsCollection.updateMany(
      {}, // No filter: update all documents in collection
      { $set: { folderID: defaultFolderId } } // Add folderID field to all documents
    );

    // Step 4: Report migration results
    console.log(`Successfully updated ${result.modifiedCount} flashcard sessions with folderID.`);
    
    // Exit process with success code (0) on completion
    process.exit(0);
  } catch (error) {
    // Handle any errors during migration and exit with failure code (1)
    console.error("Error updating flashcard sessions:", error);
    process.exit(1);
  }
}

// Execute the migration function immediately when script is run
addFolderIdToSessions();
