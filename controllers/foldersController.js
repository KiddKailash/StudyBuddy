const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

/**
 * Create a new folder for the user.
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
