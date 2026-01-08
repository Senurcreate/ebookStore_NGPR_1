const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyFirebaseToken, requireAdmin, requireAdminOrModerator } = require('../middleware/firebase.middleware');

// Apply Firebase authentication to all routes
router.use(verifyFirebaseToken);


// USER PROFILE ROUTES
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateProfile);
router.patch('/me/preferences', userController.updatePreferences);
router.patch('/me/password', userController.changePassword);

// USER ACTIVITY ROUTES
router.get('/me/stats', userController.getUserStats);
router.get('/me/reading-history', userController.getReadingHistory);
router.post('/me/reading-history', userController.addToReadingHistory);
router.get('/me/purchases', userController.getUserPurchases);
router.get('/me/download-history', userController.getUserDownloadHistory);


// ADMIN ROUTES
router.get('/', requireAdmin, userController.getAllUsers);
router.get('/:id', requireAdmin, userController.getUserById);
router.delete('/:id', requireAdmin, userController.deleteUser);

// MODERATOR ROUTES
router.get('/mod/users', requireAdminOrModerator, userController.getAllUsers);
router.get('/mod/users/:id', requireAdminOrModerator, userController.getUserById);

module.exports = router;