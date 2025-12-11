const Book = require('./book.model');
//const Purchase = require('../purchases/purchase.model');
const SimpleStorageService = require('../services/simpleStorage.service');

/**
 * Create a new book with Google Drive integration (supports both ebooks and audiobooks)
 */
async function createBook(req, res) {
    try {
        const body = { ...(req.body || {}) };
        const bookType = body.type || 'ebook';

        // Required fields based on book type
        const commonRequired = [
            'title',
            'author',
            'publisher',
            'publication_date',
            'description',
            'genre',
            'language',
            'isbn',
            'coverImage',
            'driveUrl',
            'price'
        ];

        // Type-specific required fields
        const typeRequired = {
            ebook: ['pages'],
            audiobook: ['audioLength', 'narrators']
        };

        // Combine required fields
        const required = [...commonRequired, ...(typeRequired[bookType] || [])];

        // Check for missing required fields
        const missing = required.filter(f => {
            const value = body[f];
            return value === undefined || value === '' || 
                   (Array.isArray(value) && value.length === 0);
        });

        if (missing.length) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missing,
                type: bookType
            });
        }

        // Validate Google Drive URL
        if (!SimpleStorageService.isValidDriveUrl(body.driveUrl)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google Drive URL for main file',
                examples: [
                    'https://drive.google.com/file/d/YOUR_FILE_ID/view',
                    'https://drive.google.com/open?id=YOUR_FILE_ID',
                    'Just the file ID (33 characters)'
                ]
            });
        }

        // Validate audio sample URL if provided for audiobook
        if (bookType === 'audiobook' && body.audioSampleDriveUrl) {
            if (!SimpleStorageService.isValidDriveUrl(body.audioSampleDriveUrl)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Google Drive URL for audio sample',
                    examples: [
                        'https://drive.google.com/file/d/SAMPLE_FILE_ID/view',
                        'https://drive.google.com/open?id=SAMPLE_FILE_ID'
                    ]
                });
            }
        }

        // Validate price
        if (isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid number greater than or equal to 0'
            });
        }

        // Validate ebook-specific fields
        if (bookType === 'ebook') {
            if (!Number.isInteger(parseInt(body.pages)) || parseInt(body.pages) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Pages must be a positive integer for ebooks'
                });
            }
        }

        // Validate audiobook-specific fields
        if (bookType === 'audiobook') {
            // Validate audio length format (HH:MM:SS or MM:SS)
            const timePattern = /^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/;
            if (!timePattern.test(body.audioLength)) {
                return res.status(400).json({
                    success: false,
                    message: 'Audio length must be in format HH:MM:SS or MM:SS',
                    examples: ['02:30:45', '45:30', '1:15:00']
                });
            }

            // Validate narrators array
            if (!Array.isArray(body.narrators) || body.narrators.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one narrator is required for audiobooks'
                });
            }

            // Validate each narrator has a name
            const invalidNarrators = body.narrators.filter(n => !n.name || n.name.trim() === '');
            if (invalidNarrators.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'All narrators must have a name'
                });
            }
        }

        // Prepare book data
        const bookData = {
            ...body,
            type: bookType,
            price: parseFloat(body.price),
            trending: Boolean(body.trending),
            publication_date: new Date(body.publication_date)
        };

        // Process type-specific fields
        if (bookType === 'ebook') {
            bookData.pages = parseInt(body.pages);
        } else if (bookType === 'audiobook') {
            bookData.audioLength = body.audioLength.trim();
            bookData.narrators = body.narrators.map(n => ({
                name: n.name.trim()
            }));
            
            // Process audio sample URL if provided
            if (body.audioSampleDriveUrl) {
                bookData.audioSampleDriveUrl = body.audioSampleDriveUrl.trim();
            }
        }

        // Process driveUrl to extract file info (will be done by pre-save middleware)
        // Just ensure it's set
        bookData.driveUrl = bookData.driveUrl.trim();

        // Process preview settings if provided
        if (body.preview) {
            if (bookType === 'ebook' && body.preview.pages !== undefined) {
                bookData.preview = {
                    ...bookData.preview,
                    pages: parseInt(body.preview.pages)
                };
            } else if (bookType === 'audiobook' && body.preview.sampleMinutes !== undefined) {
                bookData.preview = {
                    ...bookData.preview,
                    sampleMinutes: parseInt(body.preview.sampleMinutes)
                };
            }
        }

        // Create & save book
        const newBook = new Book(bookData);
        const savedBook = await newBook.save();

        console.log(`📚 ${bookType === 'audiobook' ? '🎵 Audiobook' : '📖 Ebook'} created:`, savedBook._id);
        return res.status(201).json({
            success: true,
            message: `${bookType === 'audiobook' ? 'Audiobook' : 'Book'} created successfully`,
            book: savedBook,
            previewInfo: savedBook.getPreviewContent()
        });

    } catch (error) {
        console.error('❌ Error creating book:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors || {}).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Handle duplicate ISBN
        if (error.code === 11000) {
            if (error.keyPattern?.isbn) {
                return res.status(400).json({
                    success: false,
                    message: 'A book with this ISBN already exists'
                });
            }
            if (error.keyPattern?.driveUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'This Google Drive URL is already used for another book'
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to create book',
            error: error.message
        });
    }
}

