const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/firebase.middleware');

// Apply admin authentication to all routes
router.use(verifyFirebaseToken, requireAdmin);

// ====================
// DASHBOARD & OVERVIEW
// ====================

// @route   GET /api/admin/dashboard
// @desc    Get comprehensive dashboard statistics
// @access  Private/Admin
router.get('/dashboard', adminController.getDashboardStats);

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics with date ranges
// @access  Private/Admin
router.get('/analytics', adminController.getAnalytics);

// ====================
// SALES ANALYTICS
// ====================

// @route   GET /api/admin/analytics/sales
// @desc    Get sales analytics and trends
// @access  Private/Admin
router.get('/analytics/sales', adminController.getSalesAnalytics);

// ====================
// USER ANALYTICS
// ====================

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics and growth
// @access  Private/Admin
router.get('/analytics/users', adminController.getUserAnalytics);

// ====================
// CONTENT MODERATION
// ====================

// @route   GET /api/admin/moderation
// @desc    Get content moderation dashboard
// @access  Private/Admin
router.get('/moderation', adminController.getModerationDashboard);

// @route   PUT /api/admin/moderation/reviews/:id
// @desc    Moderate a review (hide/show)
// @access  Private/Admin
router.put('/moderation/reviews/:id', adminController.moderateReview);

// @route   DELETE /api/admin/moderation/reviews/:id/reports
// @desc    Clear all reports from a review
// @access  Private/Admin
router.delete('/moderation/reviews/:id/reports', adminController.clearReviewReports);

// ====================
// SYSTEM MANAGEMENT
// ====================

// @route   GET /api/admin/system/health
// @desc    Get system health and performance metrics
// @access  Private/Admin
router.get('/system/health', adminController.getSystemHealth);

// @route   DELETE /api/admin/system/cache
// @desc    Clear system cache
// @access  Private/Admin
router.delete('/system/cache', adminController.clearCache);

// ====================
// DATA EXPORT (Optional)
// ====================

// @route   GET /api/admin/export/users
// @desc    Export user data (CSV/JSON)
// @access  Private/Admin
router.get('/export/users', async (req, res) => {
    try {
        const users = await User.find({})
            .select('-firebaseUID -__v -updatedAt')
            .lean();

        // For CSV export, you would convert to CSV
        // For now, return JSON
        res.status(200).json({
            success: true,
            data: users,
            format: 'json',
            count: users.length,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export user data'
        });
    }
});

// @route   GET /api/admin/export/sales
// @desc    Export sales data
// @access  Private/Admin
router.get('/export/sales', async (req, res) => {
    try {
        const purchases = await Purchase.find({ status: 'completed' })
            .populate('user', 'displayName email')
            .populate('book', 'title author')
            .sort({ purchasedAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: purchases,
            format: 'json',
            count: purchases.length,
            exportedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error exporting sales:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export sales data'
        });
    }
});

// ====================
// ADMIN USER MANAGEMENT
// ====================

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', role = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-firebaseUID -__v')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (change role, disable, etc.)
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { role, disabled, displayName, email } = req.body;

        const updates = {};
        if (role !== undefined) updates.role = role;
        if (disabled !== undefined) updates.disabled = disabled;
        if (displayName !== undefined) updates.displayName = displayName;
        if (email !== undefined) updates.email = email;

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-firebaseUID -__v');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
});

// ====================
// DEBUG & DEVELOPMENT
// ====================

if (process.env.NODE_ENV === 'development') {
    // @route   GET /api/admin/debug/models
    // @desc    Get model counts and info (dev only)
    // @access  Private/Admin
    router.get('/debug/models', async (req, res) => {
        try {
            const models = {
                User: await User.countDocuments(),
                Book: await Book.countDocuments(),
                Purchase: await Purchase.countDocuments(),
                Review: await Review.countDocuments(),
                DownloadHistory: await DownloadHistory.countDocuments(),
                Wishlist: await Wishlist.countDocuments(),
                Notification: await Notification.countDocuments()
            };

            res.json({
                success: true,
                models,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // @route   GET /api/admin/debug/queries
    // @desc    Test complex queries (dev only)
    // @access  Private/Admin
    router.get('/debug/queries', async (req, res) => {
        try {
            // Test a complex aggregation query
            const testQuery = await Purchase.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: {
                            month: { $month: '$purchasedAt' },
                            year: { $year: '$purchasedAt' }
                        },
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$amount' },
                        avgPurchase: { $avg: '$amount' }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 6 }
            ]);

            res.json({
                success: true,
                query: 'Monthly sales breakdown',
                result: testQuery
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

module.exports = router;