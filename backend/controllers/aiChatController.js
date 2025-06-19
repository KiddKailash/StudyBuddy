/**
 * AI Chat Controller
 * 
 * Handles AI-assisted chat interactions based on transcript context.
 * Provides endpoints for creating new chat sessions, retrieving chat history,
 * continuing conversations, and managing chat data.
 * Uses OpenAI API to generate context-aware responses from transcript content.
 */
const axios = require("axios");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
require("dotenv").config();

/**
 * Start or continue an AI chat session with the transcript context.
 * 
 * Creates a new chat session based on the provided transcript and user message.
 * Uses OpenAI to generate a response and chat session name.
 * 
 * Process Flow:
 * 1. Validates user ownership of the upload
 * 2. Constructs OpenAI prompt with transcript context
 * 3. Calls OpenAI API to generate response and session name
 * 4. Parses and validates the JSON response
 * 5. Stores chat session in database
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.uploadId - ID of the upload to chat about
 * @param {string} req.body.userMessage - User's message/question
 * @param {string} [req.body.folderID] - Optional folder ID for organization
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created chat or error
 */
exports.createChat = async (req, res) => {
  const userId = req.user.id;
  const { uploadId, userMessage, folderID } = req.body;

  // Validate required parameters
  if (!uploadId || !userMessage) {
    return res
      .status(400)
      .json({ error: "uploadId and userMessage are required." });
  }

  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    // Get the transcript from the upload document
    const uploadDoc = await uploadsCollection.findOne({
      _id: new ObjectId(uploadId),
      userId: new ObjectId(userId),
    });

    if (!uploadDoc) {
      return res
        .status(404)
        .json({ error: "Upload not found or not owned by user." });
    }

    // Validate OpenAI API key configuration
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res
        .status(500)
        .json({ error: "OpenAI API key is not configured." });
    }

    // Construct the system prompt with transcript context
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

    // Prepare messages for OpenAI API call
    const messages = [
      { role: "system", content: systemPrompt.trim() },
      { role: "user", content: userMessage.trim() },
    ];

    // Make API call to OpenAI for chat generation
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages,
        max_tokens: 15000,
        temperature: 0.2, // Moderate temperature for balanced creativity and accuracy
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    // Extract and clean the response text
    let assistantReply = response.data.choices[0].message.content.trim();
    // Remove markdown code block formatting if present
    if (assistantReply.startsWith("```") && assistantReply.endsWith("```")) {
      assistantReply = assistantReply.slice(3, -3).trim();
    }

    // Parse the [sessionName, answer] response from OpenAI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(assistantReply);
    } catch (parseError) {
      console.error("Error parsing summary JSON:", parseError);
      console.error("Summary Text:", assistantReply);
      return res.status(500).json({ error: "Failed to parse summary JSON." });
    }

    // Validate the expected 2-element array format: [sessionName, answer]
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

    // Save the entire chat turn to the database
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

    // Return newly created chat document
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
 * 
 * Retrieves all chat sessions belonging to the authenticated user.
 * Returns chats in a consistent format with proper ID conversion.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of chat objects or error
 */
exports.getAllChats = async (req, res) => {
  const userId = req.user.id;
  try {
    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    // Fetch all chats for the user
    const chats = await aiChatsCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Convert _id to id for consistent response format
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
 * 
 * Fetches a specific chat session by its ID for the authenticated user.
 * Validates user ownership before returning the chat data.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Chat ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with chat data or error
 */
exports.getChatById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    // Find chat and verify user ownership
    const chat = await aiChatsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!chat) {
      return res.status(404).json({ error: "AI Chat not found." });
    }

    // Format response with consistent ID field
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
 * 
 * Permanently removes an AI chat session owned by the authenticated user.
 * Validates user ownership before deletion to ensure security.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Chat ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.deleteChat = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    // Verify chat exists and belongs to user before deletion
    const chat = await aiChatsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!chat) {
      return res.status(404).json({ error: "AI Chat not found." });
    }

    // Delete the chat from database
    await aiChatsCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "AI Chat deleted successfully." });
  } catch (error) {
    console.error("Delete AI Chat Error:", error);
    res.status(500).json({ error: "Server error while deleting AI Chat." });
  }
};

/**
 * Rename an AI Chat session
 * 
 * Updates the name of an existing AI chat session.
 * Validates user ownership and ensures the new name is provided.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Chat ID to rename
 * @param {Object} req.body - Request body
 * @param {string} req.body.newName - New name for the chat session
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.renameAiChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const userId = req.user.id;

    // Validate required new name
    if (!newName) {
      return res.status(400).json({ error: "newName is required." });
    }

    const db = getDB();
    const aiChatsCollection = db.collection("aichats");

    // Verify chat exists and belongs to user
    const chat = await aiChatsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!chat) {
      return res.status(404).json({ error: "AI Chat not found." });
    }

    // Update the chat session name
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

/**
 * Get AI chats by folder ID
 * 
 * Retrieves all AI chat sessions in a specific folder for the authenticated user.
 * Handles special case where folderID is "null" to find unorganized chats.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.folderID - Folder ID to filter by (or "null" for unorganized)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of chat objects or error
 */
exports.getChatsByFolderID = async (req, res) => {
  const userId = req.user.id;
  const { folderID } = req.params; // from /aichats/folder/:folderID

  // Handle special case where "null" string represents unorganized chats
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

    // Format response with consistent ID field
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
 * 
 * Updates an AI chat to associate it with a specific folder.
 * Used for organizing chat content within the user's folder structure.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Chat ID to assign folder to
 * @param {Object} req.body - Request body
 * @param {string} req.body.folderID - Folder ID to assign
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.assignFolderToChat = async (req, res) => {
  const { id } = req.params;
  const { folderID } = req.body;
  const userId = req.user.id;

  // Validate required chat ID
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
