const DownloadHistory = require('./download.model');
const Book = require('../books/book.model');
const Purchase = require('../purchases/purchase.model');


/**
 * Enhanced download with restrictions (updated for ebooks/audiobooks)
 */
async function downloadBook(req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
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

        // Check if user can download (free or purchased)
        const isFree = book.price === 0;
        let canDownload = isFree;
        let purchase = null;

        if (!isFree) {
            // Check if user purchased this book
            purchase = await Purchase.findOne({
                user: userId,
                book: bookId,
                status: 'completed'
            });
            
            if (!purchase) {
                return res.status(403).json({
                    success: false,
                    message: 'You need to purchase this book to download it',
                    isFree: false,
                    book: {
                        title: book.title,
                        price: book.price,
                        type: book.type
                    },
                    purchaseRequired: true
                });
            }

            // Check download restrictions for premium books
            const downloadCheck = await checkDownloadRestrictions(userId, bookId, purchase);
            
            if (!downloadCheck.allowed) {
                return res.status(403).json({
                    success: false,
                    message: downloadCheck.message,
                    restriction: downloadCheck.restriction,
                    remainingDownloads: downloadCheck.remainingDownloads,
                    windowExpires: downloadCheck.windowExpires
                });
            }
            
            canDownload = true;
        }

        // Generate download link from Google Drive
        let downloadUrl = book.fileInfo?.downloadUrl;
        if (!downloadUrl) {
            downloadUrl = SimpleStorageService.generateDownloadLink(book.driveUrl);
        }

        // Log download in history
        const downloadRecord = new DownloadHistory({
            user: userId,
            book: bookId,
            downloadType: isFree ? 'free' : 'purchased',
            purchase: purchase?._id || null,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress,
            downloadUrl: downloadUrl,
            expiresAt: new Date(Date.now() + (book.downloadPolicy.validityHours * 60 * 60 * 1000))
        });

        await downloadRecord.save();

        // Update purchase download count if it's a purchased book
        if (purchase) {
            purchase.downloadedCount += 1;
            purchase.lastDownloadedAt = new Date();
            await purchase.save();
        }

        // Prepare type-specific book info
        const bookInfo = {
            id: book._id,
            title: book.title,
            author: book.author,
            type: book.type,
            fileSize: book.formattedFileSize || 'Unknown',
            format: book.fileFormat || (book.type === 'audiobook' ? 'MP3' : 'PDF')
        };

        // Add type-specific details
        if (book.type === 'ebook') {
            bookInfo.pages = book.pages;
        } else if (book.type === 'audiobook') {
            bookInfo.audioLength = book.formattedAudioLength || book.audioLength;
            bookInfo.narrators = book.narratorsList;
        }

        return res.status(200).json({
            success: true,
            message: 'Download link generated successfully',
            downloadInfo: {
                book: bookInfo,
                downloadType: isFree ? 'free' : 'purchased',
                downloadUrl: downloadUrl,
                expiresIn: `${book.downloadPolicy.validityHours} hours`,
                expiresAt: new Date(Date.now() + (book.downloadPolicy.validityHours * 60 * 60 * 1000)),
                downloadsRemaining: purchase ? 
                    (book.downloadPolicy.maxDownloads - purchase.downloadedCount) : 
                    null,
                timestamp: new Date(),
                downloadId: downloadRecord._id
            }
        });

    } catch (error) {
        console.error('Error downloading book:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process download',
            error: error.message
        });
    }
}

/**
 * Check download restrictions for premium books
 */
