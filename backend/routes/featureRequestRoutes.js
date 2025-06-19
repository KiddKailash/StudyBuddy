/**
 * Feature Request Routes Module
 */
const express = require("express");
const router = express.Router();
const { requestFeature } = require("../controllers/featureRequestController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply authentication middleware to all routes in this module
router.use(authMiddleware);

/**
 * @route   POST /api/feature-request
 * @desc    Submit feature requests and send email notification to administrators
 * @access  Private (JWT required)
 * @body    {features} - Array of feature request objects with title and description
 * @returns Success/error response
 */
router.post("/", requestFeature);

module.exports = router;
