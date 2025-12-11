const Purchase = require('./purchase.model');
const Book = require('../books/book.model');
const DownloadHistory = require('../downloads/download.model');

/**
 * Simulate a book purchase (updated for ebooks/audiobooks)
 */
async function simulatePurchase(req, res) {
    try {
        const { bookId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        if (!bookId) {
            return res.status(400).json({ 
                success: false,
                message: 'Book ID is required' 
            });
        }

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: 'Book not found' 
            });
        }

        // Check if book is already purchased
        const existingPurchase = await Purchase.findOne({
            user: userId,
            book: bookId,
            status: 'completed'
        });

        if (existingPurchase) {
            return res.status(400).json({
                success: false,
                message: 'Book already purchased',
                purchase: existingPurchase
            });
        }

        // Check if book is free
        if (book.price === 0) {
            return res.status(400).json({
                success: false,
                message: 'This book is free. Use download endpoint instead.',
                isFree: true,
                bookType: book.type
            });
        }

        // Create simulated purchase with book info
        const purchase = new Purchase({
            user: userId,
            book: bookId,
            amount: book.price,
            status: 'completed',
            paymentMethod: 'credit_card', // Simulated
            bookInfo: {
                title: book.title,
                author: book.author,
                type: book.type,
                coverImage: book.coverImage,
                price: book.price,
                ...(book.type === 'ebook' && { pages: book.pages }),
                ...(book.type === 'audiobook' && { 
                    audioLength: book.audioLength,
                    narrators: book.narratorsList 
                })
            },
            simulatedOrderId: `SIM-${Date.now()}`
        });

        const savedPurchase = await purchase.save();

        // Populate book details
        const populatedPurchase = await Purchase.findById(savedPurchase._id)
            .populate('book', 'title author coverImage price type pages audioLength narrators fileInfo');

        return res.status(201).json({
            success: true,
            message: 'Purchase simulated successfully',
            purchase: populatedPurchase,
            downloadInfo: {
                message: 'You can now download this book',
                bookType: book.type,
                downloadEndpoint: `/api/download/${bookId}`,
                previewEndpoint: `/api/books/${bookId}/preview`,
                ...(book.type === 'audiobook' && {
                    audioSampleEndpoint: `/api/download/books/${bookId}/audio-preview`
                })
            }
        });

    } catch (error) {
        console.error('Error simulating purchase:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: 'Book already purchased' 
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: 'Failed to simulate purchase', 
            error: error.message 
        });
    }
}

/**
 * Get user's purchase history
 */
async function getPurchaseHistory(req, res) {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, status, type } = req.query;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        // Build query
        const query = { user: userId };
        if (status) query.status = status;

        // Execute query with pagination
        let purchases = await Purchase.find(query)
            .populate('book', 'title author coverImage price type genre pages audioLength narrators fileInfo')
            .sort({ purchasedAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Filter by type if specified
        if (type) {
            purchases = purchases.filter(purchase => 
                purchase.book && purchase.book.type === type
            );
        }

        // Get total count
        const totalItems = await Purchase.countDocuments(query);

        // Calculate stats
        const totalSpent = await Purchase.aggregate([
            { $match: { user: userId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Get type-specific stats
        const typeStats = await Purchase.aggregate([
            { $match: { user: userId, status: 'completed' } },
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
                    totalSpent: { $sum: '$amount' }
                }
            }
        ]);

        // Format type stats
        const formattedTypeStats = {};
        typeStats.forEach(stat => {
            formattedTypeStats[stat._id] = {
                count: stat.count,
                totalSpent: stat.totalSpent
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Purchase history retrieved successfully',
            data: purchases,
            stats: {
                totalSpent: totalSpent[0]?.total || 0,
                totalPurchases: totalItems,
                byType: formattedTypeStats
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                hasNext: (parseInt(page) * parseInt(limit)) < totalItems,
                hasPrevious: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching purchase history:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch purchase history', 
            error: error.message 
        });
    }
}

/**
 * Get a single purchase by ID
 */
async function getPurchaseById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        const purchase = await Purchase.findOne({ 
            _id: id, 
            user: userId 
        }).populate('book', 'title author coverImage price type fileInfo driveUrl pages description audioLength narrators');

        if (!purchase) {
            return res.status(404).json({ 
                success: false,
                message: 'Purchase not found or you do not have permission' 
            });
        }

        // Get download info if available
        let downloadInfo = null;
        if (purchase.book) {
            const book = await Book.findById(purchase.book._id);
            if (book) {
                downloadInfo = {
                    canDownload: true,
                    downloadUrl: book.fileInfo?.downloadUrl,
                    previewUrl: book.fileInfo?.previewUrl,
                    audioSampleUrl: book.audioSampleUrl,
                    downloadPolicy: book.downloadPolicy
                };
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Purchase retrieved successfully',
            purchase,
            downloadInfo
        });

    } catch (error) {
        console.error('Error fetching purchase:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch purchase', 
            error: error.message 
        });
    }
}

/**
 * Check if user has purchased a specific book
 */
async function checkBookPurchase(req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        const purchase = await Purchase.findOne({
            user: userId,
            book: bookId,
            status: 'completed'
        });

        // Also check if book is free
        const book = await Book.findById(bookId);
        const isFree = book?.price === 0;

        return res.status(200).json({
            success: true,
            isPurchased: !!purchase,
            isFree: isFree,
            canDownload: !!purchase || isFree,
            purchase: purchase || null,
            book: book ? { 
                title: book.title,
                type: book.type,
                price: book.price,
                ...(book.type === 'ebook' && { pages: book.pages }),
                ...(book.type === 'audiobook' && { 
                    audioLength: book.formattedAudioLength,
                    narrators: book.narratorsList 
                })
            } : null
        });

    } catch (error) {
        console.error('Error checking purchase:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to check purchase status', 
            error: error.message 
        });
    }
}

