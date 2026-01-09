const Review = require('./review.model');
const Book = require('../books/book.model');
const mongoose = require('mongoose');

// Helper to format relative time
const formatTime = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

// Create Review
async function createReview(req, res) {
    try {
        const { bookId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const existingReview = await Review.findOne({ user: userId, book: bookId });
        if (existingReview) return res.status(400).json({ message: 'You have already reviewed this book' });

        const review = new Review({
            user: userId,
            book: bookId,
            rating: Number(rating),
            comment: comment.trim()
        });

        await review.save();
        await Book.updateRatingStats(bookId);

        // Populate and return formatted
        await review.populate('user', 'displayName photoURL');
        
        // Format for frontend
        const formattedReview = {
            id: review._id,
            userId: review.user._id,
            name: review.user.displayName,
            photo: review.user.photoURL,
            time: "Just now",
            rating: review.rating,
            comment: review.comment,
            likes: 0,
            dislikes: 0,
            replies: [],
            userLiked: false,
            userDisliked: false,
            flagged: false,
            flaggedBy: []
        };

        return res.status(201).json({ success: true, review: formattedReview });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get Reviews for a Book
// Get Reviews for a Book
async function getBookReviews(req, res) {
    try {
        const { bookId } = req.params;
        const currentUserId = req.user ? req.user._id.toString() : null;

        const reviews = await Review.find({ book: bookId, isHidden: false })
            .populate('user', 'displayName photoURL')
            .populate('replies.user', 'displayName photoURL')
            .sort({ createdAt: -1 });

        // Transform data to match Frontend State structure perfectly
        const formattedReviews = reviews
            // FIX 1: Filter out reviews where the user account was deleted
            .filter(review => review.user !== null) 
            .map(review => ({
                id: review._id,
                userId: review.user._id,
                name: review.user.displayName,
                time: formatTime(review.createdAt),
                photo: review.user.photoURL,
                rating: review.rating,
                comment: review.comment,
                likes: review.likes.length,
                dislikes: review.dislikes.length,
                userLiked: currentUserId ? review.likes.includes(currentUserId) : false,
                userDisliked: currentUserId ? review.dislikes.includes(currentUserId) : false,
                flaggedBy: review.reports.map(r => r.user.toString()),
                flagged: currentUserId ? review.reports.some(r => r.user.toString() === currentUserId) : false,
                showReplies: false,
                replies: review.replies
                    // FIX 2: Filter out replies where the replier account was deleted
                    .filter(reply => reply.user !== null)
                    .map(reply => ({
                        id: reply._id,
                        userId: reply.user._id,
                        name: reply.user.displayName,
                        time: formatTime(reply.createdAt),
                        photo: review.user.photoURL,
                        comment: reply.comment,
                        likes: reply.likes.length,
                        dislikes: reply.dislikes.length,
                        userLiked: currentUserId ? reply.likes.includes(currentUserId) : false,
                        userDisliked: currentUserId ? reply.dislikes.includes(currentUserId) : false,
                        flaggedBy: reply.reports.map(r => r.user.toString()),
                        flagged: currentUserId ? reply.reports.some(r => r.user.toString() === currentUserId) : false,
                    }))
            }));

        return res.status(200).json({ success: true, data: formattedReviews });

    } catch (error) {
        console.error("Get Reviews Error:", error); // Log the real error to terminal
        return res.status(500).json({ success: false, error: error.message });
    }
}

// Add Reply
async function addReply(req, res) {
    try {
        const { id } = req.params; // Review ID
        const { comment } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        review.replies.push({
            user: userId,
            comment: comment
        });

        await review.save();
        
        // Get the just added reply (last one)
        const newReply = review.replies[review.replies.length - 1];
        await review.populate(`replies.${review.replies.length - 1}.user`, 'displayName');

        // Format for frontend
        const formattedReply = {
            id: newReply._id,
            userId: userId,
            name: req.user.displayName, 
            photo: review.user.photoURL,// Optimistic UI name
            time: "Just now",
            comment: newReply.comment,
            likes: 0,
            dislikes: 0,
            userLiked: false,
            userDisliked: false,
            flagged: false,
            flaggedBy: []
        };

        return res.status(200).json({ success: true, reply: formattedReply });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

// Vote (Like/Dislike) Logic
async function voteOnReview(req, res) {
    try {
        const { id } = req.params; 
        const { action, replyId } = req.body; 
        const userId = req.user._id;

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        // Determine if we are voting on the Main Review or a Reply
        let targetObj = review;
        if (replyId) {
            targetObj = review.replies.id(replyId);
            if (!targetObj) return res.status(404).json({ message: 'Reply not found' });
        }

        // Convert ObjectIds to strings for comparison
        const likes = targetObj.likes.map(id => id.toString());
        const dislikes = targetObj.dislikes.map(id => id.toString());
        const uid = userId.toString();

        const isLiked = likes.includes(uid);
        const isDisliked = dislikes.includes(uid);

        // --- VOTING LOGIC ---
        if (action === 'like') {
            if (isLiked) {
                // Toggle OFF: Remove like
                targetObj.likes = targetObj.likes.filter(id => id.toString() !== uid);
            } else {
                // Toggle ON: Add like, Remove dislike if exists
                targetObj.likes.push(userId);
                if (isDisliked) {
                    targetObj.dislikes = targetObj.dislikes.filter(id => id.toString() !== uid);
                }
            }
        } else if (action === 'dislike') {
            if (isDisliked) {
                // Toggle OFF: Remove dislike
                targetObj.dislikes = targetObj.dislikes.filter(id => id.toString() !== uid);
            } else {
                // Toggle ON: Add dislike, Remove like if exists
                targetObj.dislikes.push(userId);
                if (isLiked) {
                    targetObj.likes = targetObj.likes.filter(id => id.toString() !== uid);
                }
            }
        }

        await review.save();

        // --- RETURN UPDATED COUNTS ---
        // We recalculate boolean states for the response
        const newLikes = targetObj.likes.map(id => id.toString());
        const newDislikes = targetObj.dislikes.map(id => id.toString());

        return res.status(200).json({ 
            success: true, 
            data: {
                likes: newLikes.length,
                dislikes: newDislikes.length,
                userLiked: newLikes.includes(uid),
                userDisliked: newDislikes.includes(uid)
            }
        });

    } catch (error) {
        console.error("Vote Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

// Report Review or Reply
async function reportReview(req, res) {
    try {
        const { id } = req.params;
        const { reason, replyId } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Not found' });

        if (replyId) {
            const reply = review.replies.id(replyId);
            // Check if already reported
            const existing = reply.reports.find(r => r.user.toString() === userId.toString());
            if (!existing) {
                reply.reports.push({ user: userId, reason });
            }
        } else {
            // Check if already reported
            const existing = review.reports.find(r => r.user.toString() === userId.toString() && !r.replyId);
            if (!existing) {
                review.reports.push({ user: userId, reason, targetType: 'review' });
            }
        }

        await review.save();
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

async function updateReview(req, res) {
    try {
        const { id } = req.params; // Review ID
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Ensure the user owns this review
        if (review.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only edit your own reviews' });
        }

        // Update fields if they are provided
        if (rating) review.rating = Number(rating);
        if (comment) review.comment = comment.trim();

        await review.save();

        // CRITICAL: Re-calculate the book stats immediately
        // This ensures the 3.8 becomes the new correct average
        await Book.updateRatingStats(review.book);

        return res.status(200).json({ 
            success: true, 
            message: 'Review updated', 
            review: {
                id: review._id,
                rating: review.rating,
                comment: review.comment,
                time: "Just now (Edited)" // Optional: indicate it was edited
            }
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ success: false, message: 'Failed to update review' });
    }
}

// Delete Review or Reply
async function deleteContent(req, res) {
    try {
        const { id } = req.params;
        const { replyId } = req.query; // Query param for reply
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Not found' });

        if (replyId) {
            // Delete Reply
            const reply = review.replies.id(replyId);
            if (!reply) return res.status(404).json({ message: 'Reply not found' });
            
            if (reply.user.toString() !== userId.toString() && !isAdmin) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            
            review.replies.pull(replyId);
            await review.save();
        } else {
            // Delete Review
            if (review.user.toString() !== userId.toString() && !isAdmin) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            await Review.findByIdAndDelete(id);
            await Book.updateRatingStats(review.book);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    createReview,
    getBookReviews,
    addReply,
    voteOnReview,
    reportReview,
    updateReview,
    deleteContent
};