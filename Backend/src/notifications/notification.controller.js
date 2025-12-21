const Notification = require('./notification.model');
const User = require('../users/user.model');

/**
 * Get user's notifications
 */
async function getUserNotifications(req, res) {
    try {
        const userId = req.user?._id;
        const {
            page = 1,
            limit = 20,
            type,
            isRead,
            priority,
            sort = 'newest'
        } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Build query
        const query = { user: userId };
        
        if (type) query.type = type;
        if (isRead !== undefined) query.isRead = isRead === 'true';
        if (priority) query.priority = priority;

        // Build sort options
        let sortOptions = {};
        switch (sort) {
            case 'oldest':
                sortOptions.createdAt = 1;
                break;
            case 'priority':
                // Custom sort: pinned first, then by priority
                // We'll handle this differently
                sortOptions.isPinned = -1;
                sortOptions.createdAt = -1;
                break;
            case 'newest':
            default:
                sortOptions.isPinned = -1;
                sortOptions.createdAt = -1;
        }

        // Get notifications with pagination
        let notifications = await Notification.find(query)
            .sort(sortOptions)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .lean();

        // If sorting by priority, we need to sort in memory
        if (sort === 'priority') {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            notifications.sort((a, b) => {
                // Pinned first
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                
                // Then by priority
                const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                
                // Then by date (newest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        }

        // Get unread count
        const unreadCount = await Notification.countDocuments({
            user: userId,
            isRead: false
        });

        // Get total count
        const total = await Notification.countDocuments(query);

        // Get notification statistics
        const stats = await Notification.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    unread: {
                        $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                    },
                    byType: {
                        $push: '$type'
                    },
                    byPriority: {
                        $push: '$priority'
                    }
                }
            }
        ]);

        // Format stats
        const notificationStats = {
            total: stats[0]?.total || 0,
            unread: stats[0]?.unread || 0,
            byType: {},
            byPriority: {}
        };

        if (stats[0]?.byType) {
            stats[0].byType.forEach(type => {
                notificationStats.byType[type] = (notificationStats.byType[type] || 0) + 1;
            });
        }

        if (stats[0]?.byPriority) {
            stats[0].byPriority.forEach(priority => {
                notificationStats.byPriority[priority] = (notificationStats.byPriority[priority] || 0) + 1;
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: notifications,
            stats: notificationStats,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
                hasNext: (parseInt(page) * parseInt(limit)) < total,
                hasPrevious: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
}

/**
 * Get unread notification count
 */
async function getUnreadCount(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const count = await Notification.countDocuments({
            user: userId,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            count
        });

    } catch (error) {
        console.error('Error fetching unread count:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error.message
        });
    }
}

/**
 * Mark notification as read
 */
async function markAsRead(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: userId },
            { $set: { isRead: true } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
}

/**
 * Mark all notifications as read
 */
async function markAllAsRead(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const result = await Notification.updateMany(
            { user: userId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Error marking all as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
}

/**
 * Mark notification as unread
 */
async function markAsUnread(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: userId },
            { $set: { isRead: false } },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification marked as unread',
            notification
        });

    } catch (error) {
        console.error('Error marking notification as unread:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark notification as unread',
            error: error.message
        });
    }
}

/**
 * Toggle notification pin
 */
async function togglePin(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const notification = await Notification.findOne({ _id: id, user: userId });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.isPinned = !notification.isPinned;
        await notification.save();

        return res.status(200).json({
            success: true,
            message: `Notification ${notification.isPinned ? 'pinned' : 'unpinned'}`,
            notification
        });

    } catch (error) {
        console.error('Error toggling notification pin:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to toggle notification pin',
            error: error.message
        });
    }
}

/**
 * Delete a notification
 */
async function deleteNotification(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const notification = await Notification.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
}

/**
 * Clear all notifications
 */
async function clearAllNotifications(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const result = await Notification.deleteMany({ user: userId });

        return res.status(200).json({
            success: true,
            message: 'All notifications cleared',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error clearing notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear notifications',
            error: error.message
        });
    }
}

/**
 * Create a notification (for internal use)
 */
async function createNotification(req, res) {
    try {
        const userId = req.user?._id;
        const {
            type = 'system',
            title,
            message,
            data = {},
            actionLink,
            actionText,
            icon,
            priority = 'medium',
            isPinned = false,
            expiresAt
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        const notification = await Notification.createNotification(userId, {
            type,
            title,
            message,
            data,
            actionLink,
            actionText,
            icon,
            priority,
            isPinned,
            expiresAt
        });

        return res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            notification
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: error.message
        });
    }
}

/**
 * Get notification preferences (from user model)
 */
async function getPreferences(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const user = await User.findById(userId).select('preferences');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            preferences: user.preferences?.notifications || {
                email: true,
                push: true,
                inApp: true
            }
        });

    } catch (error) {
        console.error('Error fetching preferences:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch preferences',
            error: error.message
        });
    }
}

/**
 * Update notification preferences
 */
async function updatePreferences(req, res) {
    try {
        const userId = req.user?._id;
        const { email, push, inApp } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const updates = {};
        if (email !== undefined) {
            updates['preferences.notifications.email'] = email;
        }
        if (push !== undefined) {
            updates['preferences.notifications.push'] = push;
        }
        if (inApp !== undefined) {
            updates['preferences.notifications.inApp'] = inApp;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('preferences');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: user.preferences?.notifications
        });

    } catch (error) {
        console.error('Error updating preferences:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update preferences',
            error: error.message
        });
    }
}

module.exports = {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    togglePin,
    deleteNotification,
    clearAllNotifications,
    createNotification,
    getPreferences,
    updatePreferences
};