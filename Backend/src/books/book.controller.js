const Book = require('./book.model');
//const Purchase = require('../purchases/purchase.model');
const CloudinaryService = require('../services/cloudinary.service');

const buildCloudinaryInfo = (inputUrl, fetchedInfo) => {
    const publicId = CloudinaryService.extractPublicId(inputUrl);
    
    const baseInfo = {
        publicId: publicId,
        secureUrl: inputUrl, // FORCE the secureUrl to match the input
        resourceType: 'auto',
        format: inputUrl.split('.').pop() || 'pdf',
        bytes: 0,
        duration: 0
    };

    // If  successfully fetched real data from Cloudinary, merge it in
    if (fetchedInfo) {
        return {
            ...baseInfo,
            resourceType: fetchedInfo.resourceType,
            format: fetchedInfo.format,
            bytes: fetchedInfo.bytes,
            duration: fetchedInfo.duration || 0,
        };
    }

    return baseInfo;
};

/**
 * Create a new book with Google Drive integration (supports both ebooks and audiobooks)
 */
async function createBook(req, res) {
    try {
        const body = { ...(req.body || {}) };
        const bookType = body.type || 'ebook';
        
        // --- 1. Validate & Prepare Metadata ---
        let finalCloudinaryInfo = {};
        let finalFileSize = 0;

        if (body.cloudinaryUrl) {
            if (!CloudinaryService.isValidCloudinaryUrl(body.cloudinaryUrl)) {
                 return res.status(400).json({ success: false, message: 'Invalid Cloudinary URL' });
            }

            // A. Try to fetch real metadata (Size, Duration)
            let fetchedInfo = null;
            try {
                const publicId = CloudinaryService.extractPublicId(body.cloudinaryUrl);
                if (publicId) {
                    fetchedInfo = await CloudinaryService.getFileInfo(publicId);
                }
            } catch (err) {
                console.warn("⚠️ Metadata fetch failed (using default URL):", err.message);
            }

            // B. Build the forced object
            finalCloudinaryInfo = buildCloudinaryInfo(body.cloudinaryUrl, fetchedInfo);
            finalFileSize = finalCloudinaryInfo.bytes;
        }

        // --- 2. Construct Book Data ---
        const bookData = {
            ...body,
            type: bookType,
            price: parseFloat(body.price),
            trending: Boolean(body.trending),
            publication_date: new Date(body.publication_date),
            
            // Apply the forced info
            cloudinaryUrl: body.cloudinaryUrl,
            cloudinaryInfo: finalCloudinaryInfo,
            fileSize: finalFileSize,
            
            // FORCE fileInfo to match immediately
            fileInfo: {
                downloadUrl: body.cloudinaryUrl,
                previewUrl: body.cloudinaryUrl,
                embedCode: CloudinaryService.generateEmbedCode(body.cloudinaryUrl, bookType)
            }
        };

        // Type-specific parsing
        if (bookType === 'ebook') bookData.pages = parseInt(body.pages);
        if (bookType === 'audiobook') {
            bookData.audioLength = body.audioLength?.trim();
            if (body.narrators) {
                bookData.narrators = body.narrators.map(n => ({ name: n.name.trim() }));
            }
        }

        // --- 3. Save ---
        const newBook = new Book(bookData);
        const savedBook = await newBook.save();

        return res.status(201).json({
            success: true,
            message: 'Book created successfully',
            book: savedBook
        });

    } catch (error) {
        console.error('❌ Error creating book:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}


/**
 * 2. UPLOAD FILE
 * Wraps the Cloudinary upload service.
 */
async function uploadFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { folder, resourceType } = req.body;
        
        const result = await CloudinaryService.uploadFile(req.file, {
            folder: folder || 'ebookstore',
            resourceType: resourceType || 'auto'
        });

        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: result
        });

    } catch (error) {
        console.error('❌ Error uploading file:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to upload file',
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

        // 1. Initialize Filter Object
        let filter = {};

        if (search) {
            const searchKeywords = search.split(" ").filter(word => word.trim() !== "");

            const keywordConditions = searchKeywords.map(word => ({
                $or: [
                    { title: { $regex: word, $options: "i" } },
                    { description: { $regex: word, $options: "i" } },
                    { author: { $regex: word, $options: "i" } },
                    { genre: { $regex: word, $options: "i" } }
                ]
            }));

            if (keywordConditions.length > 0) {
                filter.$and = keywordConditions; // ✅ Fixed: Assigned to 'filter' instead of 'query'
            }
        }

        // --- STANDARD FILTERS ---
        
        // Filter by genre
        if (genre) {
            filter.genre = { $in: genre.split(',') };
        }

        // Filter by type (ebook/audiobook)
        if (type) {
            filter.type = type;
        }

        // Filter by price
        if (price) {
            if (price === "free") {
                filter.price = 0;
            } else if (price === "premium") {
                filter.price = { $gt: 0 };
            } else {
                // Expecting format "min-max" e.g., "0-500"
                const [min, max] = price.split('-').map(Number);
                if (!isNaN(min) && !isNaN(max)) {
                    filter.price = { $gte: min, $lte: max };
                }
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
            // Handle specific logic if 'none' means Sinhala or standard check
            filter.language = language;
        }

        // Filter by trending
        if (trending === 'true') {
            filter.trending = true;
        }

        // --- SORTING ---
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

        // --- PAGINATION ---
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // --- EXECUTION ---
        const [books, total] = await Promise.all([
            Book.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(), // lean() makes it faster (returns plain JS objects, not Mongoose docs)
            Book.countDocuments(filter)
        ]);

        // --- OPTIONAL: STATS (Aggregations) ---
        // Only run this if needed, as it adds DB load. 
        // If you just need the books, you can remove this block.
        /* const typeStats = await Book.aggregate([
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
        */

        // --- FORMATTING RESPONSE ---
        const enhancedBooks = books.map(book => ({
            ...book,
            downloadUrl: book.cloudinaryUrl, // Alias for frontend clarity
            formattedInfo: {
                priceDisplay: book.price === 0 ? 'Free' : `Rs. ${book.price.toFixed(2)}`,
                ...(book.type === 'audiobook' && {
                    audioLength: book.audioLength,
                    narratorsList: book.narrators?.map(n => n.name).join(', ') || ''
                })
            }
        }));

        return res.status(200).json({
            success: true,
            message: 'Books retrieved successfully',
            data: enhancedBooks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Error fetching books:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch books' });
    }
}

module.exports = { getAllBooks };

/* filter options */

async function getFilterOptions(req, res) {
    try {
        // Optional: Allow frontend to request specific type (e.g., ?type=audiobook)
        // If no type provided, fetch unique values from ALL books
        const filterQuery = req.query.type ? { type: req.query.type } : {};

        const [authors, genres, languages] = await Promise.all([
            Book.distinct('author', filterQuery),
            Book.distinct('genre', filterQuery),
            Book.distinct('language', filterQuery)
        ]);

        return res.status(200).json({
            success: true,
            data: {
                authors: authors.sort(),
                genres: genres.sort(),
                languages: languages.sort(),
                // These remain static as they are defined in frontend constants usually
                prices: [], 
                ratings: []
            }
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch filters' });
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
                previewAvailable: book.preview?.enabled || false,
                downloadEligibility: downloadEligibility,
                purchaseInfo: purchaseInfo
            },
            preview: previewContent,
            similarBooks,
            downloadUrl: book.cloudinaryUrl
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

        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
        const urlToUse = updates.cloudinaryUrl || book.cloudinaryUrl;

        const isUrlChanged = updates.cloudinaryUrl && updates.cloudinaryUrl !== book.cloudinaryUrl;
        
        const isDataBroken = book.cloudinaryInfo?.secureUrl?.includes('your-cloud-name') || 
                             book.fileInfo?.downloadUrl?.includes('your-cloud-name');

        const isMismatch = book.fileInfo?.downloadUrl !== urlToUse;

        const isMissingInfo = !book.cloudinaryInfo || !book.cloudinaryInfo.publicId;


        if (isUrlChanged || isDataBroken || isMismatch || isMissingInfo) {
            console.log(`🔄 Force-Syncing Metadata for: ${book.title}`);

            book.cloudinaryUrl = urlToUse;

            let fetchedInfo = null;
            try {
                const publicId = CloudinaryService.extractPublicId(urlToUse);
                if (publicId) {
                    fetchedInfo = await CloudinaryService.getFileInfo(publicId);
                }
            } catch (err) {
                console.warn("⚠️ Metadata fetch warning:", err.message);
            }
            const publicId = CloudinaryService.extractPublicId(urlToUse);
            const baseInfo = {
                publicId: publicId,
                secureUrl: urlToUse, // FORCE this to match
                resourceType: 'auto',
                format: urlToUse.split('.').pop() || 'pdf',
                bytes: 0,
                duration: 0
            };

            book.cloudinaryInfo = fetchedInfo ? {
                ...baseInfo,
                resourceType: fetchedInfo.resourceType,
                format: fetchedInfo.format,
                bytes: fetchedInfo.bytes,
                duration: fetchedInfo.duration || 0,
            } : baseInfo;

            book.fileSize = book.cloudinaryInfo.bytes;

            book.fileInfo = {
                downloadUrl: urlToUse, // FORCE this to match
                previewUrl: urlToUse,
                embedCode: CloudinaryService.generateEmbedCode(urlToUse, book.type)
            };
        }

        // --- Apply other standard updates ---
        const protectedFields = ['cloudinaryUrl', 'cloudinaryInfo', 'fileInfo', '_id'];
        Object.keys(updates).forEach((key) => {
            if (!protectedFields.includes(key)) {
                book[key] = updates[key];
            }
        });

        // --- Sanitization for eBooks (Prevents "min: 1" error) ---
        if (book.type === 'ebook') {
            if (book.preview) book.preview.sampleMinutes = undefined;
            book.audioLength = undefined;
            book.narrators = undefined;
        }

        // --- Save ---
        const updatedBook = await book.save();

        return res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            book: updatedBook
        });

    } catch (error) {
        console.error('❌ Error updating book:', error);
        return res.status(500).json({ success: false, message: error.message });
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

        // Try deleting from Cloudinary
        if (book.cloudinaryInfo?.publicId) {
            try {
                await CloudinaryService.deleteFile(book.cloudinaryInfo.publicId);
            } catch (err) {
                console.error('Cloudinary delete warning:', err.message);
            }
        }

        await Book.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            book
        });

    } catch (error) {
        console.error('❌ Error deleting book:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete book' });
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
 * Search books with forgiving logic (Partial matches & Substrings)
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

        if (minAudioLength || maxAudioLength) {
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
    uploadFile,
    updateBook,
    deleteBook,
    checkDownloadPermission,
    getBookStats,
    searchBooks,
    getAudiobooksByNarrator,
    getBooksByType,
    getFilterOptions
};