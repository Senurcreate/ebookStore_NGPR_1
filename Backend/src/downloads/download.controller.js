const mongoose = require('mongoose');
const DownloadHistory = require('./download.model');
const Book = require('../books/book.model');
const Purchase = require('../purchases/purchase.model');
const CloudinaryService = require('../services/cloudinary.service');

/**
 * 1. SECURE DOWNLOAD
 * Ensures user has purchased the book before returning the link.
 */
async function downloadBook(req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        // 1. Basic Authentication Check
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'You must be logged in to download books.'
            });
        }

        // 2. Find the Book
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found.'
            });
        }

        // 3. THE GATEKEEPER LOGIC
        const isFree = book.price === 0;
        let purchase = null;

        if (!isFree) {
            // Check for a COMPLETED purchase
            purchase = await Purchase.findOne({
                user: userId,
                book: bookId,
                status: 'completed'
            });

            // DENY: No purchase found
            if (!purchase) {
                return res.status(403).json({
                    success: false,
                    message: 'You must purchase this book to download it.',
                    isFree: false,
                    book: {
                        title: book.title,
                        price: book.price
                    },
                    purchaseRequired: true
                });
            }

            // DENY: Purchase limits exceeded (Max downloads or Time expiry)
            // We use the helper function checkDownloadRestrictions defined at the bottom
            const restrictionCheck = await checkDownloadRestrictions(userId, bookId, purchase);
            
            if (!restrictionCheck.allowed) {
                return res.status(403).json({
                    success: false,
                    message: restrictionCheck.message,
                    reason: restrictionCheck.restriction,
                    remainingDownloads: 0
                });
            }
        }

        // 4. Get the Download URL
        // We prefer the fileInfo.downloadUrl if it exists, otherwise use cloudinaryUrl
        let downloadUrl = book.fileInfo?.downloadUrl || book.cloudinaryUrl;
        
        // Fallback: If no direct URL, try to generate one from publicId
        if (!downloadUrl && book.cloudinaryInfo?.publicId) {
            downloadUrl = CloudinaryService.generateDownloadUrl(book.cloudinaryInfo.publicId);
        }

        if (!downloadUrl) {
            return res.status(500).json({
                success: false,
                message: 'File not available. Please contact support.'
            });
        }

        // 5. Record the Download (Audit Trail)
        const downloadRecord = new DownloadHistory({
            user: userId,
            book: bookId,
            downloadType: isFree ? 'free' : 'purchased',
            purchase: purchase?._id || null,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress,
            downloadUrl: downloadUrl // Log what URL was given
        });

        await downloadRecord.save();

        // 6. Update Purchase Counts (If premium)
        if (purchase) {
            // If your Purchase model has a registerDownload method, use it
            if (typeof purchase.registerDownload === 'function') {
                await purchase.registerDownload({
                    userAgent: req.headers['user-agent'],
                    ipAddress: req.ip
                });
            } else {
                // Fallback manual update if method doesn't exist
                purchase.downloadTracking.downloadsUsed += 1;
                purchase.lastDownloadedAt = new Date();
                await purchase.save();
            }
        }

        // 7. Success Response
        const remaining = purchase ? 
            (purchase.downloadTracking.maxDownloads - purchase.downloadTracking.downloadsUsed) : 'Unlimited';

        return res.status(200).json({
            success: true,
            message: 'Download authorized.',
            data: {
                downloadUrl: downloadUrl,
                fileName: `${book.title.replace(/[^a-z0-9]/gi, '_')}.${book.fileFormat || 'pdf'}`,
                remainingDownloads: remaining,
                expiresIn: purchase ? '24 hours' : null // Example based on your schema
            }
        });

    } catch (error) {
        console.error('❌ Error processing download:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error processing download.',
            error: error.message
        });
    }
}

/**
 * 2. GET BOOK PREVIEW (eBooks)
 */
async function getBookPreview(req, res) {
    try {
        const { bookId } = req.params;
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        if (!book.preview.enabled) {
            return res.status(403).json({ success: false, message: 'Preview disabled for this book' });
        }

        // Use model method if available, otherwise manual fallback
        const previewContent = typeof book.getPreviewContent === 'function' 
            ? book.getPreviewContent() 
            : { available: true, content: { previewUrl: book.cloudinaryUrl } }; // Fallback

        return res.status(200).json({
            success: true,
            data: previewContent
        });

    } catch (error) {
        console.error('Error getting preview:', error);
        return res.status(500).json({ success: false, message: 'Failed to get preview' });
    }
}

