/**
 * Authentication Middleware Module
 * 
 * Provides JWT-based authentication middleware for Express.js routes.
 * Handles token verification, user validation, and subscription status checking.
 * Includes middleware for Notion integration authorization.
 */
const jwt = require('jsonwebtoken');
const { getDB } = require('../database/db');
const { ObjectId } = require('mongodb');
require('dotenv').config();

/**
 * Authentication middleware to verify JWT tokens and fetch user details.
 * 
 * Validates JWT tokens from Authorization headers, retrieves user information
 * from the database, and attaches user data to the request object for use
 * in subsequent middleware and route handlers.
 * 
 * Process Flow:
 * 1. Extracts and validates Authorization header format
 * 2. Verifies JWT token using secret key
 * 3. Retrieves user data from database (excluding password)
 * 4. Attaches user information and subscription data to req.user
 * 5. Handles various authentication errors with appropriate status codes
 * 
 * @param {Object} req - Express request object
 * @param {string} req.headers.authorization - Bearer token in Authorization header
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() on success or sends error response on failure
 */
const authMiddleware = async (req, res, next) => {
  // Extract Authorization header from request
  const authHeader = req.headers['authorization'];

  // Validate that Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing.' });
  }

  // Extract token from "Bearer <token>" format
  // Split on space and take second element (index 1)
  const token = authHeader.split(' ')[1];

  // Validate that token was successfully extracted
  if (!token) {
    return res.status(401).json({ error: 'Token missing from Authorization header.' });
  }

  try {
    // Verify JWT token using environment secret key
    // This validates token signature and expiration
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Retrieve user data from database using ObjectId
    const db = getDB();
    const usersCollection = db.collection('users');

    // Find user by ID, excluding password field for security
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    );

    // Validate that user exists in database
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Attach comprehensive user data to request object
    // Includes basic user info, subscription status, and integration tokens
    req.user = {
      id: user._id.toString(), // Convert ObjectId to string for consistency
      email: user.email,
      accountType: user.accountType || 'free', // Default to free if not specified
      firstName: user.firstName,
      lastName: user.lastName,
      // Subscription-related fields with null fallbacks
      stripeCustomerId: user.stripeCustomerId || null,
      subscriptionId: user.subscriptionId || null,
      subscriptionStatus: user.subscriptionStatus || null,
      lastInvoice: user.lastInvoice || null,
      paymentStatus: user.paymentStatus || null,
      // Integration tokens
      notionAccessToken: user.notionAccessToken || null
    };

    // Continue to next middleware or route handler
    next();
  } catch (err) {
    // Handle JWT verification errors (invalid token, expired, etc.)
    console.error('JWT Verification Error:', err);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;

/**
 * Middleware to ensure user has authorized Notion integration.
 * 
 * Validates that the authenticated user has completed Notion OAuth
 * and has a valid access token stored. Must be used after authMiddleware
 * since it depends on req.user being populated.
 * 
 * Process Flow:
 * 1. Checks if req.user exists (from authMiddleware)
 * 2. Validates presence of notionAccessToken
 * 3. Returns 403 Forbidden if Notion not authorized
 * 
 * @param {Object} req - Express request object (must have req.user from authMiddleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if authorized or sends 403 error
 */
const requireNotionAuth = (req, res, next) => {
  // Check if user is authenticated and has Notion access token
  if (!req.user || !req.user.notionAccessToken) {
    return res.status(403).json({ error: 'User not authorized with Notion.' });
  }
  next();
};

// Export both middleware functions for use in routes
module.exports.requireNotionAuth = requireNotionAuth;
