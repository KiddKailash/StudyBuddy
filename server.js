require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const { connectDB } = require("./database/db");

const app = express();

// Allows DigitalOcean Load Balancing (or other proxies)
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8080;

// Import Routes
const authRoutes = require("./routes/authRoutes");
// const openaiRoutes = require("./routes/openaiRoutes");
const flashcardsRoutes = require("./routes/flashcardsRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const featureRequestRoutes = require("./routes/featureRequestRoutes");
const notionRoutes = require("./routes/notionRoutes");
const webhookHandler = require("./routes/webhookRoutes");
const websiteTranscriptRoutes = require("./routes/websiteTranscriptRoutes");
const foldersRoutes = require("./routes/foldersRoutes");
// Additional routes
// const uploadsRoutes = require("./routes/uploadsRoutes"); // File doesn't exist
const multipleChoiceQuizRoutes = require("./routes/multipleChoiceQuizRoutes");
const aiChatRoutes = require("./routes/aiChatRoutes");
const summaryRoutes = require("./routes/summaryRoutes");

// Public versions of routes
const openaiPublicRoutes = require("./routes/openaiPublicRoutes");
const flashcardsPublicRoutes = require("./routes/flashcardsPublicRoutes");
const uploadPublicRoutes = require("./routes/uploadPublicRoutes");
const transcriptPublicRoutes = require("./routes/transcriptPublicRoutes");
const websiteTranscriptPublicRoutes = require("./routes/websiteTranscriptPublicRoutes");

// Protected route
const transcriptRoutes = require("./routes/transcriptRoutes");

connectDB()
  .then(() => {
    // CORS Configuration
    const allowedOrigins = [
      "http://localhost:5173",
      "https://clipcard.netlify.app",
    ];
    app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin) return callback(null, true); // Allow server-to-server or CLI requests
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error("Not allowed by CORS"));
        },
      })
    );

    // // Rate Limiting
    // const limiter = rateLimit({
    //   windowMs: 15 * 60 * 1000, // 15 minutes
    //   max: 500, // Number of requests per window
    //   message: "Too many requests from this IP, please try again later.",
    // });
    // app.use(limiter);

    /**
     * 1) Stripe webhook endpoint (raw body).
     */
    app.post(
      "/api/webhook",
      bodyParser.raw({ type: "application/json" }),
      webhookHandler
    );

    /**
     * 2) Global JSON parsing.
     */
    app.use(express.json({ limit: "20mb" }));
    app.use(express.urlencoded({ limit: "20mb", extended: true }));

    // PUBLIC routes for free-tier (no auth):
    app.use("/api/openai", openaiPublicRoutes);
    app.use("/api/flashcards-public", flashcardsPublicRoutes);
    app.use("/api/upload-public", uploadPublicRoutes);
    app.use("/api/transcript-public", transcriptPublicRoutes);
    app.use("/api/website-transcript-public", websiteTranscriptPublicRoutes);

    // PROTECTED routes (require auth in each route file or at the route level):
    app.use("/api/auth", authRoutes);
    app.use("/api/transcript", transcriptRoutes);
    // app.use("/api/openai", openaiRoutes);
    app.use("/api/flashcards", flashcardsRoutes);
    app.use("/api/checkout", checkoutRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/folders", foldersRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/notion", notionRoutes);
    app.use("/api/feature-request", featureRequestRoutes);
    app.use("/api/website-transcript", websiteTranscriptRoutes);
    // app.use("/api/uploads", uploadsRoutes); // Comment out as file doesn't exist
    app.use("/api/multiple-choice-quizzes", multipleChoiceQuizRoutes);
    app.use("/api/aichats", aiChatRoutes);
    app.use("/api/summaries", summaryRoutes);

    // Global error handler
    app.use((err, req, res, next) => {
      if (err.message === "Not allowed by CORS") {
        return res.status(403).json({ error: "CORS Error: Access denied." });
      }
      console.error("Global Error Handler:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
