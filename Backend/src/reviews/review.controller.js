const Review = require('./review.model');
const Book = require('../books/book.model');
const mongoose = require('mongoose');

/**
 * Create a new review
 */
async function createReview(req, res) {
    try {
        const { bookId } = req.params;
        const { rating, comment, title } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Validate required fields
        if (!rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Rating and comment are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
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

        // Check if user already reviewed this book
        const existingReview = await Review.findOne({
            user: userId,
            book: bookId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this book',
                existingReviewId: existingReview._id
            });
        }

        // Create the review
        const review = new Review({
            user: userId,
            book: bookId,
            rating: parseInt(rating),
            comment: comment.trim(),
            title: title ? title.trim() : null
        });

        await review.save();

        // Update book rating stats
        await Book.updateRatingStats(bookId);

        // Populate user info
        const populatedReview = await Review.findById(review._id)
            .populate('user', 'displayName photoURL');

        return res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review: populatedReview
        });

    } catch (error) {
        console.error('Error creating review:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this book'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: error.message
        });
    }
}

/**
 * Get all reviews for a book
 */
async function getBookReviews(req, res) {
    try {
        const { bookId } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            sort = 'recent', 
            rating, 
            helpful 
        } = req.query;
        const userId = req.user?._id;

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Build query
        const query = { book: bookId, isHidden: { $ne: true } };
        if (rating) query.rating = parseInt(rating);

        // Build sort options
        let sortOptions = {};
        switch (sort) {
            case 'helpful':
                // Sort by helpful votes (needs aggregation)
                break;
            case 'rating_high':
                sortOptions.rating = -1;
                sortOptions.createdAt = -1;
                break;
            case 'rating_low':
                sortOptions.rating = 1;
                sortOptions.createdAt = -1;
                break;
            case 'recent':
            default:
                sortOptions.createdAt = -1;
        }

        // Get reviews with pagination
        const reviews = await Review.find(query)
            .populate('user', 'displayName photoURL')
            .sort(sortOptions)
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .lean();

        // Add user-specific data (if user is logged in)
        if (userId) {
            for (const review of reviews) {
                review.hasUserVoted = await Review.exists({
                    _id: review._id,
                    'helpfulVotes.user': userId
                });
                review.hasUserReported = await Review.exists({
                    _id: review._id,
                    'reports.user': userId
                });
            }
        }

        // Get total count
        const total = await Review.countDocuments(query);

        // Get rating distribution
        const distribution = await Review.aggregate([
            { $match: { book: mongoose.Types.ObjectId(bookId), isHidden: { $ne: true } } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format distribution
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach(item => {
            ratingDistribution[item._id] = item.count;
        });

        return res.status(200).json({
            success: true,
            message: 'Reviews retrieved successfully',
            data: reviews,
            stats: {
                average: book.ratingStats.average,
                count: book.ratingStats.count,
                distribution: ratingDistribution
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
                hasNext: (parseInt(page) * parseInt(limit)) < total,
                hasPrevious: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching book reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
}

/**
 * Get a single review by ID
 */
async function getReviewById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const review = await Review.findById(id)
            .populate('user', 'displayName photoURL')
            .populate('book', 'title author coverImage');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Don't show hidden reviews to non-owners/admins
        if (review.isHidden && 
            (!userId || 
             (review.user._id.toString() !== userId.toString() && 
              req.user?.role !== 'admin' && 
              req.user?.role !== 'moderator'))) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Add user-specific data
        if (userId) {
            review._doc.hasUserVoted = review.hasUserVoted(userId);
            review._doc.hasUserReported = review.hasUserReported(userId);
            review._doc.userVote = review.getUserVote(userId);
        }

        return res.status(200).json({
            success: true,
            review
        });

    } catch (error) {
        console.error('Error fetching review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch review',
            error: error.message
        });
    }
}

/**
 * Update a review
 */
async function updateReview(req, res) {
    try {
        const { id } = req.params;
        const { rating, comment, title } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Find the review
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own reviews'
            });
        }

        // Prepare updates
        const updates = {};
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            updates.rating = parseInt(rating);
        }
        
        if (comment !== undefined) {
            updates.comment = comment.trim();
        }
        
        if (title !== undefined) {
            updates.title = title ? title.trim() : null;
        }

        // Save previous version to history
        if (comment !== undefined || rating !== undefined) {
            review.editHistory.push({
                previousComment: review.comment,
                previousRating: review.rating,
                editedAt: new Date()
            });
        }

        // Apply updates
        Object.assign(review, updates);
        review.editedAt = new Date();
        
        await review.save();

        // Update book rating stats
        await Book.updateRatingStats(review.book);

        // Populate user info
        const populatedReview = await Review.findById(review._id)
            .populate('user', 'displayName photoURL');

        return res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review: populatedReview
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
}

