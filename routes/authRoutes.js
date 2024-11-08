// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user and return JWT
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/auth/upgrade
// @desc    Upgrade user subscription
// @access  Private
router.post('/upgrade', authMiddleware, authController.upgradeSubscription);

module.exports = router;
