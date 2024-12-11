require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./utils/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const transcriptRoutes = require("./routes/transcriptRoutes");
const openaiRoutes = require("./routes/openaiRoutes");
const flashcardsRoutes = require("./routes/flashcardsRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const userRoutes = require('./routes/userRoutes');

// Import the webhook handler
const webhookHandler = require("./routes/webhookRoutes");

const app = express();
const PORT = process.env.PORT || 5002;

// Connect to Database
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
          if (allowedOrigins.indexOf(origin) !== -1) {
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
      max: 100, // Limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
    });
    app.use(limiter);

    // *** Apply express.raw() middleware and define webhook route ***
    app.post(
      "/api/webhook",
      express.raw({ type: "application/json" }),
      webhookHandler
    );

    // *** Now apply express.json() middleware globally ***
    app.use(express.json());

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/transcript", transcriptRoutes);
    app.use("/api/openai", openaiRoutes);
    app.use("/api/flashcards", flashcardsRoutes);
    app.use("/api/checkout", checkoutRoutes);
    app.use("/api/upload", uploadRoutes);
    app.use("/api/users", userRoutes);

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
