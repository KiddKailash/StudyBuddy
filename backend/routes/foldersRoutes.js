const express = require("express");
const router = express.Router();
const foldersController = require("../controllers/foldersController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, foldersController.createFolder);
router.get("/", authMiddleware, foldersController.getFolders);
router.put("/:id/rename", authMiddleware, foldersController.renameFolder);
router.delete("/:id", authMiddleware, foldersController.deleteFolder);

module.exports = router;
