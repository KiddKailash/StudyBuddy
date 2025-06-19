/**
 * Summary Controller
 * 
 * Manages the generation and retrieval of AI-powered summaries from transcripts.
 * Uses OpenAI to create concise summaries of uploaded documents.
 * Provides endpoints for creating new summaries, retrieving summary history,
 * and managing summary data.
 */
const axios = require("axios");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
require("dotenv").config();

/**
 * Create a summary from an upload's transcript
 * 
 * Generates a concise summary of an uploaded document's content using OpenAI.
 * Allows optional focus on specific topics through userMessage parameter.
 * Stores the summary in the database for future reference.
 * 
 * Process Flow:
 * 1. Validates user ownership of the upload
 * 2. Constructs OpenAI prompt with transcript content
 * 3. Calls OpenAI API to generate summary and session name
 * 4. Parses and validates the JSON response
 * 5. Stores the summary in the database
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.uploadId - ID of the upload to summarize
 * @param {string} [req.body.userMessage] - Optional focus topic for summary
 * @param {string} [req.body.folderID] - Optional folder ID for organization
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created summary or error
 */
exports.createSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uploadId, userMessage, folderID } = req.body;

    // Validate required parameters
    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required." });
    }

    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    // Verify user ownership of the upload document
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
      return res.status(500).json({ error: "OpenAI API key not configured." });
    }

    // Construct system prompt for summary generation
    // The prompt instructs OpenAI to return a specific JSON format: [sessionName, summary]
    const systemPrompt = `
      Summarize the following transcript in a short and concise manner, recapping only the critical details.
      Also generate a session name. The user may request that you focus on a particular topic within the transcript.
      The final JSON format should be:
      [
        "sessionName",
        "summary"
      ]

      Transcript:
      ${uploadDoc.transcript}

      
      Requirements:
        - Return only the JSON array in the exact format specified.
        - Index 0: A short sessionName (string).
        - Index 1: Transcript summary.
        - No disclaimers or extraneous commentary.
        - Return in the same language as the transcript.
    `;

    // Make API call to OpenAI for summary generation
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userMessage?.trim() || "" },
        ],
        max_tokens: 15000,
        temperature: 0.2, // Low temperature for consistent, focused summaries
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    // Extract and clean the response text
    let summaryText = response.data.choices[0].message.content.trim();
    // Remove markdown code block formatting if present
    if (summaryText.startsWith("```") && summaryText.endsWith("```")) {
      summaryText = summaryText.slice(3, -3).trim();
    }

    // Parse the JSON response from OpenAI
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(summaryText);
    } catch (parseError) {
      console.error("Error parsing summary JSON:", parseError);
      console.error("Summary Text:", summaryText);
      return res.status(500).json({ error: "Failed to parse summary JSON." });
    }

    // Validate the expected 2-element array format: [sessionName, summary]
    if (
      !Array.isArray(parsedResponse) ||
      parsedResponse.length !== 2 ||
      typeof parsedResponse[0] !== "string" ||
      typeof parsedResponse[1] !== "string"
    ) {
      return res
        .status(500)
        .json({ error: "Invalid format: Expected [sessionName, summary]." });
    }

    const sessionName = parsedResponse[0];
    const summary = parsedResponse[1];

    // Store the summary in the database
    const summariesCollection = db.collection("summaries");
    const newSummary = {
      uploadId: new ObjectId(uploadId),
      userId: new ObjectId(userId),
      folderID: folderID,
      studySession: sessionName,
      summary: summary,
      createdDate: new Date(),
    };

    const insertResult = await summariesCollection.insertOne(newSummary);

    return res.status(201).json({
      message: "Summary created successfully.",
      summary: {
        id: insertResult.insertedId.toString(),
        ...newSummary,
      },
    });
  } catch (error) {
    console.error("Create Summary Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while creating summary." });
  }
};

/**
 * Get all summaries for the logged-in user
 * 
 * Retrieves all summaries belonging to the authenticated user.
 * Returns summaries in a consistent format with proper ID conversion.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of summary objects or error
 */
exports.getAllSummaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    const summariesCollection = db.collection("summaries");

    // Fetch all summaries for the user
    const results = await summariesCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Format the response with consistent ID field and handle null folderID
    const data = results.map((doc) => ({
      id: doc._id.toString(),
      uploadId: doc.uploadId,
      userId: doc.userId,
      folderID: doc.folderID || null,
      studySession: doc.studySession,
      summary: doc.summary,
      createdDate: doc.createdDate,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Get All Summaries Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving summaries." });
  }
};

/**
 * Get a single summary by ID
 * 
 * Fetches a specific summary by its ID for the authenticated user.
 * Validates user ownership before returning the summary data.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Summary ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with summary data or error
 */
exports.getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    // Find summary and verify user ownership
    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

    // Format the response with consistent ID field
    const formatted = {
      id: summary._id.toString(),
      uploadId: summary.uploadId,
      userId: summary.userId,
      folderID: summary.folderID || null,
      studySession: summary.studySession,
      summary: summary.summary,
      createdDate: summary.createdDate,
    };

    return res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Get Summary By ID Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving summary." });
  }
};