/**
 * 3. GET AUDIO PREVIEW (Audiobooks)
 */
async function getAudioPreview(req, res) {
    try {
        const { bookId } = req.params;
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        if (book.type !== 'audiobook') {
            return res.status(400).json({ success: false, message: 'Not an audiobook' });
        }

        const sampleUrl = book.audioSampleUrl || book.audioSampleCloudinaryUrl;
        
        if (!sampleUrl) {
            return res.status(404).json({ success: false, message: 'No audio sample available' });
        }

        return res.status(200).json({
            success: true,
            data: {
                url: sampleUrl,
                duration: book.preview?.sampleMinutes || 5,
                embedCode: book.audioEmbedCode
            }
        });
    } catch (error) {
        console.error('Error getting audio preview:', error);
        return res.status(500).json({ success: false, message: 'Failed to get audio preview' });
    }
}

/**
 * 4. GET DOWNLOAD HISTORY
 */
async function getDownloadHistory(req, res) {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 20 } = req.query;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [downloads, total] = await Promise.all([
            DownloadHistory.find({ user: userId })
                .populate('book', 'title author coverImage type')
                .sort({ downloadedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            DownloadHistory.countDocuments({ user: userId })
        ]);

        return res.status(200).json({
            success: true,
            data: downloads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching history:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
}

/**
 * 5. GET DOWNLOAD STATISTICS
 */
async function getDownloadStats(req, res) {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const stats = await DownloadHistory.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: 1 },
                    freeDownloads: { $sum: { $cond: [{ $eq: ['$downloadType', 'free'] }, 1, 0] } },
                    purchasedDownloads: { $sum: { $cond: [{ $eq: ['$downloadType', 'purchased'] }, 1, 0] } }
                }
            }
        ]);

        // Get most downloaded books
        const mostDownloaded = await DownloadHistory.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: "$book", count: { $sum: 1 }, lastDownloaded: { $max: "$downloadedAt" } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book' } },
            { $unwind: '$book' },
            { $project: { 'book.title': 1, 'book.coverImage': 1, count: 1, lastDownloaded: 1 } }
        ]);

        return res.status(200).json({
            success: true,
            stats: stats[0] || { totalDownloads: 0, freeDownloads: 0, purchasedDownloads: 0 },
            mostDownloaded
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
}

/**
 * 6. CLEAR HISTORY
 */
async function clearDownloadHistory(req, res) {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await DownloadHistory.deleteMany({ user: userId });

        return res.status(200).json({
            success: true,
            message: 'Download history cleared'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to clear history' });
    }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Helper: Check restrictions (Max downloads & Time window)
 * This logic mirrors the updated Purchase model logic
 */
async function checkDownloadRestrictions(userId, bookId, purchase) {
    // If you haven't updated the Purchase model yet, this manual check saves you.
    const maxDownloads = purchase.downloadTracking?.maxDownloads || 3;
    const downloadsUsed = purchase.downloadTracking?.downloadsUsed || 0;
    
    // 1. Check Limits
    if (downloadsUsed >= maxDownloads) {
        return {
            allowed: false,
            restriction: 'max_downloads_reached',
            message: `You have reached the maximum download limit (${maxDownloads}).`
        };
    }

    // 2. Check Expiry (if your business logic requires 24h expiry)
    // Note: If you want lifetime access, remove this block
    const validHours = purchase.downloadTracking?.downloadWindowHours || 24;
    const purchaseTime = new Date(purchase.purchasedAt).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - purchaseTime) / (1000 * 60 * 60);

    if (hoursDiff > validHours) {
        return {
            allowed: false,
            restriction: 'download_window_expired',
            message: `Download window expired. You had ${validHours} hours to download this book.`
        };
    }

    return { allowed: true };
}

module.exports = {
    downloadBook,
    getBookPreview,
    getAudioPreview,
    getDownloadHistory,
    getDownloadStats,
    clearDownloadHistory,
    checkDownloadRestrictions 
};