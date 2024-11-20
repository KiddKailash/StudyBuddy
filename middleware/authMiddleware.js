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
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7, authHeader.length);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = getDB();
      const usersCollection = db.collection('users');

      // Fetch user details including accountType
      const user = await usersCollection.findOne(
        { _id: new ObjectId(decoded.id) },
        { projection: { password: 0 } } // Exclude password
      );

      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }

      req.user = {
        id: user._id,
        email: user.email,
        accountType: user.accountType || 'free', // Include accountType
        // Include other necessary fields
      };

      next();
    } catch (err) {
      console.error('Auth Middleware Error:', err);
      res.status(401).json({ error: 'Invalid token.' });
    }
  } else {
    res.status(401).json({ error: 'No token provided.' });
  }
};

module.exports = authMiddleware;
