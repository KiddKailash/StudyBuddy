/**
 * User Controller
 * 
 * Manages user account operations and user preferences.
 * Provides endpoints for updating account information, changing passwords,
 * and managing user-specific settings.
 * Handles user data operations separately from authentication processes.
 */
const { getDB } = require('../database/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

/**
 * Update account information
 * 
 * Updates the user's basic account information including name, email, and company.
 * Validates required fields and ensures data integrity.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} req.body.email - User's email address
 * @param {string} [req.body.company] - User's company (optional)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user data or error
 */
exports.updateAccountInfo = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, company } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Update user fields in the database
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          firstName,
          lastName,
          email,
          company: company || null, // Handle optional company field
        },
      }
    );

    // Check if the user was found and updated
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return updated user data (excluding password for security)
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    );

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating account information:', error);
    res.status(500).json({ error: 'Server error while updating account information.' });
  }
};

/**
 * Change user password
 * 
 * Allows users to change their password with current password verification.
 * Uses bcrypt for secure password hashing and comparison.
 * 
 * Process Flow:
 * 1. Validates current and new password are provided
 * 2. Retrieves user's current hashed password
 * 3. Verifies current password matches stored hash
 * 4. Hashes new password with bcrypt
 * 5. Updates password in database
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.currentPassword - User's current password
 * @param {string} req.body.newPassword - User's new password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message or error
 */
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  // Validate required parameters
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Find the user by ID to get current password hash
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Verify current password matches the stored hash using bcrypt
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash the new password with bcrypt (10 salt rounds for security)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error while changing password.' });
  }
};

/**
 * Update user preferences
 * 
 * Updates user-specific preferences stored as a flexible object.
 * Creates preferences object if it doesn't exist, or updates existing preferences.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.user.id - Authenticated user ID
 * @param {Object} req.body - Request body
 * @param {Object} req.body.preferences - User preferences object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user data or error
 */
exports.updatePreferences = async (req, res) => {
  const userId = req.user.id;
  const { preferences } = req.body;

  // Validate preferences object
  if (!preferences || typeof preferences !== 'object') {
    return res.status(400).json({ error: 'Invalid preferences object.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Update the preferences field. If preferences doesn't exist, it will be created.
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { preferences } }
    );

    // Check if the user was found and updated
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return updated user data (excluding password for security)
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password from response
    );

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Server error while updating preferences.' });
  }
};
