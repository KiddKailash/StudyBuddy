/**
 * flashcardsPublicRoutes.js
 *
 * Defines the Express routes for ephemeral "free tier" flashcards.
 */

const express = require("express");
const router = express.Router();

const {
  createEphemeralSession,
  getEphemeralSessionById,
  deleteEphemeralSession,
} = require("../controllers/flashcardsPublicController");

// Public endpoint: Create ephemeral session
router.post("/", createEphemeralSession);

// Public endpoint: Retrieve ephemeral session by ID
router.get("/:id", getEphemeralSessionById);

// Public endpoint: Delete ephemeral session by ID
router.delete("/:id", deleteEphemeralSession);

module.exports = router;
