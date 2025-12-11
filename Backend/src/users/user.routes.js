const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyFirebaseToken, requireAdmin, requireAdminOrModerator } = require('../middleware/firebase.middleware');

// Apply Firebase authentication to all routes
router.use(verifyFirebaseToken);

// ====================
// USER PROFILE ROUTES
// ====================

// @route   GET /api/users/me
// @desc    Get current user profile with stats
// @access  Private
router.get('/me', userController.getCurrentUser);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', userController.updateProfile);

// @route   PATCH /api/users/me/preferences
// @desc    Update user preferences
// @access  Private
router.patch('/me/preferences', userController.updatePreferences);

// ====================
// USER ACTIVITY ROUTES
// ====================

// @route   GET /api/users/me/stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/me/stats', userController.getUserStats);

// @route   GET /api/users/me/reading-history
// @desc    Get user's reading history
// @access  Private
router.get('/me/reading-history', userController.getReadingHistory);

// @route   POST /api/users/me/reading-history
// @desc    Add book to reading history
// @access  Private
router.post('/me/reading-history', userController.addToReadingHistory);

// @route   GET /api/users/me/purchases
// @desc    Get user's purchase history
// @access  Private
router.get('/me/purchases', userController.getUserPurchases);

// @route   GET /api/users/me/download-history
// @desc    Get user's download history
// @access  Private
router.get('/me/download-history', userController.getUserDownloadHistory);

// ====================
// ADMIN ROUTES
// ====================

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', requireAdmin, userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', requireAdmin, userController.getUserById);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', requireAdmin, userController.deleteUser);

// ====================
// MODERATOR ROUTES
// ====================

// @route   GET /api/users/mod/users
// @desc    Get all users (Moderator can view)
// @access  Private/Moderator
router.get('/mod/users', requireAdminOrModerator, userController.getAllUsers);

// @route   GET /api/users/mod/users/:id
// @desc    Get user by ID (Moderator can view)
// @access  Private/Moderator
router.get('/mod/users/:id', requireAdminOrModerator, userController.getUserById);

module.exports = router;