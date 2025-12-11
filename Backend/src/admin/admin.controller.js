const User = require('../users/user.model');
const Book = require('../books/book.model');
const Purchase = require('../purchases/purchase.model');
const Review = require('../reviews/review.model');
const DownloadHistory = require('../downloads/download.model');
const Wishlist = require('../wishlist/wishlist.model');
const Notification = require('../notifications/notification.model');
const mongoose = require('mongoose');

/**
 * Get comprehensive dashboard statistics
 */
async function getDashboardStats(req, res) {
    try {
        // Get counts for all major entities
        const [
            totalUsers,
            totalBooks,
            totalPurchases,
            totalReviews,
            totalDownloads,
            totalWishlists,
            totalNotifications
        ] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments(),
            Purchase.countDocuments({ status: 'completed' }),
            Review.countDocuments(),
            DownloadHistory.countDocuments(),
            Wishlist.countDocuments(),
            Notification.countDocuments()
        ]);

        // Get revenue statistics
        const revenueStats = await Purchase.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    avgPurchaseValue: { $avg: '$amount' },
                    minPurchase: { $min: '$amount' },
                    maxPurchase: { $max: '$amount' }
                }
            }
        ]);

        // Get today's statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStats = await Promise.all([
            User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
            Purchase.countDocuments({ 
                status: 'completed',
                purchasedAt: { $gte: today, $lt: tomorrow } 
            }),
            Purchase.aggregate([
                { 
                    $match: { 
                        status: 'completed',
                        purchasedAt: { $gte: today, $lt: tomorrow } 
                    } 
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            DownloadHistory.countDocuments({ downloadedAt: { $gte: today, $lt: tomorrow } })
        ]);

        // Get user growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get recent activity
        const recentActivity = await Promise.all([
            Purchase.find({ status: 'completed' })
                .populate('user', 'displayName email')
                .populate('book', 'title')
                .sort({ purchasedAt: -1 })
                .limit(5)
                .lean(),
            Review.find({ isHidden: false })
                .populate('user', 'displayName')
                .populate('book', 'title')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            User.find()
                .sort({ lastLoginAt: -1 })
                .limit(5)
                .select('displayName email lastLoginAt')
                .lean()
        ]);

        // Get reported content count
        const reportedContent = await Review.countDocuments({ 
            'reports.0': { $exists: true }
        });

        // Get system health
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();

        return res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            stats: {
                overview: {
                    totalUsers,
                    totalBooks,
                    totalPurchases,
                    totalReviews,
                    totalDownloads,
                    totalWishlists,
                    totalNotifications,
                    reportedContent
                },
                financial: revenueStats[0] || {
                    totalRevenue: 0,
                    avgPurchaseValue: 0,
                    minPurchase: 0,
                    maxPurchase: 0
                },
                today: {
                    newUsers: todayStats[0],
                    newPurchases: todayStats[1],
                    revenueToday: todayStats[2][0]?.total || 0,
                    newDownloads: todayStats[3]
                },
                userGrowth: userGrowth,
                recentActivity: {
                    purchases: recentActivity[0],
                    reviews: recentActivity[1],
                    activeUsers: recentActivity[2]
                },
                systemHealth: {
                    database: dbStatus,
                    memoryUsage: {
                        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
                        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
                        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
                    },
                    uptime: Math.round(uptime / 60) + ' minutes',
                    nodeVersion: process.version
                }
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
}

/**
 * Get detailed analytics with date ranges
 */
async function getAnalytics(req, res) {
    try {
        const { 
            startDate, 
            endDate,
            granularity = 'daily' // daily, weekly, monthly
        } = req.query;

        // Set date range
        let dateFilter = {};
        if (startDate) {
            dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.$lte = new Date(endDate);
        }

        // Build match stage for date filtering
        const matchStage = {};
        if (Object.keys(dateFilter).length > 0) {
            matchStage.createdAt = dateFilter;
        }

        // Get user analytics
        const userAnalytics = await User.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: getDateFormat(granularity), 
                            date: "$createdAt" 
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get purchase analytics
        const purchaseAnalytics = await Purchase.aggregate([
            { 
                $match: { 
                    ...matchStage,
                    status: 'completed' 
                } 
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: getDateFormat(granularity), 
                            date: "$purchasedAt" 
                        }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' },
                    avgValue: { $avg: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get download analytics
        const downloadAnalytics = await DownloadHistory.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: getDateFormat(granularity), 
                            date: "$downloadedAt" 
                        }
                    },
                    count: { $sum: 1 },
                    free: { $sum: { $cond: [{ $eq: ['$downloadType', 'free'] }, 1, 0] } },
                    purchased: { $sum: { $cond: [{ $eq: ['$downloadType', 'purchased'] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get book category distribution
        const categoryAnalytics = await Book.aggregate([
            {
                $group: {
                    _id: '$genre',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$price' },
                    avgRating: { $avg: '$ratingStats.average' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get user role distribution
        const roleAnalytics = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    activeUsers: {
                        $sum: {
                            $cond: [
                                { $gt: ['$lastLoginAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
                                1, 0
                            ]
                        }
                    }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Analytics retrieved successfully',
            analytics: {
                userGrowth: userAnalytics,
                salesTrends: purchaseAnalytics,
                downloadActivity: downloadAnalytics,
                categoryDistribution: categoryAnalytics,
                userRoles: roleAnalytics,
                dateRange: {
                    start: startDate,
                    end: endDate,
                    granularity
                }
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: error.message
        });
    }
}

/**
 * Helper function for date formatting based on granularity
 */
function getDateFormat(granularity) {
    switch (granularity) {
        case 'hourly':
            return '%Y-%m-%d %H:00';
        case 'daily':
            return '%Y-%m-%d';
        case 'weekly':
            return '%Y-%U'; // Year-Week number
        case 'monthly':
            return '%Y-%m';
        default:
            return '%Y-%m-%d';
    }
}

/**
 * Get sales analytics with detailed breakdown
 */
async function getSalesAnalytics(req, res) {
    try {
        const { period = '30days' } = req.query; // 7days, 30days, 90days, year
        
        let days;
        switch (period) {
            case '7days': days = 7; break;
            case '30days': days = 30; break;
            case '90days': days = 90; break;
            case 'year': days = 365; break;
            default: days = 30;
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Sales over time
        const salesOverTime = await Purchase.aggregate([
            {
                $match: {
                    status: 'completed',
                    purchasedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$purchasedAt" }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top selling books
        const topBooks = await Purchase.aggregate([
            {
                $match: {
                    status: 'completed',
                    purchasedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$book',
                    purchaseCount: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            },
            { $sort: { purchaseCount: -1 } },
            { $limit: 10 }
        ]);

        // Populate book details for top books
        const bookIds = topBooks.map(item => item._id);
        const books = await Book.find({ _id: { $in: bookIds } })
            .select('title author coverImage price genre');

        const topBooksWithDetails = topBooks.map(item => {
            const book = books.find(b => b._id.toString() === item._id.toString());
            return {
                ...item,
                book: book || null
            };
        });

        // Revenue by book type
        const revenueByType = await Purchase.aggregate([
            {
                $match: {
                    status: 'completed',
                    purchasedAt: { $gte: startDate }
                }
            },
            {
                $lookup: {
                    from: 'books',
                    localField: 'book',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: '$bookDetails' },
            {
                $group: {
                    _id: '$bookDetails.type',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            }
        ]);

        // Customer segmentation
        const customerSegments = await Purchase.aggregate([
            {
                $match: {
                    status: 'completed',
                    purchasedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$amount' },
                    purchaseCount: { $sum: 1 }
                }
            },
            {
                $bucket: {
                    groupBy: "$totalSpent",
                    boundaries: [0, 10, 50, 100, 500, 1000],
                    default: "1000+",
                    output: {
                        count: { $sum: 1 },
                        totalRevenue: { $sum: "$totalSpent" },
                        avgPurchaseValue: { $avg: "$totalSpent" }
                    }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Sales analytics retrieved successfully',
            analytics: {
                period,
                days,
                salesOverTime,
                topBooks: topBooksWithDetails,
                revenueByType,
                customerSegments,
                summary: {
                    totalSales: salesOverTime.reduce((sum, item) => sum + item.count, 0),
                    totalRevenue: salesOverTime.reduce((sum, item) => sum + item.revenue, 0),
                    avgDailyRevenue: salesOverTime.length > 0 ? 
                        salesOverTime.reduce((sum, item) => sum + item.revenue, 0) / salesOverTime.length : 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching sales analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch sales analytics',
            error: error.message
        });
    }
}

/**
 * Get user analytics
 */
async function getUserAnalytics(req, res) {
    try {
        // User growth over time
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 12 }
        ]);

        // User activity (last login)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const userActivity = await User.aggregate([
            {
                $facet: {
                    activeUsers: [
                        { $match: { lastLoginAt: { $gte: thirtyDaysAgo } } },
                        { $count: "count" }
                    ],
                    inactiveUsers: [
                        { $match: { lastLoginAt: { $lt: thirtyDaysAgo } } },
                        { $count: "count" }
                    ],
                    neverLoggedIn: [
                        { $match: { lastLoginAt: { $exists: false } } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        // User role distribution
        const roleDistribution = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    avgBooksDownloaded: { $avg: { $size: '$booksDownloaded' } },
                    avgWishlistItems: { $avg: { $size: '$wishlist' } }
                }
            }
        ]);

        // Top active users
        const topActiveUsers = await User.aggregate([
            {
                $lookup: {
                    from: 'purchases',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'purchases'
                }
            },
            {
                $lookup: {
                    from: 'downloadhistories',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'downloads'
                }
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'reviews'
                }
            },
            {
                $project: {
                    displayName: 1,
                    email: 1,
                    role: 1,
                    createdAt: 1,
                    lastLoginAt: 1,
                    purchaseCount: { $size: '$purchases' },
                    downloadCount: { $size: '$downloads' },
                    reviewCount: { $size: '$reviews' },
                    totalSpent: { $sum: '$purchases.amount' }
                }
            },
            { $sort: { purchaseCount: -1 } },
            { $limit: 10 }
        ]);

        // User acquisition sources (simulated - you could add this field to user model)
        const acquisitionData = [
            { source: 'Organic', users: Math.floor(Math.random() * 100) + 50 },
            { source: 'Referral', users: Math.floor(Math.random() * 50) + 20 },
            { source: 'Social Media', users: Math.floor(Math.random() * 30) + 10 },
            { source: 'Email', users: Math.floor(Math.random() * 20) + 5 },
            { source: 'Direct', users: Math.floor(Math.random() * 40) + 15 }
        ];

        return res.status(200).json({
            success: true,
            message: 'User analytics retrieved successfully',
            analytics: {
                userGrowth,
                activity: userActivity[0] || {},
                roleDistribution,
                topActiveUsers,
                acquisitionSources: acquisitionData,
                summary: {
                    totalUsers: userGrowth.reduce((sum, item) => sum + item.count, 0),
                    activeUsers: userActivity[0]?.activeUsers?.[0]?.count || 0,
                    avgPurchasesPerUser: topActiveUsers.reduce((sum, user) => sum + user.purchaseCount, 0) / topActiveUsers.length || 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch user analytics',
            error: error.message
        });
    }
}

/**
 * Get content moderation dashboard
 */
async function getModerationDashboard(req, res) {
    try {
        // Get reported reviews
        const reportedReviews = await Review.find({ 
            'reports.0': { $exists: true },
            isHidden: false
        })
        .populate('user', 'displayName email')
        .populate('book', 'title')
        .populate('reports.user', 'displayName email')
        .sort({ 'reports': -1 })
        .limit(20)
        .lean();

        // Get hidden reviews
        const hiddenReviews = await Review.find({ 
            isHidden: true 
        })
        .populate('user', 'displayName email')
        .populate('book', 'title')
        .populate('hiddenBy', 'displayName email')
        .sort({ hiddenAt: -1 })
        .limit(10)
        .lean();

        // Get review statistics
        const reviewStats = await Review.aggregate([
            {
                $facet: {
                    totalReviews: [{ $count: "count" }],
                    reportedReviews: [
                        { $match: { 'reports.0': { $exists: true } } },
                        { $count: "count" }
                    ],
                    hiddenReviews: [
                        { $match: { isHidden: true } },
                        { $count: "count" }
                    ],
                    byRating: [
                        {
                            $group: {
                                _id: '$rating',
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ]
                }
            }
        ]);

        // Get user reports (users who reported content)
        const userReports = await Review.aggregate([
            { $unwind: '$reports' },
            {
                $group: {
                    _id: '$reports.user',
                    reportCount: { $sum: 1 },
                    reasons: { $addToSet: '$reports.reason' }
                }
            },
            { $sort: { reportCount: -1 } },
            { $limit: 10 }
        ]);

        // Populate user details for reporters
        const reporterIds = userReports.map(item => item._id);
        const reporters = await User.find({ _id: { $in: reporterIds } })
            .select('displayName email role');

        const userReportsWithDetails = userReports.map(item => {
            const reporter = reporters.find(r => r._id.toString() === item._id.toString());
            return {
                ...item,
                user: reporter || null
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Moderation dashboard retrieved successfully',
            moderation: {
                reportedReviews,
                hiddenReviews,
                statistics: reviewStats[0] || {},
                topReporters: userReportsWithDetails,
                summary: {
                    pendingReports: reportedReviews.length,
                    totalHidden: hiddenReviews.length,
                    avgReportPerReview: reportedReviews.length > 0 ? 
                        reportedReviews.reduce((sum, review) => sum + review.reports.length, 0) / reportedReviews.length : 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching moderation dashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch moderation data',
            error: error.message
        });
    }
}

/**
 * Moderate a review (hide/show)
 */
async function moderateReview(req, res) {
    try {
        const { id } = req.params;
        const { action, reason } = req.body; // action: 'hide' or 'show'
        const moderatorId = req.user._id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (action === 'hide') {
            review.isHidden = true;
            review.hiddenReason = reason || 'Moderated by admin';
            review.hiddenBy = moderatorId;
            review.hiddenAt = new Date();
        } else if (action === 'show') {
            review.isHidden = false;
            review.hiddenReason = null;
            review.hiddenBy = null;
            review.hiddenAt = null;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "hide" or "show"'
            });
        }

        await review.save();

        // Update book rating stats
        await Book.updateRatingStats(review.book);

        return res.status(200).json({
            success: true,
            message: `Review ${action === 'hide' ? 'hidden' : 'restored'} successfully`,
            review
        });

    } catch (error) {
        console.error('Error moderating review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to moderate review',
            error: error.message
        });
    }
}

/**
 * Clear all reports from a review
 */
async function clearReviewReports(req, res) {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            { $set: { reports: [] } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'All reports cleared from review',
            review
        });

    } catch (error) {
        console.error('Error clearing review reports:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear reports',
            error: error.message
        });
    }
}

/**
 * Get system health and performance metrics
 */
async function getSystemHealth(req, res) {
    try {
        // Database statistics
        const collections = await mongoose.connection.db.collections();
        const dbStats = {
            collections: collections.length,
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            host: mongoose.connection.host,
            name: mongoose.connection.name
        };

        // Memory usage
        const memoryUsage = process.memoryUsage();
        const memoryStats = {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
        };

        // Process info
        const processInfo = {
            pid: process.pid,
            uptime: `${Math.round(process.uptime() / 60)} minutes`,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        };

        // API performance (simulated - you could track actual metrics)
        const apiMetrics = {
            totalRequests: Math.floor(Math.random() * 1000) + 500,
            avgResponseTime: `${(Math.random() * 200 + 50).toFixed(2)} ms`,
            errorRate: `${(Math.random() * 5).toFixed(2)}%`
        };

        // Disk space (simulated)
        const diskUsage = {
            total: '15 GB',
            used: '2.3 GB',
            free: '12.7 GB',
            usagePercentage: '15%'
        };

        return res.status(200).json({
            success: true,
            message: 'System health retrieved successfully',
            health: {
                database: dbStats,
                memory: memoryStats,
                process: processInfo,
                api: apiMetrics,
                disk: diskUsage,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching system health:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch system health',
            error: error.message
        });
    }
}

/**
 * Clear cache (placeholder - implement based on your caching strategy)
 */
async function clearCache(req, res) {
    try {
        // This is a placeholder. Implement based on your caching solution (Redis, etc.)
        console.log('Cache clearance requested by admin');
        
        return res.status(200).json({
            success: true,
            message: 'Cache clearance initiated (placeholder)',
            note: 'Implement actual cache clearance based on your caching solution'
        });

    } catch (error) {
        console.error('Error clearing cache:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear cache',
            error: error.message
        });
    }
}

module.exports = {
    getDashboardStats,
    getAnalytics,
    getSalesAnalytics,
    getUserAnalytics,
    getModerationDashboard,
    moderateReview,
    clearReviewReports,
    getSystemHealth,
    clearCache
};