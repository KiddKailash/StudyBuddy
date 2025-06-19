/**
 * Authentication Routes Module
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public (no authentication required)
 * @body    {email, password, firstName, lastName, company}
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public (no authentication required)
 * @body    {email, password}
 * @returns {token, user} - JWT token and user data
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh the user's JWT token (sliding expiration)
 * @access  Private (JWT required)
 * @returns {token} - New JWT token
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/upgrade
 * @desc    Upgrade user subscription to paid plan
 * @access  Private (JWT required)
 * @body    {accountType} - Subscription plan type
 */
router.post('/upgrade', authMiddleware, authController.upgradeSubscription);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user's data
 * @access  Private (JWT required)
 * @returns {user} - Current user object with subscription info
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
