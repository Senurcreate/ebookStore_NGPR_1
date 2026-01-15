const mongoose = require('mongoose');

// Schema for Replies (Nested inside Review)
const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    // Simple array of User IDs for likes/dislikes on replies
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Flagging for replies
    reports: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        reportedAt: { type: Date, default: Date.now }
    }],
    flagged: { type: Boolean, default: false } // Admin flag
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    // Array of User IDs who liked/disliked the main review
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Nested Replies
    replies: [replySchema],

    // Report system
    reports: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'offensive', 'off-topic', 'other', 'review', 'reply'],
            required: true
        },
        targetType: { type: String, enum: ['review', 'reply'], default: 'review' },
        replyId: { type: mongoose.Schema.Types.ObjectId }, // If reporting a reply
        reportedAt: { type: Date, default: Date.now }
    }],
    
    isHidden: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false }
}, {
    timestamps: true
});


// Compound index to prevent duplicate reviews (one review per user per book)
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ isHidden: 1 });
reviewSchema.index({ 'reports.0': 1 }, { sparse: true });
reviewSchema.index({ user: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;