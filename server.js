require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./utils/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Import Routes
const authRoutes = require("./routes/authRoutes");
const transcriptRoutes = require("./routes/transcriptRoutes");
const openaiRoutes = require("./routes/openaiRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const flashcardsRoutes = require("./routes/flashcardsRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes"); // New Checkout Route

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

    // Middleware to parse JSON for all routes except /api/webhook
    app.use((req, res, next) => {
      if (req.originalUrl === "/api/webhook") {
        next();
      } else {
        express.json()(req, res, next);
      }
    });

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/transcript", transcriptRoutes);
    app.use("/api/openai", openaiRoutes);
    app.use("/api/flashcards", flashcardsRoutes);
    app.use("/api/checkout", checkoutRoutes); // Mount Checkout Routes

    // Apply express.raw middleware to /api/webhook
    app.use(
      "/api/webhook",
      express.raw({ type: "application/json" }),
      webhookRoutes
    );

    // Optional: Test route
    app.get("/api/test-connection", (req, res) => {
      const https = require("https");
      https
        .get("https://www.youtube.com", (response) => {
          res.status(200).send("Able to access YouTube");
        })
        .on("error", (e) => {
          console.error("Error accessing YouTube:", e);
          res.status(500).send("Unable to access YouTube");
        });
    });

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