async function checkDownloadRestrictions(userId, bookId, purchase) {
    const book = await Book.findById(bookId);
    
    // Check 1: Download count limit
    if (purchase.downloadedCount >= book.downloadPolicy.maxDownloads) {
        return {
            allowed: false,
            message: `You have reached the maximum download limit (${book.downloadPolicy.maxDownloads})`,
            restriction: 'max_downloads_reached',
            remainingDownloads: 0
        };
    }
    
    // Check 2: Time window from purchase
    const purchaseTime = new Date(purchase.purchasedAt);
    const now = new Date();
    const hoursSincePurchase = (now - purchaseTime) / (1000 * 60 * 60);
    
    if (hoursSincePurchase > book.downloadPolicy.validityHours) {
        return {
            allowed: false,
            message: `Download window expired. You must download within ${book.downloadPolicy.validityHours} hours of purchase.`,
            restriction: 'download_window_expired',
            windowExpires: new Date(purchaseTime.getTime() + (book.downloadPolicy.validityHours * 60 * 60 * 1000))
        };
    }
    
    // Check 3: Device/IP restrictions (optional)
    if (!book.downloadPolicy.allowMultipleDevices) {
        const recentDownloads = await DownloadHistory.find({
            purchase: purchase._id
        }).sort({ downloadedAt: -1 }).limit(1);
        
        if (recentDownloads.length > 0) {
            // Allow downloads from same IP/device
            // You could check IP or device fingerprint here
        }
    }
    
    return {
        allowed: true,
        remainingDownloads: book.downloadPolicy.maxDownloads - purchase.downloadedCount,
        windowExpires: new Date(purchaseTime.getTime() + (book.downloadPolicy.validityHours * 60 * 60 * 1000))
    };
}

/**
 * Get book preview (updated for ebooks/audiobooks)
 */
async function getBookPreview(req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check if preview is enabled
        if (!book.preview.enabled) {
            return res.status(403).json({
                success: false,
                message: 'Preview not available for this book'
            });
        }

        // Get preview content using book's method
        const previewContent = book.getPreviewContent();

        if (!previewContent.available) {
            return res.status(403).json({
                success: false,
                message: previewContent.message || 'Preview not available'
            });
        }

        // For premium books, check if user has purchased or if it's free preview
        const isFree = book.price === 0;
        let canPreview = isFree;

        if (!isFree && userId) {
            const purchase = await Purchase.findOne({
                user: userId,
                book: bookId,
                status: 'completed'
            });
            canPreview = !!purchase;
        }

        if (!canPreview && !isFree) {
            return res.status(403).json({
                success: false,
                message: 'Purchase required to view preview',
                purchaseRequired: true,
                bookType: book.type,
                previewPages: book.preview.pages,
                previewMinutes: book.preview.sampleMinutes
            });
        }

        // Prepare book info
        const bookInfo = {
            title: book.title,
            author: book.author,
            type: book.type,
            isFree: book.price === 0,
            price: book.price
        };

        // Add type-specific details
        if (book.type === 'ebook') {
            bookInfo.pages = book.pages;
        } else if (book.type === 'audiobook') {
            bookInfo.audioLength = book.formattedAudioLength;
            bookInfo.narrators = book.narratorsList;
        }

        return res.status(200).json({
            success: true,
            message: 'Preview available',
            bookType: book.type,
            preview: previewContent.content,
            bookInfo: bookInfo
        });

    } catch (error) {
        console.error('Error getting book preview:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get book preview',
            error: error.message
        });
    }
}

/**
 * Get audio preview for audiobooks
 */
