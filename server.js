require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./utils/db");

// Import Routes (excluding authMiddleware-protected routes for now)
const authRoutes = require("./routes/authRoutes");
const transcriptRoutes = require("./routes/transcriptRoutes");
const openaiRoutes = require("./routes/openaiRoutes");
const flashcardsRoutes = require("./routes/flashcardsRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require("./routes/userRoutes");

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
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          } else {
            return callback(new Error("Not allowed by CORS"));
          }
        },
      })
    );

    // Rate Limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // Limit each IP to 500 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
    });
    app.use(limiter);

    /**
     * IMPORTANT:
     * The Stripe webhook requires the raw body for signature verification.
     * We define the webhook route BEFORE applying express.json() or any auth middleware.
     */
    app.post(
      "/api/webhook",
      express.raw({ type: "application/json" }),
      webhookHandler
    );

    /**
     * Now that the webhook route is set, we can safely apply express.json()
     * for all other routes. The webhook route won't be affected because it's already defined.
     */
    app.use(express.json());

    /**
     * If you have an authMiddleware that applies to most routes,
     * you can require and use it here. Make sure it's AFTER the webhook route.
     *
     * Example:
     * const authMiddleware = require("./middleware/authMiddleware");
     * app.use(authMiddleware);
     *
     * If authMiddleware is used globally, then all routes defined after this
     * line will require authentication. The webhook route, defined above, will not.
     */

    // Define other routes that require JSON parsing and possibly authentication:
    app.use("/api/auth", authRoutes);
    app.use("/api/transcript", transcriptRoutes);
    app.use("/api/openai", openaiRoutes);
    app.use("/api/flashcards", flashcardsRoutes);
    app.use("/api/checkout", checkoutRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/users", userRoutes);
    // app.use("/api/notion", notionRoutes);

    // Global Error Handler for CORS and other errors
    app.use((err, req, res, next) => {
      if (err.message === "Not allowed by CORS") {
        res.status(403).json({ error: "CORS Error: Access denied." });
      } else {
        console.error("Global Error Handler:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
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
