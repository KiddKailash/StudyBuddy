const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createChat,
  getAllChats,
  getChatById,
  deleteChat,
  renameAiChat,
  getChatsByFolderID,
  assignFolderToChat,
} = require("../controllers/aiChatController");

router.post("/", authMiddleware, createChat);
router.get("/", authMiddleware, getAllChats);
router.get("/:id", authMiddleware, getChatById);
router.delete("/:id", authMiddleware, deleteChat);
router.put("/:id/rename", authMiddleware, renameAiChat);
router.get("/folder/:folderID", authMiddleware, getChatsByFolderID);
router.put("/:id/assign-folder", authMiddleware, assignFolderToChat);

module.exports = router;
