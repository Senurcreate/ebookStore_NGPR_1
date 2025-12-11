const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const adminNotificationController = require('./notification.admin.controller');
const { verifyFirebaseToken, requireAdmin, requireAdminOrModerator } = require('../middleware/firebase.middleware');

// ====================
// USER NOTIFICATION ROUTES
// ====================

// Apply authentication middleware to user routes
router.use(verifyFirebaseToken);

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', notificationController.getUserNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', notificationController.getUnreadCount);

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', notificationController.getPreferences);

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', notificationController.updatePreferences);

// @route   POST /api/notifications
// @desc    Create a notification (for testing/internal use)
// @access  Private
router.post('/', notificationController.createNotification);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', notificationController.markAllAsRead);

// @route   PUT /api/notifications/:id/unread
// @desc    Mark notification as unread
// @access  Private
router.put('/:id/unread', notificationController.markAsUnread);

// @route   PUT /api/notifications/:id/pin
// @desc    Toggle notification pin
// @access  Private
router.put('/:id/pin', notificationController.togglePin);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', notificationController.deleteNotification);

// @route   DELETE /api/notifications
// @desc    Clear all notifications
// @access  Private
router.delete('/', notificationController.clearAllNotifications);

// ====================
// ADMIN NOTIFICATION ROUTES
// ====================

// @route   POST /api/notifications/admin/broadcast
// @desc    Send notification to all users (admin only)
// @access  Private/Admin
router.post('/admin/broadcast', requireAdmin, adminNotificationController.broadcastNotification);

// @route   POST /api/notifications/admin/send
// @desc    Send notification to specific users (admin only)
// @access  Private/Admin
router.post('/admin/send', requireAdmin, adminNotificationController.sendToUsers);

// @route   GET /api/notifications/admin/stats
// @desc    Get notification statistics (admin only)
// @access  Private/Admin
router.get('/admin/stats', requireAdmin, adminNotificationController.getNotificationStats);

// @route   DELETE /api/notifications/admin/cleanup
// @desc    Clean up expired notifications (admin only)
// @access  Private/Admin
router.delete('/admin/cleanup', requireAdmin, adminNotificationController.cleanupExpired);

// @route   GET /api/notifications/admin/user/:userId
// @desc    Get notifications for a specific user (admin view)
// @access  Private/Admin
router.get('/admin/user/:userId', requireAdmin, adminNotificationController.getUserNotificationsAdmin);

module.exports = router;