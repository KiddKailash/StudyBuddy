const { getDB } = require('../utils/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

/**
 * Update account information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAccountInfo = async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, company } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Update user fields
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          firstName,
          lastName,
          email,
          company: company || null,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return updated user data
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating account information:', error);
    res.status(500).json({ error: 'Server error while updating account information.' });
  }
};

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Find the user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if currentPassword matches the stored hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password
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
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePreferences = async (req, res) => {
  const userId = req.user.id;
  const { preferences } = req.body;

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

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return updated user data
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Server error while updating preferences.' });
  }
};
