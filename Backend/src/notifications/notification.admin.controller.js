const Notification = require('./notification.model');
const User = require('../users/user.model');

/**
 * Send notification to all users (admin only)
 */
async function broadcastNotification(req, res) {
    try {
        const adminId = req.user?._id;
        const {
            type = 'system',
            title,
            message,
            data = {},
            actionLink,
            actionText,
            icon,
            priority = 'medium',
            userType = 'all' // 'all', 'premium', 'free'
        } = req.body;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        // Get all users
        let userQuery = {};
        if (userType === 'premium') {
            userQuery.isPremium = true;
        } else if (userType === 'free') {
            userQuery.isPremium = { $ne: true };
        }

        const users = await User.find(userQuery).select('_id');
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found'
            });
        }

        // Create notifications for each user
        const notifications = [];
        const groupId = `broadcast-${Date.now()}`;

        for (const user of users) {
            const notification = await Notification.createNotification(user._id, {
                type,
                title,
                message,
                data,
                actionLink,
                actionText,
                icon,
                priority,
                groupId
            });
            notifications.push(notification._id);
        }

        return res.status(201).json({
            success: true,
            message: `Notification sent to ${users.length} users`,
            sentCount: users.length,
            groupId,
            notificationIds: notifications.slice(0, 10) // Return first 10 IDs
        });

    } catch (error) {
        console.error('Error broadcasting notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to broadcast notification',
            error: error.message
        });
    }
}

/**
 * Send notification to specific users (admin only)
 */
async function sendToUsers(req, res) {
    try {
        const adminId = req.user?._id;
        const {
            userIds = [],
            userEmails = [],
            type = 'system',
            title,
            message,
            data = {},
            actionLink,
            actionText,
            icon,
            priority = 'medium'
        } = req.body;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Title and message are required'
            });
        }

        // Get users by IDs or emails
        let users = [];
        
        if (userIds.length > 0) {
            users = await User.find({ _id: { $in: userIds } }).select('_id');
        } else if (userEmails.length > 0) {
            users = await User.find({ email: { $in: userEmails } }).select('_id');
        }

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found'
            });
        }

        // Create notifications
        const notifications = [];
        const groupId = `targeted-${Date.now()}`;

        for (const user of users) {
            const notification = await Notification.createNotification(user._id, {
                type,
                title,
                message,
                data,
                actionLink,
                actionText,
                icon,
                priority,
                groupId
            });
            notifications.push(notification._id);
        }

        return res.status(201).json({
            success: true,
            message: `Notification sent to ${users.length} users`,
            sentCount: users.length,
            groupId,
            notificationIds: notifications
        });

    } catch (error) {
        console.error('Error sending notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send notifications',
            error: error.message
        });
    }
}

/**
 * Get system-wide notification statistics (admin only)
 */
async function getNotificationStats(req, res) {
    try {
        const adminId = req.user?._id;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const { startDate, endDate } = req.query;
        const dateFilter = {};
        
        if (startDate) {
            dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.$lte = new Date(endDate);
        }

        const matchStage = {};
        if (Object.keys(dateFilter).length > 0) {
            matchStage.createdAt = dateFilter;
        }

        const stats = await Notification.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    readCount: { 
                        $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] }
                    },
                    byType: {
                        $push: '$type'
                    },
                    byPriority: {
                        $push: '$priority'
                    },
                    byDay: {
                        $push: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        }
                    }
                }
            },
            {
                $project: {
                    total: 1,
                    readCount: 1,
                    unreadCount: { $subtract: ['$total', '$readCount'] },
                    readRate: {
                        $cond: [
                            { $eq: ['$total', 0] },
                            0,
                            { $multiply: [{ $divide: ['$readCount', '$total'] }, 100] }
                        ]
                    },
                    byType: 1,
                    byPriority: 1,
                    byDay: 1
                }
            }
        ]);

        // Calculate daily distribution
        const dailyStats = {};
        if (stats[0]?.byDay) {
            stats[0].byDay.forEach(day => {
                dailyStats[day] = (dailyStats[day] || 0) + 1;
            });
        }

        // Calculate type distribution
        const typeDistribution = {};
        if (stats[0]?.byType) {
            stats[0].byType.forEach(type => {
                typeDistribution[type] = (typeDistribution[type] || 0) + 1;
            });
        }

        // Calculate priority distribution
        const priorityDistribution = {};
        if (stats[0]?.byPriority) {
            stats[0].byPriority.forEach(priority => {
                priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
            });
        }

        return res.status(200).json({
            success: true,
            stats: {
                total: stats[0]?.total || 0,
                readCount: stats[0]?.readCount || 0,
                unreadCount: stats[0]?.unreadCount || 0,
                readRate: stats[0]?.readRate || 0,
                typeDistribution,
                priorityDistribution,
                dailyStats: Object.entries(dailyStats)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .slice(-30) // Last 30 days
            }
        });

    } catch (error) {
        console.error('Error fetching notification stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch notification statistics',
            error: error.message
        });
    }
}

/**
 * Delete expired notifications (admin only)
 */
async function cleanupExpired(req, res) {
    try {
        const adminId = req.user?._id;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const result = await Notification.deleteMany({
            expiresAt: { $lte: new Date() }
        });

        return res.status(200).json({
            success: true,
            message: 'Expired notifications cleaned up',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error cleaning up notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clean up notifications',
            error: error.message
        });
    }
}

/**
 * Get notifications for a specific user (admin view)
 */
async function getUserNotificationsAdmin(req, res) {
    try {
        const adminId = req.user?._id;
        const { userId } = req.params;
        const { limit = 50 } = req.query;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        const user = await User.findById(userId).select('displayName email');

        return res.status(200).json({
            success: true,
            user: user || { _id: userId },
            notifications,
            count: notifications.length
        });

    } catch (error) {
        console.error('Error fetching user notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user notifications',
            error: error.message
        });
    }
}

module.exports = {
    broadcastNotification,
    sendToUsers,
    getNotificationStats,
    cleanupExpired,
    getUserNotificationsAdmin
};