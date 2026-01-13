const Wishlist = require('./wishlist.model');
const Book = require('../books/book.model'); 

/**
 * Add book to wishlist
 */
async function addToWishlist(req, res) {
    try {
        const { bookId } = req.body;
        const userId = req.user?._id; 

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        // Check if book exists
        const bookExists = await Book.findById(bookId);
        if (!bookExists) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if already in wishlist
        const existingWishlistItem = await Wishlist.findOne({
            user: userId,
            book: bookId
        });

        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Book already in wishlist' });
        }

        // Create wishlist item
        const wishlistItem = new Wishlist({
            user: userId,
            book: bookId,
            notes: req.body.notes || '',
            priority: req.body.priority || 'medium'
        });

        const savedItem = await wishlistItem.save();
        
        // Populate book details
        const populatedItem = await Wishlist.findById(savedItem._id)
            .populate('book', 'title author coverImage price type');

        return res.status(201).json({
            message: 'Book added to wishlist successfully',
            wishlistItem: populatedItem
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Book already in wishlist' });
        }
        
        return res.status(500).json({ 
            message: 'Failed to add to wishlist', 
            error: error.message 
        });
    }
}

/**
 * Get user's wishlist
 */
async function getWishlist(req, res) {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, sortBy = 'addedAt', sortOrder = 'desc' } = req.query;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Build query
        const query = { user: userId };

        // Execute query with pagination
        const wishlistItems = await Wishlist.find(query)
            .populate('book', 'title author price coverImage type ratingStats cloudinaryUrl')
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Get total count for pagination info
        const totalItems = await Wishlist.countDocuments(query);

        return res.status(200).json({
            message: 'Wishlist retrieved successfully',
            data: wishlistItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                hasNext: (parseInt(page) * parseInt(limit)) < totalItems,
                hasPrevious: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(500).json({ 
            message: 'Failed to fetch wishlist', 
            error: error.message 
        });
    }
}

/**
 * Remove book from wishlist
 */
async function removeFromWishlist(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const deletedItem = await Wishlist.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!deletedItem) {
            return res.status(404).json({ 
                message: 'Wishlist item not found or you do not have permission' 
            });
        }

        return res.status(200).json({
            message: 'Book removed from wishlist successfully'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ 
            message: 'Failed to remove from wishlist', 
            error: error.message 
        });
    }
}

/**
 * Remove book from wishlist by book ID
 */
async function removeByBookId(req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const deletedItem = await Wishlist.findOneAndDelete({
            book: bookId,
            user: userId
        });

        if (!deletedItem) {
            return res.status(404).json({ 
                message: 'Book not found in wishlist' 
            });
        }

        return res.status(200).json({
            message: 'Book removed from wishlist successfully'
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ 
            message: 'Failed to remove from wishlist', 
            error: error.message 
        });
    }
}

/**
 * Check if book is in user's wishlist
 */
async function checkInWishlist(req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const wishlistItem = await Wishlist.findOne({
            user: userId,
            book: bookId
        });

        return res.status(200).json({
            isInWishlist: !!wishlistItem,
            wishlistItem: wishlistItem || null
        });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        return res.status(500).json({ 
            message: 'Failed to check wishlist', 
            error: error.message 
        });
    }
}

/**
 * Update wishlist item (notes, priority)
 */
async function updateWishlistItem(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const { notes, priority } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find and update
        const updatedItem = await Wishlist.findOneAndUpdate(
            { _id: id, user: userId },
            { 
                ...(notes !== undefined && { notes }),
                ...(priority && { priority })
            },
            { new: true, runValidators: true }
        ).populate('book', 'title author coverImage price');

        if (!updatedItem) {
            return res.status(404).json({ 
                message: 'Wishlist item not found or you do not have permission' 
            });
        }

        return res.status(200).json({
            message: 'Wishlist item updated successfully',
            wishlistItem: updatedItem
        });
    } catch (error) {
        console.error('Error updating wishlist item:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: error.errors 
            });
        }
        
        return res.status(500).json({ 
            message: 'Failed to update wishlist item', 
            error: error.message 
        });
    }
}

/**
 * Get wishlist statistics
 */
async function getWishlistStats(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const stats = await Wishlist.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
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
                    totalItems: { $sum: 1 },
                    totalValue: { $sum: '$bookDetails.price' },
                    byType: {
                        $push: {
                            type: '$bookDetails.type',
                            price: '$bookDetails.price'
                        }
                    },
                    byPriority: {
                        $push: {
                            priority: '$priority'
                        }
                    }
                }
            },
            {
                $project: {
                    totalItems: 1,
                    totalValue: 1,
                    ebookCount: {
                        $size: {
                            $filter: {
                                input: '$byType',
                                as: 'item',
                                cond: { $eq: ['$$item.type', 'ebook'] }
                            }
                        }
                    },
                    audiobookCount: {
                        $size: {
                            $filter: {
                                input: '$byType',
                                as: 'item',
                                cond: { $eq: ['$$item.type', 'audiobook'] }
                            }
                        }
                    },
                    priorityDistribution: {
                        low: {
                            $size: {
                                $filter: {
                                    input: '$byPriority',
                                    as: 'item',
                                    cond: { $eq: ['$$item.priority', 'low'] }
                                }
                            }
                        },
                        medium: {
                            $size: {
                                $filter: {
                                    input: '$byPriority',
                                    as: 'item',
                                    cond: { $eq: ['$$item.priority', 'medium'] }
                                }
                            }
                        },
                        high: {
                            $size: {
                                $filter: {
                                    input: '$byPriority',
                                    as: 'item',
                                    cond: { $eq: ['$$item.priority', 'high'] }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        return res.status(200).json({
            message: 'Wishlist statistics retrieved successfully',
            stats: stats[0] || {
                totalItems: 0,
                totalValue: 0,
                ebookCount: 0,
                audiobookCount: 0,
                priorityDistribution: { low: 0, medium: 0, high: 0 }
            }
        });
    } catch (error) {
        console.error('Error fetching wishlist stats:', error);
        return res.status(500).json({ 
            message: 'Failed to fetch wishlist statistics', 
            error: error.message 
        });
    }
}

/**
 * Clear entire wishlist
 */
async function clearWishlist(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const result = await Wishlist.deleteMany({ user: userId });

        return res.status(200).json({
            message: 'Wishlist cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        return res.status(500).json({ 
            message: 'Failed to clear wishlist', 
            error: error.message 
        });
    }
}


module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    removeByBookId,
    checkInWishlist,
    updateWishlistItem,
    getWishlistStats,
    clearWishlist
};