/**
 * Uploads Controller
 * 
 * Manages the uploading, storage, and retrieval of study materials (documents).
 * Handles file uploads (PDF, Word, text) and processes them to extract text content.
 * Provides endpoints for creating, retrieving, updating, and deleting uploads.
 * Supports organization of uploads through folder structure.
 */
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

// Ensure uploads directory exists for temporary file storage
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads with validation and storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify upload directory using the verified path
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Use original filename to preserve user's file naming
    cb(null, file.originalname);
  }
});

// Configure multer with file size limits and type filtering
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB size limit for uploaded files
  },
  fileFilter: (req, file, cb) => {
    // Filter for supported file types to ensure security
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, Word, and TXT files are allowed."));
    }
  },
}).single("file");

/**
 * Upload a file and store record in the 'uploads' collection.
 * 
 * Handles file uploads, extracts text content from PDF, Word, or text files,
 * and stores the content in the database. Supports folder organization.
 * 
 * Process Flow:
 * 1. Validates file upload and type
 * 2. Extracts text content based on file type
 * 3. Cleans up temporary file from disk
 * 4. Stores transcript and metadata in database
 * 5. Returns upload details to client
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID from authentication
 * @param {Object} req.file - Uploaded file object (from multer)
 * @param {Object} req.body - Form data including folderID
 * @param {string} [req.body.folderID] - Optional folder ID for organization
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with upload details or error
 */
exports.uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(400).json({ error: err.message });
    }

    // Validate that a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const userId = req.user.id;
    
    // Extract folderID from form data, handling "null" string conversion
    console.log("Full request body:", req.body);
    const folderID = req.body.folderID === "null" ? null : req.body.folderID;
    console.log("Extracted folderID:", folderID);

    try {
      let transcript = "";

      // Extract text content based on file type using appropriate libraries
      if (fileType === "application/pdf") {
        // Process PDF files using pdf-parse library
        // Reads the entire file into memory and extracts text content
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        transcript = pdfData.text;
      } else if (
        fileType === "application/msword" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Process Word documents (both .doc and .docx) using mammoth library
        // mammoth extracts raw text content from Word documents
        const result = await mammoth.extractRawText({ path: filePath });
        transcript = result.value;
      } else if (fileType === "text/plain") {
        // Process plain text files directly using UTF-8 encoding
        transcript = fs.readFileSync(filePath, "utf-8");
      } else {
        throw new Error("Unsupported file type.");
      }

      // Clean up temporary file from disk after processing
      // This prevents accumulation of temporary files on the server
      fs.unlinkSync(filePath);

      // Store upload record in the database
      const db = getDB();
      const uploadsCollection = db.collection("uploads");
      const uploadDoc = {
        userId: new ObjectId(userId),
        fileType,
        fileName: req.file.originalname,
        filePath: null, // No file path stored since we extract text immediately
        transcript,
        uploadedAt: new Date(),
        folderID: folderID,
      };

      const result = await uploadsCollection.insertOne(uploadDoc);

      return res.status(200).json({
        message: "File uploaded successfully.",
        upload: { id: result.insertedId.toString(), ...uploadDoc },
      });
    } catch (error) {
      console.error("File Processing Error:", error);
      // Clean up file in case of processing error
      // This ensures temporary files don't accumulate even when processing fails
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Failed to process the file." });
    }
  });
};

/**
 * Create a new upload from raw text (pasted or website transcript).
 * 
 * Creates a new upload entry directly from text input rather than a file.
 * Useful for pasted content or imported text from other sources.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.transcript - Text content to store
 * @param {string} [req.body.fileName] - Optional name for the upload
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created upload or error
 */
exports.createUploadFromText = async (req, res) => {
  const userId = req.user.id;
  const { transcript, fileName } = req.body;
  
  // Validate required parameters
  if (!transcript) {
    return res.status(400).json({ error: "transcript is required." });
  }

  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");
    
    // Create upload document with text content
    const newDoc = {
      userId: new ObjectId(userId),
      fileType: "text/plain",
      fileName: fileName || "Untitled",
      filePath: null,
      transcript,
      uploadedAt: new Date(),
    };
    const result = await uploadsCollection.insertOne(newDoc);

    res.status(201).json({
      message: "Created upload from text",
      upload: { id: result.insertedId.toString(), ...newDoc },
    });
  } catch (error) {
    console.error("createUploadFromText error:", error);
    res.status(500).json({ error: "Failed to create upload from text." });
  }
};

/**
 * Retrieve a single upload by ID
 * 
 * Fetches upload details for a specific document owned by the authenticated user.
 * Validates user ownership before returning the upload data.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Upload ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with upload data or error
 */
exports.getUploadById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    // Find upload and verify user ownership
    const upload = await uploadsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!upload) {
      return res.status(404).json({ error: "Upload not found." });
    }

    // Format response with consistent ID field
    const responseObj = {
      id: upload._id.toString(),
      fileType: upload.fileType,
      fileName: upload.fileName,
      transcript: upload.transcript,
      uploadedAt: upload.uploadedAt,
      folderID: upload.folderID,
    };

    return res.status(200).json(responseObj);
  } catch (error) {
    console.error("Error retrieving upload:", error);
    return res
      .status(500)
      .json({ error: "Server error while retrieving upload." });
  }
};

/**
 * Get all uploads for the user
 * 
 * Retrieves all document uploads belonging to the authenticated user.
 * Returns uploads in a consistent format with proper ID conversion.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of upload objects or error
 */
exports.getAllUploads = async (req, res) => {
  const userId = req.user.id;
  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    console.log("Getting uploads for user:", userId);
    
    // Fetch all uploads for the user
    const results = await uploadsCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    console.log(`Found ${results.length} uploads for user ${userId}`);
    
    // Format response with consistent ID field and handle null folderID
    const uploads = results.map((doc) => {
      const upload = {
        id: doc._id.toString(),
        fileType: doc.fileType,
        fileName: doc.fileName,
        transcript: doc.transcript,
        uploadedAt: doc.uploadedAt,
        folderID: doc.folderID,
      };
      console.log(`Upload ${upload.id} with folderID: ${upload.folderID}`);
      return upload;
    });

    res.status(200).json({ uploads });
  } catch (error) {
    console.error("Error retrieving uploads:", error);
    res.status(500).json({ error: "Server error while retrieving uploads." });
  }
};

/**
 * Delete an upload by ID or filename
 * 
 * Removes an uploaded document from the database and file system if it exists.
 * Supports deletion by either document ID or filename, with ID taking precedence.
 * Validates user ownership before deletion.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.filename - Upload ID or filename to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.deleteFile = async (req, res) => {
  const { filename } = req.params;
  const userId = req.user.id;
  
  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");
    
    // Determine query strategy based on parameter format
    let query;
    
    try {
      // If the filename looks like an ObjectId, use it as ID for direct lookup
      if (ObjectId.isValid(filename)) {
        query = { _id: new ObjectId(filename), userId: new ObjectId(userId) };
      } else {
        // Otherwise, search by fileName (fallback for legacy support)
        query = { fileName: filename, userId: new ObjectId(userId) };
      }
    } catch (error) {
      // If it's not a valid ObjectId, search by fileName
      query = { fileName: filename, userId: new ObjectId(userId) };
    }
    
    // Find the upload document and verify ownership
    const found = await uploadsCollection.findOne(query);
    
    if (!found) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // Delete from database
    await uploadsCollection.deleteOne({ _id: found._id });
    
    // Also delete physical file if it exists (for safety, though we usually clean up immediately)
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("File Deletion Error:", error);
    return res.status(500).json({ error: "Failed to delete the file" });
  }
};
