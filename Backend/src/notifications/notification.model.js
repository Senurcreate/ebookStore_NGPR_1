const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'system',           // System announcements, maintenance
            'new_release',      // New book releases
            'wishlist',         // Wishlist updates (price drop, availability)
            'purchase',         // Purchase confirmations, receipts
            'download',         // Download confirmations
            'review',           // Review responses, likes
            'promotion',        // Special offers, discounts
            'achievement',      // Reading milestones
            'security'          // Security alerts
        ],
        default: 'system'
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    // Additional data for the notification
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Link for actions (e.g., "View Book", "Go to Purchase")
    actionLink: {
        type: String,
        trim: true
    },
    actionText: {
        type: String,
        trim: true,
        maxlength: 30
    },
    // Visual icon/color
    icon: {
        type: String,
        default: '📚'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    // Read status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    // Expiration for time-sensitive notifications
    expiresAt: {
        type: Date
    },
    // When notification was actually sent/delivered
    deliveredAt: {
        type: Date,
        default: Date.now
    },
    // Track if notification was sent via email/push
    sentVia: [{
        channel: {
            type: String,
            enum: ['in_app', 'email', 'push']
        },
        sentAt: Date,
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed', 'opened']
        }
    }],
    // For grouping related notifications
    groupId: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
    const now = new Date();
    const diffMs = now - this.createdAt;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    
    const diffDays = diffHours / 24;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    
    const diffWeeks = diffDays / 7;
    if (diffWeeks < 4) return `${Math.floor(diffWeeks)}w ago`;
    
    return `${Math.floor(diffDays / 30)}mo ago`;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
    this.isRead = false;
    return this.save();
};

// Method to toggle pin
notificationSchema.methods.togglePin = function() {
    this.isPinned = !this.isPinned;
    return this.save();
};

// Static method to create common notification types
notificationSchema.statics.createNotification = async function(userId, options) {
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
        expiresAt,
        groupId
    } = options;
    
    // Set default icon based on type
    const defaultIcons = {
        system: '⚙️',
        new_release: '📖',
        wishlist: '❤️',
        purchase: '💰',
        download: '📥',
        review: '⭐',
        promotion: '🎁',
        achievement: '🏆',
        security: '🔒'
    };
    
    const notification = new this({
        user: userId,
        type,
        title,
        message,
        data,
        actionLink,
        actionText: actionText || this.getDefaultActionText(type),
        icon: icon || defaultIcons[type] || '📚',
        priority,
        isPinned,
        expiresAt,
        groupId
    });
    
    await notification.save();
    return notification;
};

// Helper for default action text
notificationSchema.statics.getDefaultActionText = function(type) {
    const actions = {
        new_release: 'View Book',
        wishlist: 'Check Wishlist',
        purchase: 'View Purchase',
        download: 'Download Again',
        review: 'See Review',
        promotion: 'Claim Offer'
    };
    return actions[type] || 'View Details';
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;