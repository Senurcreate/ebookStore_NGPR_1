const Notification = require('./notification.model');
const Book = require('../books/book.model');
const Wishlist = require('../wishlist/wishlist.model');

class NotificationService {
    /**
     * Send notification for new book release
     */
    static async notifyNewBookRelease(bookId) {
        try {
            const book = await Book.findById(bookId);
            if (!book) return;
            console.log(`📢 New book released: ${book.title}`);
        
            await Notification.createNotification(
                'admin-user-id-here', 
                {
                    type: 'new_release',
                    title: 'New Book Released',
                    message: `"${book.title}" by ${book.author} has been published`,
                    data: { bookId: book._id },
                    actionLink: `/books/${book._id}`,
                    actionText: 'View Book',
                    icon: '📖'
                }
            );

        } catch (error) {
            console.error('Error notifying new book release:', error);
        }
    }

    /**
     * Send notification for wishlist update
     */
    static async notifyWishlistUpdate(userId, bookId, action = 'added') {
        try {
            const book = await Book.findById(bookId);
            if (!book) return;

            const actions = {
                added: 'added to',
                removed: 'removed from',
                price_drop: 'price dropped for',
                available: 'now available'
            };

            const actionText = actions[action] || 'updated for';

            await Notification.createNotification(userId, {
                type: 'wishlist',
                title: 'Wishlist Update',
                message: `"${book.title}" has been ${actionText} your wishlist`,
                data: { bookId: book._id, action },
                actionLink: `/books/${book._id}`,
                actionText: 'View Book',
                icon: '❤️',
                priority: 'low'
            });

        } catch (error) {
            console.error('Error notifying wishlist update:', error);
        }
    }

    /**
     * Send purchase confirmation
     */
    static async notifyPurchase(userId, purchase) {
        try {
            await Notification.createNotification(userId, {
                type: 'purchase',
                title: 'Purchase Confirmed',
                message: `Thank you for your purchase! Order: ${purchase.simulatedOrderId}`,
                data: { purchaseId: purchase._id, bookId: purchase.book },
                actionLink: `/purchases/${purchase._id}`,
                actionText: 'View Purchase',
                icon: '💰',
                priority: 'medium'
            });

        } catch (error) {
            console.error('Error notifying purchase:', error);
        }
    }

    /**
     * Send download confirmation
     */
    static async notifyDownload(userId, bookId, downloadType) {
        try {
            const book = await Book.findById(bookId);
            if (!book) return;

            const typeText = downloadType === 'free' ? 'free download' : 'purchased download';

            await Notification.createNotification(userId, {
                type: 'download',
                title: 'Download Complete',
                message: `"${book.title}" has been ${typeText} successfully`,
                data: { bookId: book._id, downloadType },
                actionLink: `/books/${book._id}`,
                actionText: 'View Book',
                icon: '📥',
                priority: 'low'
            });

        } catch (error) {
            console.error('Error notifying download:', error);
        }
    }

    /**
     * Send system announcement
     */
    static async sendSystemAnnouncement(title, message, priority = 'medium') {
        try {
            // This would be called by admin
            console.log(`📢 System announcement: ${title}`);
            return { success: true, message: 'Announcement prepared' };

        } catch (error) {
            console.error('Error sending system announcement:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check for and send scheduled notifications
     */
    static async checkScheduledNotifications() {
        try {
            // This would be called by a cron job
            // Check for events that need notifications 
            // Example: Check for new books in last 24 hours
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            
            const newBooks = await Book.find({
                createdAt: { $gte: oneDayAgo }
            });
            
            for (const book of newBooks) {
                // Notify users interested in this genre
                // This is a simplified example
                console.log(`New book to notify: ${book.title}`);
            }
            
            return { checked: true, newBooks: newBooks.length };
            
        } catch (error) {
            console.error('Error checking scheduled notifications:', error);
            return { checked: false, error: error.message };
        }
    }
}

module.exports = NotificationService;