const axios = require("axios");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
require("dotenv").config();

/**
 * Start or continue an AI chat session with the transcript context.
 */
exports.createChat = async (req, res) => {
  const userId = req.user.id;
  const { uploadId, userMessage, folderID } = req.body;

  if (!uploadId || !userMessage) {
    return res
      .status(400)
      .json({ error: "uploadId and userMessage are required." });
  }

  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    // Get the transcript
    const uploadDoc = await uploadsCollection.findOne({
      _id: new ObjectId(uploadId),
      userId: new ObjectId(userId),
    });

    if (!uploadDoc) {
      return res
        .status(404)
        .json({ error: "Upload not found or not owned by user." });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res
        .status(500)
        .json({ error: "OpenAI API key is not configured." });
    }

    // Construct the system prompt
    const systemPrompt = `
      You have the following transcript as context:
      ${uploadDoc.transcript}

      The user will ask a question or talk about the transcript. Use the transcript to inform your answer.
      If the question is unrelated or cannot be answered from the transcript, say so politely.
      Also generate a short yet descriptive chat name.
      
      The final JSON format should be:
      [
        "chatName",
        "answer"
      ]

      Requirements:
      - Return only the JSON array in the exact format specified.
      - Index 0: A short sessionName (string).
      - Index 1: The answer to the user question, based on the transcript context.
      - Politely, yet firmly decline to answer outside of the transcript context.
      - Ensure the JSON is valid and can be parsed.
      - Do not include disclaimers or extraneous commentary.
      - Answer in the language that the user uses.
    `;

    const messages = [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: userMessage.trim() },
    ];

    // Call OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages,
        max_tokens: 15000,
        temperature: 0.2,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    let assistantReply = response.data.choices[0].message.content.trim();
    // Strip triple backticks if present
    if (assistantReply.startsWith("```") && assistantReply.endsWith("```")) {
      assistantReply = assistantReply.slice(3, -3).trim();
    }

    // Parse the [sessionName, answer]
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(assistantReply);
    } catch (parseError) {
      console.error("Error parsing summary JSON:", parseError);
      console.error("Summary Text:", assistantReply);
      return res.status(500).json({ error: "Failed to parse summary JSON." });
    }

    // Validate the 2-element array format
    if (
      !Array.isArray(parsedResponse) ||
      parsedResponse.length !== 2 ||
      typeof parsedResponse[0] !== "string" ||
      typeof parsedResponse[1] !== "string"
    ) {
      return res.status(500).json({
        error: "Invalid format: Expected [sessionName, answer].",
      });
    }

    const sessionName = parsedResponse[0];
    const answer = parsedResponse[1];

    // Save the entire chat turn to the DB
    const aiChatsCollection = db.collection("aichats");
    const newChat = {
      uploadId: new ObjectId(uploadId),
      userId: new ObjectId(userId),
      folderID: folderID,
      studySession: sessionName,
      messagesJSON: [
        {
          role: "user",
          content: userMessage,
          timestamp: new Date(),
        },
        {
          role: "assistant",
          content: answer,
          timestamp: new Date(),
        },
      ],
      createdDate: new Date(),
    };

    const insertResult = await aiChatsCollection.insertOne(newChat);

    // Return newly created chat doc
    res.status(201).json({
      message: "AI Chat created successfully.",
      chat: { id: insertResult.insertedId.toString(), ...newChat },
    });
  } catch (error) {
    console.error("AI Chat Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Server error while creating AI chat." });
  }
};

/**
 * Get all AI chats for the logged-in user
 */
exports.getAllChats = async (req, res) => {
  const userId = req.user.id;
  try {
    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    const chats = await aiChatsCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Convert _id to id
    const formatted = chats.map((doc) => ({
      id: doc._id.toString(),
      uploadId: doc.uploadId,
      userId: doc.userId,
      folderID: doc.folderID || null,
      studySession: doc.studySession,
      messagesJSON: doc.messagesJSON,
      createdDate: doc.createdDate,
    }));

    res.status(200).json({ chats: formatted });
  } catch (error) {
    console.error("Get All Chats Error:", error);
    res.status(500).json({ error: "Server error while retrieving AI chats." });
  }
};

/**
 * Retrieve a single AI Chat by ID
 */
exports.getChatById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    const chat = await aiChatsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!chat) {
      return res.status(404).json({ error: "AI Chat not found." });
    }

    const formattedChat = {
      id: chat._id.toString(),
      uploadId: chat.uploadId,
      userId: chat.userId,
      folderID: chat.folderID || null,
      studySession: chat.studySession,
      messagesJSON: chat.messagesJSON,
      createdDate: chat.createdDate,
    };

    res.status(200).json({ chat: formattedChat });
  } catch (error) {
    console.error("Get Chat By ID Error:", error);
    res.status(500).json({ error: "Server error while retrieving AI Chat." });
  }
};

/**
 * Delete an AI Chat
 */
exports.deleteChat = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    const chat = await aiChatsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!chat) {
      return res.status(404).json({ error: "AI Chat not found." });
    }

    await aiChatsCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "AI Chat deleted successfully." });
  } catch (error) {
    console.error("Delete AI Chat Error:", error);
    res.status(500).json({ error: "Server error while deleting AI Chat." });
  }
};

/**
 * Rename an AI Chat session
 */
exports.renameAiChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const userId = req.user.id;

    if (!newName) {
      return res.status(400).json({ error: "newName is required." });
    }

    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    // Verify ownership
    const chat = await aiChatsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!chat) {
      return res.status(404).json({ error: "AI Chat not found." });
    }

    await aiChatsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { studySession: newName } }
    );

    return res.status(200).json({ message: "AI Chat renamed successfully." });
  } catch (error) {
    console.error("renameAiChat error:", error);
    res.status(500).json({ error: "Server error while renaming AI Chat." });
  }
};

// At the bottom (or wherever appropriate):
exports.getChatsByFolderID = async (req, res) => {
  const userId = req.user.id;
  const { folderID } = req.params; // from /aichats/folder/:folderID

  const folderValue = folderID === "null" ? null : folderID;

  try {
    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    // Find all aiChats matching user + folderID
    const docs = await aiChatsCollection
      .find({
        userId: new ObjectId(userId),
        folderID: folderValue,
      })
      .toArray();

    const formatted = docs.map((doc) => ({
      id: doc._id.toString(),
      uploadId: doc.uploadId,
      userId: doc.userId,
      folderID: doc.folderID || null,
      studySession: doc.studySession,
      messagesJSON: doc.messagesJSON,
      createdDate: doc.createdDate,
    }));

    res.status(200).json({ chats: formatted });
  } catch (error) {
    console.error("getChatsByFolderID Error:", error);
    res
      .status(500)
      .json({ error: "Server error while retrieving AI chats by folder." });
  }
};

/**
 * Assign a folder to an AI chat
 */
exports.assignFolderToChat = async (req, res) => {
  const { id } = req.params;
  const { folderID } = req.body;
  const userId = req.user.id;

  if (!id) {
    return res.status(400).json({ error: "Chat ID is required." });
  }

  try {
    const db = getDB();
    const chatsCollection = db.collection("aichats");

    // Verify that the chat exists and belongs to the user
    const chat = await chatsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found." });
    }

    // Update the chat to assign the folder
    await chatsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { folderID } }
    );

    res.status(200).json({ message: "Folder assigned to chat successfully." });
  } catch (error) {
    console.error("Error assigning folder to chat:", error);
    res.status(500).json({ error: "Server error assigning folder to chat." });
  }
};
