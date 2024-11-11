// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../utils/db');
const { ObjectId } = require('mongodb');
require('dotenv').config();

/**
 * Generates a JWT token for authenticated users.
 *
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, accountType: user.accountType },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token validity
  );
};

/**
 * Register a new user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with accountType "free"
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      accountType: 'free', // Set default account type
      createdAt: new Date(),
    });

    // Construct the user object manually
    const user = {
      _id: result.insertedId,
      email,
      accountType: 'free',
      createdAt: new Date(),
    };

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
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
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

/**
 * Upgrade user subscription
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.upgradeSubscription = async (req, res) => {
  const userId = req.user.id; // Retrieved from authMiddleware
  const { accountType } = req.body; // Expected: "paid", "premium", etc.

  // Validate accountType
  const validAccountTypes = ['free', 'paid', 'premium'];
  if (!validAccountTypes.includes(accountType)) {
    return res.status(400).json({ error: 'Invalid account type.' });
  }

  try {
    const db = getDB();
    const usersCollection = db.collection('users');

    // Update the user's accountType
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { accountType } }
    );

    // Retrieve the updated user
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    // Generate a new token with updated accountType
    const token = jwt.sign(
      { id: updatedUser._id, email: updatedUser.email, accountType: updatedUser.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Subscription upgraded successfully.',
      token,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        accountType: updatedUser.accountType,
      },
    });
  } catch (error) {
    console.error('Upgrade Subscription Error:', error);
    res.status(500).json({ error: 'Server error during subscription upgrade.' });
  }
};
