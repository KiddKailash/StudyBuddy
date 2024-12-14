require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const { connectDB } = require("./utils/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const transcriptRoutes = require("./routes/transcriptRoutes");
const openaiRoutes = require("./routes/openaiRoutes");
const flashcardsRoutes = require("./routes/flashcardsRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");
const notionRoutes = require("./routes/notionRoutes");

// Import the webhook handler
const webhookHandler = require("./routes/webhookRoutes");

const app = express();
const PORT = process.env.PORT || 5002;

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
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error("Not allowed by CORS"));
        },
      })
    );

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // Adjust as needed
      message: "Too many requests from this IP, please try again later.",
    });
    app.use(limiter);

    /**
     * Define the Stripe Webhook endpoint BEFORE applying global JSON parsing.
     * Stripe requires the raw body to verify the signature.
     */
    app.post(
      "/api/webhook",
      bodyParser.raw({ type: "application/json" }),
      webhookHandler
    );

    // Now we apply JSON parsing for all other routes.
    app.use(express.json());

    /**
     * If you have authMiddleware, apply it here if necessary:
     * const authMiddleware = require('./middleware/authMiddleware');
     * app.use(authMiddleware);
     *
     * Make sure not to apply authMiddleware to the webhook route above.
     */

    // Define all other routes that can safely use express.json()
    app.use("/api/auth", authRoutes);
    app.use("/api/transcript", transcriptRoutes);
    app.use("/api/openai", openaiRoutes);
    app.use("/api/flashcards", flashcardsRoutes);
    app.use("/api/checkout", checkoutRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/notion", notionRoutes);

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
