const express = require("express");
const router = express.Router();
const { requestFeature } = require("../controllers/featureRequestController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes here are protected by auth
router.use(authMiddleware);

// POST /api/feature-request
router.post("/", requestFeature);

module.exports = router;