/**
 * Get all books with advanced filtering (supports both ebooks and audiobooks)
 */
async function getAllBooks(req, res) {
    try {
        const {
            genre,
            type,
            price,
            author,
            language,
            trending,
            search,
            narrator,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter
        let filter = {};

        // Text search (searches title, author, description)
        if (search) {
            filter.$text = { $search: search };
        }

        // Filter by genre
        if (genre) {
            filter.genre = { $in: genre.split(',') };
        }

        // Filter by type (ebook/audiobook)
        if (type) {
            filter.type = type;
        }

        // Filter by price
        if (price === "free") {
            filter.price = 0;
        } else if (price === "premium") {
            filter.price = { $gt: 0 };
        } else if (price) {
            const [min, max] = price.split('-').map(Number);
            if (!isNaN(min) && !isNaN(max)) {
                filter.price = { $gte: min, $lte: max };
            }
        }

        // Filter by author
        if (author) {
            filter.author = { $regex: author, $options: 'i' };
        }

        // Filter by narrator (for audiobooks)
        if (narrator) {
            filter['narrators.name'] = { $regex: narrator, $options: 'i' };
        }

        // Filter by language
        if (language) {
            filter.language = language;
        }

        // Filter by trending
        if (trending === 'true') {
            filter.trending = true;
        }

        // Build sort options
        const sortOptions = {};
        const validSortFields = [
            'title', 'author', 'price', 'createdAt', 
            'ratingStats.average', 'pages', 'audioLength'
        ];
        
        if (validSortFields.includes(sortBy)) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sortOptions.createdAt = -1; // Default sort
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const [books, total] = await Promise.all([
            Book.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Book.countDocuments(filter)
        ]);

        // Get type-specific statistics
        const typeStats = await Book.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    avgRating: { $avg: '$ratingStats.average' }
                }
            }
        ]);

        // Convert type stats to object
        const statsByType = {};
        typeStats.forEach(stat => {
            statsByType[stat._id] = {
                count: stat.count,
                avgPrice: stat.avgPrice ? parseFloat(stat.avgPrice.toFixed(2)) : 0,
                avgRating: stat.avgRating ? parseFloat(stat.avgRating.toFixed(1)) : 0
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Books retrieved successfully',
            data: books,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
                hasNext: (skip + parseInt(limit)) < total,
                hasPrevious: parseInt(page) > 1
            },
            filters: {
                type: type || 'all',
                genre: genre || 'all',
                price: price || 'all',
                search: search || 'none'
            },
            typeStats: statsByType
        });

    } catch (error) {
        console.error('❌ Error fetching books:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch books',
            error: error.message
        });
    }
}

/**
 * Get a single book by ID with enhanced info (supports both types)
 */
