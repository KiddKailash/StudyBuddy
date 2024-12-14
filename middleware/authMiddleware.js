const jwt = require('jsonwebtoken');
const { getDB } = require('../utils/db');
const { ObjectId } = require('mongodb');
require('dotenv').config();

/**
 * Authentication middleware to verify JWT tokens.
 * Fetches user details from the database and adds it to req.user.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing.' });
  }

  const token = authHeader.split(' ')[1]; // Expected format: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token missing from Authorization header.' });
  }

  try {
    // Verify JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    // Fetch user details from the database
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // Attach user details and subscription-related fields to req.user
    req.user = {
      id: user._id.toString(),
      email: user.email,
      accountType: user.accountType || 'free',
      firstName: user.firstName,
      lastName: user.lastName,
      // Subscription-related fields
      stripeCustomerId: user.stripeCustomerId || null,
      subscriptionId: user.subscriptionId || null,
      subscriptionStatus: user.subscriptionStatus || null,
      lastInvoice: user.lastInvoice || null,
      paymentStatus: user.paymentStatus || null,
      // Add notionAccessToken if present in the user document
      notionAccessToken: user.notionAccessToken || null
    };

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;

/**
 * Middleware to ensure the user has authorized Notion.
 * This should be used after authMiddleware. It checks if req.user has a Notion access token.
 * If not authorized, returns 403 Forbidden.
 *
 * @param {Object} req - Express request object (must have req.user from authMiddleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireNotionAuth = (req, res, next) => {
  if (!req.user || !req.user.notionAccessToken) {
    return res.status(403).json({ error: 'User not authorized with Notion.' });
  }
  next();
};

// Exporting both authMiddleware and requireNotionAuth
module.exports.requireNotionAuth = requireNotionAuth;
