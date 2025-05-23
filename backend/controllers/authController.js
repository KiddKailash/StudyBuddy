/**
 * Authentication Controller
 * 
 * Handles user authentication, registration, login, and token management.
 * Provides endpoints for user registration, login, token refresh, and user data retrieval.
 * Also handles subscription status management.
 */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");
require("dotenv").config();

/**
 * Generates a JWT token for authenticated users.
 *
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  // Set expiresIn to 7 days for weekly sliding expiration
  return jwt.sign(
    { id: user._id, email: user.email, accountType: user.accountType },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // Token Validity
  );
};

/**
 * Register a new user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  const { email, password, firstName, lastName, company } = req.body;

  // Basic validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: "Email, password, first name, and last name are required.",
    });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Use company if provided, else set to null
    const userCompany = company ? company : null;

    // Create new user with accountType "free" and initialize additional fields
    const newUser = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      company: userCompany,
      accountType: "free", // Set default account type
      createdAt: new Date(),
      // Initialize subscription-related fields
      stripeCustomerId: null,
      subscriptionId: null,
      subscriptionStatus: null,
      lastInvoice: null,
      paymentStatus: null,
    };

    // Insert the new user into the database
    const result = await usersCollection.insertOne(newUser);

    // Assign the insertedId to the user object
    newUser._id = result.insertedId;

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        company: newUser.company,
        accountType: newUser.accountType,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

/**
 * Login existing user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate token
    const token = generateToken(user);

    // Construct user object to include additional fields
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      accountType: user.accountType,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      lastInvoice: user.lastInvoice,
      paymentStatus: user.paymentStatus,
    };

    res.status(200).json({
      message: "Login successful.",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login." });
  }
};

/**
 * Refresh the user's token (sliding expiration).
 * This requires that the old token is not fully expired.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refreshToken = (req, res) => {
  try {
    const oldToken = req.headers.authorization?.split(" ")[1];
    if (!oldToken) {
      return res.status(401).json({ error: "No token provided." });
    }

    // Verify/Decode old token is still valid
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);

    // OPTIONAL: Check user existence in DB if needed
    // const db = getDB();
    // const user = db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
    // if (!user) return res.status(404).json({ error: "User not found." });

    // Generate a new 7-day token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        accountType: decoded.accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token: newToken });
  } catch (error) {
    console.error("refreshToken error:", error);
    return res.status(401).json({ error: "Token refresh failed." });
  }
};

/**
 * Upgrade user subscription
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.upgradeSubscription = async (req, res) => {
  // This function may not be necessary if subscription handling is done via Stripe webhooks
  res
    .status(501)
    .json({ error: "Subscription upgrade is handled via Stripe checkout." });
};

/**
 * Get current user's data
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  const userId = req.user.id; // Retrieved from authMiddleware

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Retrieve the user data
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        accountType: user.accountType,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionId: user.subscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        lastInvoice: user.lastInvoice,
        paymentStatus: user.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Server error while fetching user data." });
  }
};