/**
 * Delete a review
 */
async function deleteReview(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        // Find the review
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check ownership or admin privileges
        const isOwner = review.user.toString() === userId.toString();
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'moderator';
        
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this review'
            });
        }

        const bookId = review.book;
        
        // Soft delete for owners, hard delete for admins
        if (isOwner) {
            // Soft delete - hide the review
            review.isHidden = true;
            review.hiddenReason = 'user_deleted';
            review.hiddenAt = new Date();
            await review.save();
        } else {
            // Hard delete for admins
            await Review.findByIdAndDelete(id);
        }

        // Update book rating stats
        await Book.updateRatingStats(bookId);

        return res.status(200).json({
            success: true,
            message: isOwner ? 'Review deleted successfully' : 'Review removed by admin'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: error.message
        });
    }
}

/**
 * Vote on a review (helpful/not helpful)
 */
async function voteOnReview(req, res) {
    try {
        const { id } = req.params;
        const { isHelpful = true } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Can't vote on your own review
        if (review.user.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot vote on your own review'
            });
        }

        await review.addVote(userId, isHelpful);

        return res.status(200).json({
            success: true,
            message: `Review marked as ${isHelpful ? 'helpful' : 'not helpful'}`,
            votes: {
                total: review.helpfulVotes.length,
                helpful: review.helpfulVotes.filter(v => v.isHelpful).length
            }
        });

    } catch (error) {
        console.error('Error voting on review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to vote on review',
            error: error.message
        });
    }
}

/**
 * Remove vote from review
 */
async function removeVote(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.removeVote(userId);

        return res.status(200).json({
            success: true,
            message: 'Vote removed successfully',
            votes: {
                total: review.helpfulVotes.length,
                helpful: review.helpfulVotes.filter(v => v.isHelpful).length
            }
        });

    } catch (error) {
        console.error('Error removing vote:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove vote',
            error: error.message
        });
    }
}

/**
 * Report a review
 */
async function reportReview(req, res) {
    try {
        const { id } = req.params;
        const { reason, details } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required'
            });
        }

        const validReasons = ['spam', 'inappropriate', 'offensive', 'off-topic', 'other'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reason'
            });
        }

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Can't report your own review
        if (review.user.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot report your own review'
            });
        }

        // Check if already reported
        if (review.hasUserReported(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this review'
            });
        }

        await review.addReport(userId, reason, details);

        return res.status(200).json({
            success: true,
            message: 'Review reported successfully',
            reportCount: review.reports.length
        });

    } catch (error) {
        console.error('Error reporting review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to report review',
            error: error.message
        });
    }
}

/**
 * Get user's own reviews
 */
async function getMyReviews(req, res) {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10 } = req.query;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const reviews = await Review.find({ user: userId })
            .populate('book', 'title author coverImage')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ user: userId });

        return res.status(200).json({
            success: true,
            message: 'Your reviews retrieved successfully',
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
                hasNext: (parseInt(page) * parseInt(limit)) < total,
                hasPrevious: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching user reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch your reviews',
            error: error.message
        });
    }
}

/**
 * Check if user has reviewed a book
 */
async function checkUserReview(req, res) {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const review = await Review.findOne({
            user: userId,
            book: bookId
        }).populate('user', 'displayName photoURL');

        return res.status(200).json({
            success: true,
            hasReviewed: !!review,
            review: review || null
        });

    } catch (error) {
        console.error('Error checking user review:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check review status',
            error: error.message
        });
    }
}

module.exports = {
    createReview,
    getBookReviews,
    getReviewById,
    updateReview,
    deleteReview,
    voteOnReview,
    removeVote,
    reportReview,
    getMyReviews,
    checkUserReview
};