async function getBookById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const book = await Book.findById(id).lean();
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check download eligibility if user is authenticated
        let downloadEligibility = null;
        let purchaseInfo = null;

        if (userId) {
            const bookDoc = await Book.findById(id);
            downloadEligibility = await bookDoc.checkDownloadEligibility(userId);

            if (book.price > 0) {
                purchaseInfo = await Purchase.findOne({
                    user: userId,
                    book: id,
                    status: 'completed'
                }).select('purchasedAt downloadedCount').lean();
            }
        }

        // Get similar books (by genre and same type)
        const similarBooks = await Book.find({
            _id: { $ne: id },
            genre: book.genre,
            type: book.type
        })
        .limit(4)
        .select('title author coverImage price ratingStats type pages audioLength narrators')
        .lean();

        // Get preview content
        const bookDoc = await Book.findById(id);
        const previewContent = bookDoc.getPreviewContent();

        // Enhance book data with type-specific info
        const enhancedBook = {
            ...book,
            formattedInfo: {
                publicationDate: bookDoc.formattedPublicationDate,
                priceDisplay: bookDoc.priceDisplay,
                fileSize: bookDoc.formattedFileSize,
                ...(book.type === 'audiobook' && {
                    audioLength: bookDoc.formattedAudioLength,
                    narratorsList: bookDoc.narratorsList
                })
            },
            accessInfo: {
                canDownload: downloadEligibility?.canDownload || book.price === 0,
                isFree: book.price === 0,
                requiresPurchase: book.price > 0 && !downloadEligibility?.canDownload,
                previewAvailable: book.preview.enabled,
                downloadEligibility: downloadEligibility,
                purchaseInfo: purchaseInfo
            },
            preview: previewContent,
            similarBooks: similarBooks
        };

        return res.status(200).json({
            success: true,
            message: 'Book retrieved successfully',
            book: enhancedBook
        });

    } catch (error) {
        console.error('❌ Error fetching book:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch book',
            error: error.message
        });
    }
}

/**
 * Update a book (supports both ebooks and audiobooks)
 */
async function updateBook(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        // Get current book to check type
        const currentBook = await Book.findById(id);
        if (!currentBook) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        const bookType = updates.type || currentBook.type;

        // Validate Google Drive URL if being updated
        if (updates.driveUrl && !SimpleStorageService.isValidDriveUrl(updates.driveUrl)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Google Drive URL for main file'
            });
        }

        // Validate audio sample URL if provided for audiobook
        if (bookType === 'audiobook' && updates.audioSampleDriveUrl) {
            if (!SimpleStorageService.isValidDriveUrl(updates.audioSampleDriveUrl)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Google Drive URL for audio sample'
                });
            }
        }

        // Validate type-specific fields
        if (bookType === 'ebook' && updates.pages !== undefined) {
            if (!Number.isInteger(parseInt(updates.pages)) || parseInt(updates.pages) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Pages must be a positive integer for ebooks'
                });
            }
            updates.pages = parseInt(updates.pages);
        }

        if (bookType === 'audiobook') {
            // Validate audio length
            if (updates.audioLength) {
                const timePattern = /^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/;
                if (!timePattern.test(updates.audioLength)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Audio length must be in format HH:MM:SS or MM:SS'
                    });
                }
                updates.audioLength = updates.audioLength.trim();
            }

            // Validate narrators
            if (updates.narrators) {
                if (!Array.isArray(updates.narrators) || updates.narrators.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'At least one narrator is required for audiobooks'
                    });
                }

                // Validate each narrator has a name
                const invalidNarrators = updates.narrators.filter(n => !n.name || n.name.trim() === '');
                if (invalidNarrators.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'All narrators must have a name'
                    });
                }

                updates.narrators = updates.narrators.map(n => ({
                    name: n.name.trim()
                }));
            }
        }

        // Convert string dates to Date objects
        if (updates.publication_date) {
            updates.publication_date = new Date(updates.publication_date);
        }

        // Convert numeric fields
        if (updates.price !== undefined) {
            updates.price = parseFloat(updates.price);
        }
        if (updates.trending !== undefined) {
            updates.trending = Boolean(updates.trending);
        }

        // Handle preview updates
        if (updates.preview) {
            if (bookType === 'ebook' && updates.preview.pages !== undefined) {
                updates.preview.pages = parseInt(updates.preview.pages);
            } else if (bookType === 'audiobook' && updates.preview.sampleMinutes !== undefined) {
                updates.preview.sampleMinutes = parseInt(updates.preview.sampleMinutes);
            }
        }

        const updatedBook = await Book.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            book: updatedBook,
            previewInfo: updatedBook.getPreviewContent()
        });

    } catch (error) {
        console.error('❌ Error updating book:', error);

        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors || {}).reduce((acc, key) => {
                acc[key] = error.errors[key].message;
                return acc;
            }, {});
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update book',
            error: error.message
        });
    }
}

/**
 * Delete a book
 */
