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
 * Creates a JWT token with user information and sets expiration to 7 days
 * for weekly sliding expiration. Includes user ID, email, and account type.
 *
 * @param {Object} user - User object containing _id, email, and accountType
 * @returns {string} - JWT token string
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
 * Creates a new user account with hashed password and default settings.
 * Validates required fields and ensures email uniqueness.
 * 
 * Process Flow:
 * 1. Validates required user information
 * 2. Checks for existing user with same email
 * 3. Hashes password with bcrypt
 * 4. Creates user record with default settings
 * 5. Generates JWT token for immediate login
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} [req.body.company] - User's company (optional)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data and token or error
 */
exports.register = async (req, res) => {
  const { email, password, firstName, lastName, company } = req.body;

  // Basic validation for required fields
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: "Email, password, first name, and last name are required.",
    });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Check if user already exists with the same email
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    // Hash the password with bcrypt (10 salt rounds for security)
    // Higher salt rounds increase security but also processing time
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

    // Generate JWT token for immediate login
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
 * Authenticates user credentials and returns JWT token for session management.
 * Compares provided password with stored hash using bcrypt.
 * 
 * Process Flow:
 * 1. Validates email and password are provided
 * 2. Finds user by email address
 * 3. Compares password with stored hash using bcrypt
 * 4. Generates JWT token if credentials are valid
 * 5. Returns user data and token
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data and token or error
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation for required fields
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Find user by email address
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Compare provided password with stored hash using bcrypt
    // bcrypt.compare handles the salt extraction and comparison automatically
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT token for successful login
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
 * 
 * This requires that the old token is not fully expired.
 * Generates a new 7-day token if the old token is still valid.
 * 
 * Process Flow:
 * 1. Extracts token from Authorization header
 * 2. Verifies token is still valid using JWT_SECRET
 * 3. Generates new token with same user data
 * 4. Returns new token to client
 * 
 * @param {Object} req - Express request object
 * @param {string} req.headers.authorization - Bearer token in Authorization header
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new token or error
 */
exports.refreshToken = (req, res) => {
  try {
    // Extract token from Authorization header (Bearer TOKEN)
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

    // Generate a new 7-day token with same user data
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
 * Placeholder endpoint for subscription upgrades.
 * Currently handled via Stripe checkout process.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating subscription handling method
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
 * Retrieves the current user's information based on the JWT token.
 * Excludes password from the response for security.
 * 
 * Process Flow:
 * 1. Extracts user ID from JWT token (via authMiddleware)
 * 2. Queries database for user information
 * 3. Excludes password from response
 * 4. Returns formatted user data
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - User ID from JWT token (set by authMiddleware)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data or error
 */
exports.getCurrentUser = async (req, res) => {
  const userId = req.user.id; // Retrieved from authMiddleware

  try {
    const db = getDB();
    const usersCollection = db.collection("users");

    // Retrieve the user data, excluding password for security
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return formatted user data
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
