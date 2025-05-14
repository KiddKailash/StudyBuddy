/**
 * Folders Controller
 * 
 * Manages the organization structure for user content through folders.
 * Provides endpoints for creating, retrieving, updating, and deleting folders.
 * Supports organization of uploads, flashcards, summaries, and other study materials.
 */
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

/**
 * Create a new folder for the user.
 * 
 * Creates a new organizational folder for the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created folder or error
 */
exports.createFolder = async (req, res) => {
  const { folderName } = req.body;
  const userId = req.user.id;

  if (!folderName) {
    return res.status(400).json({ error: "folderName is required." });
  }

  try {
    const db = getDB();
    const foldersCollection = db.collection("folders");

    const newFolder = {
      userId: new ObjectId(userId),
      folderName,
      createdAt: new Date(),
    };

    const result = await foldersCollection.insertOne(newFolder);

    res.status(201).json({
      message: "Folder created successfully.",
      folder: { id: result.insertedId.toString(), ...newFolder },
    });
  } catch (error) {
    console.error("Create Folder Error:", error);
    res.status(500).json({ error: "Server error while creating folder." });
  }
};

/**
 * Retrieve all folders for the current user.
 * 
 * Gets all folders belonging to the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of folder objects or error
 */
exports.getFolders = async (req, res) => {
  const userId = req.user.id;
  try {
    const db = getDB();
    const foldersCollection = db.collection("folders");

    const folders = await foldersCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Convert _id to id
    const formattedFolders = folders.map((folder) => ({
      id: folder._id.toString(),
      folderName: folder.folderName,
      createdAt: folder.createdAt,
    }));

    res.status(200).json({ folders: formattedFolders });
  } catch (error) {
    console.error("Error retrieving folders:", error);
    res.status(500).json({ error: "Server error retrieving folders." });
  }
};

/**
 * Rename a folder
 * 
 * Updates the name of an existing folder.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.renameFolder = async (req, res) => {
  try {
    const { id } = req.params; // folder's id
    const { newName } = req.body;
    const userId = req.user.id;

    if (!newName) {
      return res.status(400).json({ error: "newName is required." });
    }

    const db = getDB();
    const foldersCollection = db.collection("folders");

    const folder = await foldersCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found." });
    }

    await foldersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { folderName: newName } }
    );

    return res.status(200).json({ message: "Folder renamed successfully." });
  } catch (error) {
    console.error("renameFolder error:", error);
    res.status(500).json({ error: "Server error while renaming folder." });
  }
};

/**
 * Delete a folder
 * 
 * Removes a folder from the user's account.
 * Note: Resources in this folder won't be deleted, they'll just become "unfoldered".
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params; // folder's id
    const userId = req.user.id;

    const db = getDB();
    const foldersCollection = db.collection("folders");

    const folder = await foldersCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!folder) {
      return res.status(404).json({ error: "Folder not found." });
    }

    // Delete the folder
    await foldersCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    // Note: Resources in this folder won't be deleted, they'll just become "unfoldered"
    // You could implement cascading deletion or resource reassignment if needed

    return res.status(200).json({ message: "Folder deleted successfully." });
  } catch (error) {
    console.error("deleteFolder error:", error);
    res.status(500).json({ error: "Server error while deleting folder." });
  }
};