async function deleteBook(req, res) {
    try {
        const { id } = req.params;

        // Check if book exists
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Check if book has any purchases (optional business rule)
        const purchaseCount = await Purchase.countDocuments({ book: id });
        if (purchaseCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete book with existing purchases. Consider archiving instead.',
                purchaseCount,
                bookType: book.type
            });
        }

        const deletedBook = await Book.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: `${book.type === 'audiobook' ? 'Audiobook' : 'Book'} deleted successfully`,
            book: deletedBook
        });

    } catch (error) {
        console.error('❌ Error deleting book:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete book',
            error: error.message
        });
    }
}

/**
 * Check download permission (enhanced - supports both types)
 */
async function checkDownloadPermission(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Use the book's method to check eligibility
        const eligibility = await book.checkDownloadEligibility(userId);

        // Get download info
        const downloadInfo = book.getDownloadInfo();

        return res.status(200).json({
            success: true,
            ...eligibility,
            book: {
                id: book._id,
                title: book.title,
                author: book.author,
                type: book.type,
                price: book.price,
                downloadInfo: downloadInfo
            }
        });

    } catch (error) {
        console.error('❌ Error checking download permission:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check download permission',
            error: error.message
        });
    }
}

/**
 * Get book statistics (admin) - enhanced for both types
 */
async function getBookStats(req, res) {
    try {
        const stats = await Book.aggregate([
            {
                $facet: {
                    // Overall statistics
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalBooks: { $sum: 1 },
                                totalFree: { $sum: { $cond: [{ $eq: ['$price', 0] }, 1, 0] } },
                                totalPremium: { $sum: { $cond: [{ $gt: ['$price', 0] }, 1, 0] } },
                                totalRevenue: { $sum: '$price' },
                                avgPrice: { $avg: '$price' },
                                avgRating: { $avg: '$ratingStats.average' }
                            }
                        }
                    ],
                    // Statistics by type
                    byType: [
                        {
                            $group: {
                                _id: '$type',
                                count: { $sum: 1 },
                                avgPrice: { $avg: '$price' },
                                avgRating: { $avg: '$ratingStats.average' },
                                totalPages: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ['$type', 'ebook'] },
                                            { $ifNull: ['$pages', 0] },
                                            0
                                        ]
                                    }
                                },
                                totalAudioHours: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ['$type', 'audiobook'] },
                                            { 
                                                $divide: [
                                                    { 
                                                        $sum: {
                                                            $map: {
                                                                input: { $split: ['$audioLength', ':'] },
                                                                as: 'part',
                                                                in: { $toInt: '$$part' }
                                                            }
                                                        }
                                                    },
                                                    3600
                                                ]
                                            },
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    // Statistics by genre
                    byGenre: [
                        {
                            $group: {
                                _id: '$genre',
                                count: { $sum: 1 },
                                ebooks: { $sum: { $cond: [{ $eq: ['$type', 'ebook'] }, 1, 0] } },
                                audiobooks: { $sum: { $cond: [{ $eq: ['$type', 'audiobook'] }, 1, 0] } }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ]
                }
            }
        ]);

        const overall = stats[0].overall[0] || {
            totalBooks: 0,
            totalFree: 0,
            totalPremium: 0,
            totalRevenue: 0,
            avgPrice: 0,
            avgRating: 0
        };

        // Format numbers
        overall.totalRevenue = parseFloat(overall.totalRevenue.toFixed(2));
        overall.avgPrice = parseFloat(overall.avgPrice.toFixed(2));
        overall.avgRating = parseFloat(overall.avgRating.toFixed(1));

        // Format byType stats
        const byType = {};
        stats[0].byType.forEach(typeStat => {
            byType[typeStat._id] = {
                count: typeStat.count,
                avgPrice: parseFloat(typeStat.avgPrice.toFixed(2)),
                avgRating: parseFloat(typeStat.avgRating.toFixed(1)),
                ...(typeStat._id === 'ebook' && {
                    totalPages: typeStat.totalPages,
                    avgPages: parseFloat((typeStat.totalPages / typeStat.count).toFixed(0))
                }),
                ...(typeStat._id === 'audiobook' && {
                    totalAudioHours: parseFloat(typeStat.totalAudioHours.toFixed(1)),
                    avgHours: parseFloat((typeStat.totalAudioHours / typeStat.count).toFixed(1))
                })
            };
        });

        return res.status(200).json({
            success: true,
            stats: {
                overall,
                byType,
                byGenre: stats[0].byGenre
            }
        });

    } catch (error) {
        console.error('❌ Error getting book stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get book statistics',
            error: error.message
        });
    }
}

