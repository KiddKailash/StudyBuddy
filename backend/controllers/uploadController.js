const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

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
