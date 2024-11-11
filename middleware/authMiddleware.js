// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Authentication middleware to verify JWT tokens.
 * Adds the user payload to the request object if valid.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check if Authorization header is present
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing.' });
  }
  
  const token = authHeader.split(' ')[1]; // Expected format: Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'Token missing from Authorization header.' });
  }
  
  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user; // Attach user payload to request
    next();
  });
};

module.exports = authMiddleware;