/**
 * Search books with advanced filters (supports narrator search)
 */
async function searchBooks(req, res) {
    try {
        const { 
            q, 
            genre, 
            author, 
            narrator,
            minPrice, 
            maxPrice, 
            type, 
            language,
            minPages,
            maxPages,
            minAudioLength,
            maxAudioLength
        } = req.query;
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        let filter = {};

        // Text search (title, author, description)
        if (q) {
            filter.$text = { $search: q };
        }

        // Genre filter
        if (genre) {
            filter.genre = { $in: genre.split(',') };
        }

        // Author filter
        if (author) {
            filter.author = { $regex: author, $options: 'i' };
        }

        // Narrator filter (for audiobooks)
        if (narrator) {
            filter['narrators.name'] = { $regex: narrator, $options: 'i' };
        }

        // Price range filter
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
        }

        // Type filter
        if (type) {
            filter.type = type;
        }

        // Language filter
        if (language) {
            filter.language = language;
        }

        // Pages filter (for ebooks)
        if (minPages !== undefined || maxPages !== undefined) {
            filter.pages = {};
            if (minPages !== undefined) filter.pages.$gte = parseInt(minPages);
            if (maxPages !== undefined) filter.pages.$lte = parseInt(maxPages);
        }

        // Audio length filter (for audiobooks - requires converting HH:MM:SS to seconds)
        if (minAudioLength || maxAudioLength) {
            // This would require custom logic to convert time strings to seconds
            // For simplicity, we'll note this as a TODO enhancement
            console.log('Audio length filtering not yet implemented');
        }

        const skip = (page - 1) * limit;

        const [books, total] = await Promise.all([
            Book.find(filter)
                .sort({ 
                    trending: -1,
                    'ratingStats.average': -1, 
                    createdAt: -1 
                })
                .skip(skip)
                .limit(limit)
                .lean(),
            Book.countDocuments(filter)
        ]);

        // Add formatted info to each book
        const enhancedBooks = await Promise.all(
            books.map(async (book) => {
                const bookDoc = new Book(book);
                return {
                    ...book,
                    formattedInfo: {
                        priceDisplay: bookDoc.priceDisplay,
                        ...(book.type === 'audiobook' && {
                            audioLength: bookDoc.formattedAudioLength,
                            narratorsList: bookDoc.narratorsList
                        }),
                        ...(book.type === 'ebook' && {
                            pages: book.pages
                        })
                    }
                };
            })
        );

        return res.status(200).json({
            success: true,
            data: enhancedBooks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('❌ Error searching books:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to search books',
            error: error.message
        });
    }
}

/**
 * Get audiobooks by narrator
 */
async function getAudiobooksByNarrator(req, res) {
    try {
        const { narrator } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const filter = {
            type: 'audiobook',
            'narrators.name': { $regex: narrator, $options: 'i' }
        };

        const skip = (page - 1) * limit;

        const [audiobooks, total] = await Promise.all([
            Book.find(filter)
                .sort({ 'ratingStats.average': -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Book.countDocuments(filter)
        ]);

        // Get narrator statistics
        const narratorStats = await Book.aggregate([
            { $match: filter },
            { $unwind: '$narrators' },
            { $match: { 'narrators.name': { $regex: narrator, $options: 'i' } } },
            {
                $group: {
                    _id: '$narrators.name',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$ratingStats.average' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            narrator: narrator,
            stats: narratorStats[0] || null,
            audiobooks: audiobooks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('❌ Error getting audiobooks by narrator:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get audiobooks by narrator',
            error: error.message
        });
    }
}

/**
 * Get books by type (ebook or audiobook)
 */
async function getBooksByType(req, res) {
    try {
        const { type } = req.params;
        
        if (!['ebook', 'audiobook'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book type. Must be "ebook" or "audiobook"'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        const skip = (page - 1) * limit;

        const [books, total] = await Promise.all([
            Book.find({ type })
                .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Book.countDocuments({ type })
        ]);

        return res.status(200).json({
            success: true,
            type: type,
            data: books,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('❌ Error getting books by type:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get books by type',
            error: error.message
        });
    }
}

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    checkDownloadPermission,
    getBookStats,
    searchBooks,
    getAudiobooksByNarrator,
    getBooksByType
};