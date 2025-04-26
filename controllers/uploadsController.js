const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  fileFilter: (req, file, cb) => {
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
 */
exports.uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    const userId = req.user.id;
    
    // Extract folderID from form data
    console.log("Full request body:", req.body);
    const folderID = req.body.folderID === "null" ? null : req.body.folderID;
    console.log("Extracted folderID:", folderID);

    try {
      let transcript = "";

      if (fileType === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        transcript = pdfData.text;
      } else if (
        fileType === "application/msword" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ path: filePath });
        transcript = result.value;
      } else if (fileType === "text/plain") {
        transcript = fs.readFileSync(filePath, "utf-8");
      } else {
        throw new Error("Unsupported file type.");
      }

      // Remove local file
      fs.unlinkSync(filePath);

      // Store in 'uploads'
      const db = getDB();
      const uploadsCollection = db.collection("uploads");
      const uploadDoc = {
        userId: new ObjectId(userId),
        fileType,
        fileName: req.file.originalname,
        filePath: null,
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
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Failed to process the file." });
    }
  });
};

/**
 * Create a new upload from raw text (pasted or website transcript).
 */
exports.createUploadFromText = async (req, res) => {
  const userId = req.user.id;
  const { transcript, fileName } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: "transcript is required." });
  }

  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");
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
 */
exports.getUploadById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    const upload = await uploadsCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (!upload) {
      return res.status(404).json({ error: "Upload not found." });
    }

    // Convert to "id"
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
 */
exports.getAllUploads = async (req, res) => {
  const userId = req.user.id;
  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");

    console.log("Getting uploads for user:", userId);
    
    const results = await uploadsCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    console.log(`Found ${results.length} uploads for user ${userId}`);
    
    // Return them as array with 'id'
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
 */
exports.deleteFile = async (req, res) => {
  const { filename } = req.params;
  const userId = req.user.id;
  
  try {
    const db = getDB();
    const uploadsCollection = db.collection("uploads");
    
    // Try to interpret the filename parameter as an ObjectId
    let query;
    
    try {
      // If the filename looks like an ObjectId, use it as ID
      if (ObjectId.isValid(filename)) {
        query = { _id: new ObjectId(filename), userId: new ObjectId(userId) };
      } else {
        // Otherwise, search by fileName
        query = { fileName: filename, userId: new ObjectId(userId) };
      }
    } catch (error) {
      // If it's not a valid ObjectId, search by fileName
      query = { fileName: filename, userId: new ObjectId(userId) };
    }
    
    // Find the upload document
    const found = await uploadsCollection.findOne(query);
    
    if (!found) {
      return res.status(404).json({ error: "File not found" });
    }
    
    // Delete from database
    await uploadsCollection.deleteOne({ _id: found._id });
    
    // Also delete physical file if it exists
    const filePath = `uploads/${filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("File Deletion Error:", error);
    return res.status(500).json({ error: "Failed to delete the file" });
  }
};
