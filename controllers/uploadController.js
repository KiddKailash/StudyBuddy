const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

/**
 * Configure multer for file uploads.
 */
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB file size limit
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
 * Handles file upload and parsing.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
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

    try {
      let transcript = "";

      if (fileType === "application/pdf") {
        // Handle PDF files
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        transcript = pdfData.text;
      } else if (
        fileType === "application/msword" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // Handle Word documents
        const result = await mammoth.extractRawText({ path: filePath });
        transcript = result.value;
      } else if (fileType === "text/plain") {
        // Handle TXT files
        transcript = fs.readFileSync(filePath, "utf-8");
      } else {
        throw new Error("Unsupported file type.");
      }

      // Clean up: Delete the file after processing
      fs.unlinkSync(filePath);

      res.status(200).json({ transcript });
    } catch (error) {
      console.error("File Processing Error:", error);
      // Clean up in case of error
      fs.unlinkSync(filePath);
      res.status(500).json({ error: "Failed to process the file." });
    }
  });
};

/**
 * Handles file deletion request.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
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
