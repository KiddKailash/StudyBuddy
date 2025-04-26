const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createSummary,
  getAllSummaries,
  getSummaryById,
  deleteSummary,
  renameSummary,
  getSummariesByFolderID, 
} = require("../controllers/summaryController");

router.post("/", authMiddleware, createSummary);
router.get("/", authMiddleware, getAllSummaries);
router.get("/:id", authMiddleware, getSummaryById);
router.delete("/:id", authMiddleware, deleteSummary);
router.put("/:id/rename", authMiddleware, renameSummary);
router.get("/folder/:folderID", authMiddleware, getSummariesByFolderID);

module.exports = router;
