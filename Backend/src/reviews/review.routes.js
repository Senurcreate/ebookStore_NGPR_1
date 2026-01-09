const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { verifyFirebaseToken, requireAdminOrModerator } = require('../middleware/firebase.middleware');

const Review = require('./review.model');

// Apply authentication middleware to all routes


// ====================
// PUBLIC REVIEW ROUTES (No auth needed for reading)
// ====================

// Get reviews for a book (public - no auth required)
router.get('/books/:bookId', reviewController.getBookReviews);

router.use(verifyFirebaseToken);

// Get a specific review (public - no auth required)
//router.get('/:id', reviewController.getReviewById);

// ====================
// USER REVIEW ROUTES (Require auth)
// ====================

// Create a review for a book
router.post('/books/:bookId', reviewController.createReview);

// Update a review
router.put('/:id', reviewController.updateReview);

//Add reply
router.post('/:id/reply', reviewController.addReply);

// Delete a review
router.delete('/:id', reviewController.deleteContent);

// Vote on a review (helpful/not helpful)
router.post('/:id/vote', reviewController.voteOnReview);


// Report a review
router.post('/:id/report', reviewController.reportReview);



// ====================
// ADMIN/MODERATOR ROUTES
// ====================

// Admin: Get all reported reviews
router.get('/admin/reported', requireAdminOrModerator, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        
        const reviews = await Review.find({ 'reports.0': { $exists: true } })
            .populate('user', 'displayName email')
            .populate('book', 'title author')
            .populate('reports.user', 'displayName email')
            .sort({ 'reports': -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ 'reports.0': { $exists: true } });

        res.status(200).json({
            success: true,
            data: reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching reported reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reported reviews',
            error: error.message
        });
    }
});

// Admin: Hide/unhide a review
router.patch('/admin/:id/hide', requireAdminOrModerator, async (req, res) => {
    try {
        const { id } = req.params;
        const { isHidden, reason } = req.body;
        const moderatorId = req.user._id;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.isHidden = isHidden !== undefined ? isHidden : true;
        if (reason) review.hiddenReason = reason;
        review.hiddenBy = moderatorId;
        review.hiddenAt = new Date();

        await review.save();

        res.status(200).json({
            success: true,
            message: `Review ${review.isHidden ? 'hidden' : 'unhidden'} successfully`,
            review
        });
    } catch (error) {
        console.error('Error hiding review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review visibility',
            error: error.message
        });
    }
});

// Admin: Clear all reports from a review
router.delete('/admin/:id/reports', requireAdminOrModerator, async (req, res) => {
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

        res.status(200).json({
            success: true,
            message: 'All reports cleared from review',
            review
        });
    } catch (error) {
        console.error('Error clearing reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear reports',
            error: error.message
        });
    }
});

module.exports = router;