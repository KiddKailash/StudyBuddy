/**
 * User Routes Module
 * 
 * Defines Express.js routes for user account management and preferences.
 * Provides endpoints for updating user information, changing passwords,
 * and managing user-specific settings.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

/**
 * @route   PUT /api/users/update
 * @desc    Update user account information (firstName, lastName, email, company)
 * @access  Private (JWT required)
 * @body    {firstName, lastName, email, company}
 */
router.put('/update', authMiddleware, userController.updateAccountInfo);

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password with current password verification
 * @access  Private (JWT required)
 * @body    {currentPassword, newPassword}
 */
router.put('/change-password', authMiddleware, userController.changePassword);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences (e.g. darkMode, notificationsEnabled)
 * @access  Private (JWT required)
 * @body    {preferences} - Object containing user preference settings
 */
router.put('/preferences', authMiddleware, userController.updatePreferences);

module.exports = router;
