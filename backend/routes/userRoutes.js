const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// @route   PUT /api/users/update
// @desc    Update account information (firstName, lastName, email, company)
// @access  Private
router.put('/update', authMiddleware, userController.updateAccountInfo);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authMiddleware, userController.changePassword);

// @route   PUT /api/users/preferences
// @desc    Update user preferences (e.g. darkMode, notificationsEnabled)
// @access  Private
router.put('/preferences', authMiddleware, userController.updatePreferences);

module.exports = router;
