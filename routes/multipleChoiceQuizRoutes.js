const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz,
  renameQuiz,
  getQuizzesByFolderID,
} = require("../controllers/multipleChoiceQuizController");

router.post("/", authMiddleware, createQuiz);
router.get("/", authMiddleware, getAllQuizzes);
router.get("/:id", authMiddleware, getQuizById);
router.delete("/:id", authMiddleware, deleteQuiz);
router.put("/:id/rename", authMiddleware, renameQuiz);
router.get("/folder/:folderID", authMiddleware, getQuizzesByFolderID);

module.exports = router;