/**
 * Cancel/refund a purchase (simulation)
 */
async function cancelPurchase(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        const purchase = await Purchase.findOneAndUpdate(
            { 
                _id: id, 
                user: userId,
                status: 'completed' // Can only cancel completed purchases
            },
            { 
                status: 'cancelled',
                cancelledAt: new Date(),
                // In real scenario, you'd update refund info here
            },
            { new: true, runValidators: true }
        );

        if (!purchase) {
            return res.status(404).json({ 
                success: false,
                message: 'Purchase not found, already cancelled, or you cannot cancel this purchase' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Purchase cancelled (simulated)',
            purchase
        });

    } catch (error) {
        console.error('Error cancelling purchase:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to cancel purchase', 
            error: error.message 
        });
    }
}

/**
 * Get purchase statistics
 */
async function getPurchaseStats(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        const stats = await Purchase.aggregate([
            { $match: { user: userId, status: 'completed' } },
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
                    _id: null,
                    totalPurchases: { $sum: 1 },
                    totalSpent: { $sum: '$amount' },
                    averagePurchaseAmount: { $avg: '$amount' },
                    ebookPurchases: {
                        $sum: { $cond: [{ $eq: ['$bookDetails.type', 'ebook'] }, 1, 0] }
                    },
                    audiobookPurchases: {
                        $sum: { $cond: [{ $eq: ['$bookDetails.type', 'audiobook'] }, 1, 0] }
                    },
                    ebookSpent: {
                        $sum: { $cond: [{ $eq: ['$bookDetails.type', 'ebook'] }, '$amount', 0] }
                    },
                    audiobookSpent: {
                        $sum: { $cond: [{ $eq: ['$bookDetails.type', 'audiobook'] }, '$amount', 0] }
                    }
                }
            }
        ]);

        // Get purchases by month for chart data
        const monthlyData = await Purchase.aggregate([
            { 
                $match: { 
                    user: userId, 
                    status: 'completed' 
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
                    _id: {
                        year: { $year: '$purchasedAt' },
                        month: { $month: '$purchasedAt' }
                    },
                    count: { $sum: 1 },
                    total: { $sum: '$amount' },
                    ebooks: {
                        $sum: { $cond: [{ $eq: ['$bookDetails.type', 'ebook'] }, 1, 0] }
                    },
                    audiobooks: {
                        $sum: { $cond: [{ $eq: ['$bookDetails.type', 'audiobook'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Format monthly data
        const formattedMonthlyData = monthlyData.map(item => ({
            month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
            count: item.count,
            total: item.total,
            ebooks: item.ebooks,
            audiobooks: item.audiobooks
        }));

        return res.status(200).json({
            success: true,
            message: 'Purchase statistics retrieved successfully',
            stats: stats[0] || {
                totalPurchases: 0,
                totalSpent: 0,
                averagePurchaseAmount: 0,
                ebookPurchases: 0,
                audiobookPurchases: 0,
                ebookSpent: 0,
                audiobookSpent: 0
            },
            monthlyData: formattedMonthlyData
        });

    } catch (error) {
        console.error('Error fetching purchase stats:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch purchase statistics', 
            error: error.message 
        });
    }
}

/**
 * Get purchases by book type
 */
async function getPurchasesByType(req, res) {
    try {
        const userId = req.user?._id;
        const { type } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        if (!['ebook', 'audiobook'].includes(type)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid book type. Must be "ebook" or "audiobook"' 
            });
        }

        // Find purchases and filter by book type
        const allPurchases = await Purchase.find({ 
            user: userId, 
            status: 'completed' 
        })
        .populate('book', 'title author coverImage price type pages audioLength narrators')
        .sort({ purchasedAt: -1 });

        // Filter by type
        const filteredPurchases = allPurchases.filter(purchase => 
            purchase.book && purchase.book.type === type
        );

        // Apply pagination
        const totalItems = filteredPurchases.length;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

        return res.status(200).json({
            success: true,
            message: `Purchases for ${type}s retrieved successfully`,
            data: paginatedPurchases,
            stats: {
                totalPurchases: totalItems,
                totalSpent: filteredPurchases.reduce((sum, purchase) => sum + purchase.amount, 0)
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                hasNext: endIndex < totalItems,
                hasPrevious: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching purchases by type:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch purchases by type', 
            error: error.message 
        });
    }
}

module.exports = {
    simulatePurchase,
    getPurchaseHistory,
    getPurchaseById,
    checkBookPurchase,
    cancelPurchase,
    getPurchaseStats,
    getPurchasesByType
};