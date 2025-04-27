/**
 * Multiple Choice Quiz Controller
 * 
 * Manages the generation and retrieval of AI-powered multiple-choice quizzes.
 * Uses OpenAI to analyze transcripts and create educational quiz questions.
 * Provides endpoints for quiz creation, retrieval, and management.
 * Supports various quiz formats with detailed explanations for answers.
 */
const axios = require("axios");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
require("dotenv").config();

/**
 * Create a new multiple-choice quiz for a given uploadId.
 * 
 * Generates a multiple-choice quiz based on the content of an uploaded document.
 * Uses OpenAI to analyze the transcript and create varied questions with options.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created quiz or error
 */
exports.createQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uploadId, folderID } = req.body;

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

    // Check for OpenAI Key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured." });
    }

    // Prepare prompt
    const prompt = `
      Convert the following transcript into a detailed, and varied multiple-choice quiz. Your output must strictly follow these instructions:

        1. Generate a short session name that summarizes the key subject matter of the transcript.
        2. Create a series of quiz questions that cover concepts, definitions, applications, and insights from the transcript. Ensure the questions vary in style and difficulty.
        3. Each question must have at least 4 answer options (A, B, C, and D) and clearly indicate which option is correct.
        4. The correct answer should be indicated by the letter corresponding to the correct option (e.g., "A", "B", "C", or "D").
        5. Do not include any information about personnel, course structure, or tools; focus only on the educational content of the transcript.
        6. Use the same language as the transcript.
        7. No markdown formatting is allowed in the final JSON output. Ensure the JSON is valid, and can be parsed.
        7. Return only the final JSON output without any extra text, explanations, or formatting. The JSON must be valid and follow this exact format:

        [
          "sessionName",
          [
            {
              "question": "Question text",
              "options": ["Option A text", "Option B text", "Option C text", "Option D text (optional)"],
              "answer": "Correct Question Text"  // The letter corresponding to the correct option.
              "explanation": "Detailed explanation of why the correct answer is correct."
            },
            ...
          ]
        ]

      Transcript:
      """
      ${uploadDoc.transcript}
      """
    `;

    // Call OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt.trim() }],
        max_tokens: 15000,
        temperature: 0.1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    let quizData = response.data.choices[0].message.content.trim();
    if (quizData.startsWith("```") && quizData.endsWith("```")) {
      quizData = quizData.slice(3, -3).trim();
    }

    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(quizData);
    } catch (err) {
      console.error("Error parsing quiz JSON:", err);
      console.error("OpenAI response:", quizData);
      return res.status(500).json({ error: "Failed to parse quiz JSON." });
    }

    const sessionName = parsedQuiz[0];
    const quiz = parsedQuiz[1];

    // Store quiz in DB
    const multipleChoiceQuizzesCollection = db.collection(
      "multiple_choice_quizzes"
    );
    const newQuiz = {
      uploadId: new ObjectId(uploadId),
      userId: new ObjectId(userId),
      studySession: sessionName,
      questionsJSON: quiz,
      createdDate: new Date(),
      folderID: folderID,
    };

    const insertResult = await multipleChoiceQuizzesCollection.insertOne(
      newQuiz
    );

    return res.status(201).json({
      message: "Multiple-choice quiz created successfully.",
      data: { id: insertResult.insertedId.toString(), ...newQuiz },
    });
  } catch (error) {
    console.error("Create Quiz Error:", error);
    return res.status(500).json({ error: "Server error while creating quiz." });
  }
};

/**
 * Get all quizzes for the logged in user
 * 
 * Retrieves all quizzes belonging to the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of quiz objects or error
 */
exports.getAllQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDB();
    const quizzesCollection = db.collection("multiple_choice_quizzes");

    const quizzes = await quizzesCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const formatted = quizzes.map((q) => ({
      id: q._id.toString(),
      uploadId: q.uploadId,
      userId: q.userId,
      studySession: q.studySession,
      questionsJSON: q.questionsJSON,
      createdDate: q.createdDate,
      folderID: q.folderID || null,
    }));

    return res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Get All Quizzes Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving quizzes." });
  }
};

/**
 * Retrieve a single quiz by ID
 * 
 * Fetches a specific quiz by its ID for the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with quiz data or error
 */
exports.getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = getDB();
    const quizzesCollection = db.collection("multiple_choice_quizzes");

    const quiz = await quizzesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    const formatted = {
      id: quiz._id.toString(),
      uploadId: quiz.uploadId,
      userId: quiz.userId,
      studySession: quiz.studySession,
      questionsJSON: quiz.questionsJSON,
      createdDate: quiz.createdDate,
      folderID: quiz.folderID || null,
    };

    return res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Get Quiz By ID Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving quiz." });
  }
};

/**
 * Delete a quiz
 * 
 * Permanently removes a quiz owned by the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const db = getDB();
    const quizzesCollection = db.collection("multiple_choice_quizzes");

    // Verify ownership
    const quiz = await quizzesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    await quizzesCollection.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ message: "Quiz deleted successfully." });
  } catch (error) {
    console.error("Delete Quiz Error:", error);
    return res.status(500).json({ error: "Server error while deleting quiz." });
  }
};

/**
 * Rename a quiz
 * 
 * Updates the name of an existing quiz.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.renameQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;
    const userId = req.user.id;

    if (!newName) {
      return res.status(400).json({ error: "newName is required." });
    }

    const db = getDB();
    const quizzesCollection = db.collection("multiple_choice_quizzes");

    const quiz = await quizzesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    await quizzesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { studySession: newName } }
    );

    return res.status(200).json({ message: "Quiz renamed successfully." });
  } catch (error) {
    console.error("renameQuiz error:", error);
    return res.status(500).json({ error: "Server error while renaming quiz." });
  }
};

/**
 * Get quizzes by folder ID
 * 
 * Retrieves all quizzes in a specific folder for the authenticated user.
 * Handles special case where folderID is "null" to find unorganized quizzes.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of quiz objects or error
 */
exports.getQuizzesByFolderID = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderID } = req.params;

    const folderValue = folderID === "null" ? null : folderID;

    const db = getDB();
    const quizzesCollection = db.collection("multiple_choice_quizzes");

    const quizzes = await quizzesCollection
      .find({
        userId: new ObjectId(userId),
        folderID: folderValue,
      })
      .toArray();

    const formatted = quizzes.map((q) => ({
      id: q._id.toString(),
      uploadId: q.uploadId,
      userId: q.userId,
      studySession: q.studySession,
      questionsJSON: q.questionsJSON,
      createdDate: q.createdDate,
      folderID: q.folderID || null,
    }));

    return res.status(200).json({ data: formatted });
  } catch (error) {
    console.error("Get Quizzes By FolderID Error:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving quizzes by folder." });
  }
};

/**
 * Assign a folder to a quiz
 * 
 * Updates a quiz to associate it with a specific folder.
 * Used for organizing quiz content.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.assignFolderToQuiz = async (req, res) => {
  const { id } = req.params;
  const { folderID } = req.body;
  const userId = req.user.id;

  if (!id) {
    return res.status(400).json({ error: "Quiz ID is required." });
  }

  try {
    const db = getDB();
    const quizzesCollection = db.collection("multiple_choice_quizzes");

    // Verify that the quiz exists and belongs to the user
    const quiz = await quizzesCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found." });
    }

    // Update the quiz to assign the folder
    await quizzesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { folderID } }
    );

    res.status(200).json({ message: "Folder assigned to quiz successfully." });
  } catch (error) {
    console.error("Error assigning folder to quiz:", error);
    res.status(500).json({ error: "Server error assigning folder to quiz." });
  }
};
