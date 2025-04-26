const axios = require("axios");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
require("dotenv").config();

/**
 * Create a summary from an upload's transcript
 */
exports.createSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uploadId, userMessage, folderID } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: "uploadId is required." });
    }

    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    // Verify ownership
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
      return res.status(500).json({ error: "OpenAI API key not configured." });
    }

    // Summarize via OpenAI
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

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userMessage?.trim() || "" },
        ],
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

    let summaryText = response.data.choices[0].message.content.trim();
    // Strip triple backticks if present
    if (summaryText.startsWith("```") && summaryText.endsWith("```")) {
      summaryText = summaryText.slice(3, -3).trim();
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(summaryText);
    } catch (parseError) {
      console.error("Error parsing summary JSON:", parseError);
      console.error("Summary Text:", summaryText);
      return res.status(500).json({ error: "Failed to parse summary JSON." });
    }

    // Validate the 2-element array format
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

    // Store in DB
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
 */
exports.getAllSummaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    const summariesCollection = db.collection("summaries");

    const results = await summariesCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

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
 */
exports.getSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

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
 */
exports.deleteSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

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
 */
exports.renameSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const userId = req.user.id;

    if (!newName) {
      return res.status(400).json({ error: "newName is required." });
    }

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    // Verify ownership
    const summary = await summariesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!summary) {
      return res.status(404).json({ error: "Summary not found." });
    }

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

exports.getSummariesByFolderID = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderID } = req.params;

    const folderValue = folderID === "null" ? null : folderID;

    const db = getDB();
    const summariesCollection = db.collection("summaries");

    const results = await summariesCollection
      .find({
        userId: new ObjectId(userId),
        folderID: folderValue,
      })
      .toArray();

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
