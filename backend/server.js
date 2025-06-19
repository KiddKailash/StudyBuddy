/**
 * Express.js Server
 * 
 * Main server application for the StudyBuddy backend API.
 * Configures Express.js server with middleware, routes, and error handling.
 * Manages both public (unauthenticated) and protected (authenticated) API endpoints.
 * 
 * Route Categories:
 * - Public Routes: No authentication required (free tier access)
 * - Protected Routes: JWT authentication required
 * - Webhook Routes: Special handling for external service callbacks
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const { connectDB } = require("./database/db");

// Initialize Express application
const app = express();

// Configure trust proxy for load balancers (DigitalOcean, etc.)
// This allows the server to trust the X-Forwarded-* headers
app.set("trust proxy", 1);

// Configure server port with environment fallback
const PORT = process.env.PORT || 8080;

// Import all route modules for API endpoints
// Protected routes (require authentication)
const authRoutes = require("./routes/authRoutes");
// const openaiRoutes = require("./routes/openaiRoutes"); // Commented out - using public version
const flashcardsRoutes = require("./routes/flashcardsRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const featureRequestRoutes = require("./routes/featureRequestRoutes");
const notionRoutes = require("./routes/notionRoutes");
const webhookHandler = require("./routes/webhookRoutes");
const websiteTranscriptRoutes = require("./routes/websiteTranscriptRoutes");
const foldersRoutes = require("./routes/foldersRoutes");
const multipleChoiceQuizRoutes = require("./routes/multipleChoiceQuizRoutes");
const aiChatRoutes = require("./routes/aiChatRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

// Public routes (no authentication required for free tier)
const openaiPublicRoutes = require("./routes/openaiPublicRoutes");
const flashcardsPublicRoutes = require("./routes/flashcardsPublicRoutes");
const uploadPublicRoutes = require("./routes/uploadPublicRoutes");
const transcriptPublicRoutes = require("./routes/transcriptPublicRoutes");
const websiteTranscriptPublicRoutes = require("./routes/websiteTranscriptPublicRoutes");

// Protected transcript routes (require authentication)
const transcriptRoutes = require("./routes/transcriptRoutes");

/**
 * Initialize server with database connection and route configuration
 * 
 * Establishes database connection and configures all middleware,
 * routes, and error handling for the Express.js application.
 * 
 * Process Flow:
 * 1. Connects to MongoDB database
 * 2. Configures CORS for cross-origin requests
 * 3. Sets up middleware (rate limiting, body parsing)
 * 4. Configures webhook endpoint with raw body parsing
 * 5. Sets up global JSON parsing middleware
 * 6. Mounts public and protected route handlers
 * 7. Configures global error handling
 * 8. Starts HTTP server on configured port
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If database connection fails or server startup error occurs
 */
connectDB()
  .then(() => {
    // Configure CORS for cross-origin requests
    // Define allowed origins for security
    const allowedOrigins = [
      "http://localhost:5173", // Local development
      "https://clipcard.netlify.app", // Production frontend
    ];
    
    // Apply CORS middleware with origin validation
    app.use(
      cors({
        origin: function (origin, callback) {
          // Allow server-to-server requests or CLI requests (no origin)
          if (!origin) return callback(null, true);
          
          // Check if origin is in allowed list
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          
          // Reject requests from unauthorized origins
          return callback(new Error("Not allowed by CORS"));
        },
      })
    );

    // Rate limiting configuration (currently disabled)
    // Uncomment to enable rate limiting for API protection
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // Number of requests per window
      message: "Too many requests from this IP, please try again later.",
    });
    app.use(limiter);

    /**
     * Stripe webhook endpoint with raw body parsing
     * 
     * Handles webhook callbacks from Stripe payment service.
     * Uses raw body parsing to preserve signature for verification.
     * Must be configured before global JSON parsing middleware.
     */
    app.post(
      "/api/webhook",
      bodyParser.raw({ type: "application/json" }), // Raw body for signature verification
      webhookHandler
    );

    /**
     * Global JSON parsing middleware
     * 
     * Configures Express to parse JSON and URL-encoded request bodies.
     * Set with 20MB limit to handle large file uploads and transcripts.
     * Applied after webhook endpoint to avoid interfering with raw body parsing.
     */
    app.use(express.json({ limit: "20mb" })); // Handle large JSON payloads
    app.use(express.urlencoded({ limit: "20mb", extended: true })); // Handle form data
  
    // Mount public routes (no authentication required)
    // These endpoints are available for free tier users
    app.use("/api/openai", openaiPublicRoutes);
    app.use("/api/flashcards-public", flashcardsPublicRoutes);
    app.use("/api/upload-public", uploadPublicRoutes);
    app.use("/api/transcript-public", transcriptPublicRoutes);
    app.use("/api/website-transcript-public", websiteTranscriptPublicRoutes);

    // Mount protected routes (require JWT authentication)
    // These endpoints require valid authentication tokens
    app.use("/api/auth", authRoutes);
    app.use("/api/transcript", transcriptRoutes);
    // app.use("/api/openai", openaiRoutes); // Commented out - using public version
    app.use("/api/flashcards", flashcardsRoutes);
    app.use("/api/checkout", checkoutRoutes);
    app.use("/api/uploads", uploadRoutes);
    app.use("/api/folders", foldersRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/notion", notionRoutes);
    app.use("/api/feature-request", featureRequestRoutes);
    app.use("/api/website-transcript", websiteTranscriptRoutes);
    app.use("/api/multiple-choice-quizzes", multipleChoiceQuizRoutes);
    app.use("/api/aichats", aiChatRoutes);
    app.use("/api/summaries", summaryRoutes);

    /**
     * Global error handling middleware
     * 
     * Catches and handles all unhandled errors in the application.
     * Provides appropriate error responses based on error type.
     * 
     * @param {Error} err - Error object
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    app.use((err, req, res, next) => {
      // Handle CORS errors specifically
      if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ error: "CORS Error: Access denied." });
      }
      
      // Log all other errors for debugging
      console.error("Global Error Handler:", err);
      
      // Return generic error response for security
      res.status(500).json({ error: "Internal Server Error" });
    });

    /**
     * Start HTTP server
     * 
     * Binds the Express application to the configured port
     * and logs successful server startup.
     */
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    // Handle database connection failures
    console.error("Failed to connect to database:", error);
    process.exit(1); // Exit with error code
  });
