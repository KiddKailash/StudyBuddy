const express = require("express");
const router = express.Router();
const foldersController = require("../controllers/foldersController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/folders - Create a new folder (requires authentication)
router.post("/", authMiddleware, foldersController.createFolder);

// GET /api/folders - Retrieve folders for the authenticated user
router.get("/", authMiddleware, foldersController.getFolders);

module.exports = router;