async function getAudioPreview(req, res) {
    try {
        const { bookId } = req.params;
        const book = await Book.findById(bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        if (book.type !== 'audiobook') {
            return res.status(400).json({
                success: false,
                message: 'This is not an audiobook'
            });
        }

        const sampleUrl = book.audioSampleUrl;
        if (!sampleUrl) {
            return res.status(404).json({
                success: false,
                message: 'Audio sample not available'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Audio preview available',
            preview: {
                url: sampleUrl,
                durationMinutes: book.preview.sampleMinutes || 5,
                format: book.fileFormat || 'MP3',
                embedCode: book.audioEmbedCode
            },
            book: {
                title: book.title,
                author: book.author,
                narrators: book.narratorsList,
                audioLength: book.formattedAudioLength
            }
        });
    } catch (error) {
        console.error('Error getting audio preview:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get audio preview',
            error: error.message
        });
    }
}

/**
 * Get user's download history
 */
async function getDownloadHistory(req, res) {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 20, type, bookId } = req.query;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        // Build query
        const query = { user: userId };
        if (type) query.downloadType = type;
        if (bookId) query.book = bookId;

        // Execute query with pagination
        const downloads = await DownloadHistory.find(query)
            .populate('book', 'title author coverImage type pages audioLength narrators')
            .populate('purchase', 'amount purchasedAt')
            .sort({ downloadedAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Get total count
        const totalItems = await DownloadHistory.countDocuments(query);

        return res.status(200).json({
            success: true,
            message: 'Download history retrieved successfully',
            data: downloads,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                hasNext: (parseInt(page) * parseInt(limit)) < totalItems,
                hasPrevious: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching download history:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch download history', 
            error: error.message 
        });
    }
}

/**
 * Get download statistics
 */
async function getDownloadStats(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        const stats = await DownloadHistory.aggregate([
            { $match: { user: userId } },
            {
                $lookup: {
                    from: 'books',
                    localField: 'book',
                    foreignField: '_id',
                    as: 'bookDetails'
                }
            },
            { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: 1 },
                    freeDownloads: {
                        $sum: { $cond: [{ $eq: ['$downloadType', 'free'] }, 1, 0] }
                    },
                    purchasedDownloads: {
                        $sum: { $cond: [{ $eq: ['$downloadType', 'purchased'] }, 1, 0] }
                    },
                    ebookDownloads: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ['$bookDetails.type', 'ebook'] },
                                    { $ifNull: ['$bookDetails.type', false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    },
                    audiobookDownloads: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ['$bookDetails.type', 'audiobook'] },
                                    { $ifNull: ['$bookDetails.type', false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Get recent download activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = await DownloadHistory.aggregate([
            {
                $match: {
                    user: userId,
                    downloadedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$downloadedAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get most downloaded books
        const mostDownloaded = await DownloadHistory.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: "$book",
                    count: { $sum: 1 },
                    lastDownloaded: { $max: "$downloadedAt" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Populate book details for most downloaded
        const bookIds = mostDownloaded.map(item => item._id);
        const books = await Book.find({ _id: { $in: bookIds } })
            .select('title author coverImage type pages audioLength narrators');

        const mostDownloadedWithDetails = mostDownloaded.map(item => {
            const book = books.find(b => b._id.toString() === item._id.toString());
            return {
                ...item,
                book: book || null
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Download statistics retrieved successfully',
            stats: stats[0] || {
                totalDownloads: 0,
                freeDownloads: 0,
                purchasedDownloads: 0,
                ebookDownloads: 0,
                audiobookDownloads: 0
            },
            recentActivity,
            mostDownloaded: mostDownloadedWithDetails
        });

    } catch (error) {
        console.error('Error fetching download stats:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch download statistics', 
            error: error.message 
        });
    }
}

/**
 * Check download restrictions for premium books
 */
async function checkDownloadRestrictions(userId, bookId, purchase) {
    const book = await Book.findById(bookId);
    
    // Check 1: Download count limit
    if (purchase.downloadedCount >= book.downloadRestrictions.maxDownloads) {
        return {
            allowed: false,
            message: `You have reached the maximum download limit (${book.downloadRestrictions.maxDownloads})`,
            restriction: 'max_downloads_reached',
            remainingDownloads: 0
        };
    }
    
    // Check 2: 24-hour window from purchase
    const purchaseTime = new Date(purchase.purchasedAt);
    const now = new Date();
    const hoursSincePurchase = (now - purchaseTime) / (1000 * 60 * 60);
    
    if (hoursSincePurchase > book.downloadRestrictions.downloadWindow) {
        return {
            allowed: false,
            message: `Download window expired. You must download within ${book.downloadRestrictions.downloadWindow} hours of purchase.`,
            restriction: 'download_window_expired',
            windowExpires: new Date(purchaseTime.getTime() + (book.downloadRestrictions.downloadWindow * 60 * 60 * 1000))
        };
    }
    
    // Check 3: Device/IP restrictions (optional)
    if (!book.downloadRestrictions.allowMultipleDevices) {
        const recentDownloads = await DownloadHistory.find({
            purchase: purchase._id
        }).sort({ downloadedAt: -1 }).limit(1);
        
        if (recentDownloads.length > 0) {
            // Allow downloads from same IP/device
            // You could check IP or device fingerprint here
        }
    }
    
    return {
        allowed: true,
        remainingDownloads: book.downloadRestrictions.maxDownloads - purchase.downloadedCount,
        windowExpires: new Date(purchaseTime.getTime() + (book.downloadRestrictions.downloadWindow * 60 * 60 * 1000))
    };
}


/**
 * Clear download history
 */
async function clearDownloadHistory(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        const result = await DownloadHistory.deleteMany({ user: userId });

        return res.status(200).json({
            success: true,
            message: 'Download history cleared successfully',
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error clearing download history:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to clear download history', 
            error: error.message 
        });
    }
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