/**
 * Delete a summary by ID
 * 
 * Permanently removes a summary owned by the authenticated user.
 * Validates user ownership before deletion to ensure security.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Summary ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.deleteSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    // Verify summary exists and belongs to user before deletion
    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

    // Delete the summary
    await summariesCollection.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ message: "Summary deleted successfully." });
  } catch (error) {
    console.error("Delete Summary Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while deleting summary." });
  }
};

/**
 * Rename a summary
 * 
 * Updates the name of an existing summary.
 * Validates user ownership and ensures the new name is provided.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Summary ID to rename
 * @param {Object} req.body - Request body
 * @param {string} req.body.newName - New name for the summary
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.renameSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const userId = req.user.id;

    // Validate required parameters
    if (!newName) {
      return res.status(400).json({ error: "newName is required." });
    }

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    // Verify summary exists and belongs to user
    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

    // Update the summary name
    await summariesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { studySession: newName } }
    );

    return res.status(200).json({ message: "Summary renamed successfully." });
  } catch (error) {
    console.error("renameSummary error:", error);
    return res
      .status(500)
      .json({ error: "Server error while renaming summary." });
  }
};

/**
 * Get summaries by folder ID
 * 
 * Retrieves all summaries in a specific folder for the authenticated user.
 * Handles special case where folderID is "null" to find unorganized summaries.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.folderID - Folder ID to filter by (or "null" for unorganized)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of summary objects or error
 */
exports.getSummariesByFolderID = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderID } = req.params;

    // Handle special case where "null" string represents unorganized summaries
    const folderValue = folderID === "null" ? null : folderID;

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    // Find summaries matching user and folder criteria
    const results = await summariesCollection
      .find({
        userId: new ObjectId(userId),
        folderID: folderValue,
      })
      .toArray();

    // Format response with consistent ID field
    const data = results.map((doc) => ({
      id: doc._id.toString(),
      uploadId: doc.uploadId,
      userId: doc.userId,
      folderID: doc.folderID || null,
      studySession: doc.studySession,
      summary: doc.summary,
      createdDate: doc.createdDate,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Get Summaries By FolderID Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving summaries by folder." });
  }
};

/**
 * Assign a folder to a summary
 * 
 * Updates a summary to associate it with a specific folder.
 * Used for organizing summary content within the user's folder structure.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Summary ID to assign folder to
 * @param {Object} req.body - Request body
 * @param {string} req.body.folderID - Folder ID to assign
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.assignFolderToSummary = async (req, res) => {
  const { id } = req.params;
  const { folderID } = req.body;
  const userId = req.user.id;

  // Validate required parameters
  if (!id) {
    return res.status(400).json({ error: "Summary ID is required." });
  }

  try {
    const db = getDB();
    const summariesCollection = db.collection("summaries");

    // Verify that the summary exists and belongs to the user
    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

    // Update the summary to assign the folder
    await summariesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { folderID } }
    );

    res.status(200).json({ message: "Folder assigned to summary successfully." });
  } catch (error) {
    console.error("Error assigning folder to summary:", error);
    res.status(500).json({ error: "Server error assigning folder to summary." });
  }
};

/**
 * Query a document without saving the conversation
 * 
 * Allows users to ask questions about the original document that a summary was based on.
 * Uses the uploadId from the summary to get the original transcript and query against it.
 * Provides real-time document analysis without persisting the conversation.
 * 
 * Process Flow:
 * 1. Retrieves the summary to find the associated upload
 * 2. Fetches the original document transcript
 * 3. Constructs OpenAI prompt with full document context
 * 4. Generates AI response based on document content
 * 5. Returns answer without saving to database
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.summaryId - Summary ID to query against
 * @param {string} req.body.userMessage - User's question about the document
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with AI answer or error
 */
exports.queryDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { summaryId, userMessage } = req.body;

    // Validate required parameters
    if (!summaryId || !userMessage) {
      return res.status(400).json({ error: "summaryId and userMessage are required." });
    }

    const db = getDB();
    const summariesCollection = db.collection("summaries");
    const uploadsCollection = db.collection("uploads");

    // Get the summary to find the uploadId
    const summary = await summariesCollection.findOne({
      _id: new ObjectId(summaryId),
      userId: new ObjectId(userId),
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found or not owned by user." });
    }

    // Get the original document transcript
    const uploadDoc = await uploadsCollection.findOne({
      _id: new ObjectId(summary.uploadId),
      userId: new ObjectId(userId),
    });

    if (!uploadDoc) {
      return res.status(404).json({ error: "Original document not found." });
    }

    // Validate OpenAI API key configuration
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured." });
    }

    // Create system prompt for document querying
    // Instructs AI to answer based on document content and decline unrelated questions
    const systemPrompt = `
      You are an AI assistant helping a user understand and explore a document. You have access to the full transcript of the document.
      
      Document content:
      ${uploadDoc.transcript}
      
      Instructions:
      - Answer the user's question based on the document content
      - Be specific and reference relevant parts of the document
      - If the question cannot be answered from the document, politely say so
      - Provide helpful and accurate information
      - Keep responses conversational but informative
      - Answer in the same language as the user's question
    `;

    // Make API call to OpenAI for document querying
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userMessage.trim() },
        ],
        max_tokens: 1500,
        temperature: 0.3, // Moderate temperature for balanced creativity and accuracy
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const answer = response.data.choices[0].message.content.trim();

    return res.status(200).json({
      answer: answer,
      documentTitle: uploadDoc.fileName,
    });
  } catch (error) {
    console.error("Query Document Error:", error);
    return res.status(500).json({ error: "Server error while querying document." });
  }
};
