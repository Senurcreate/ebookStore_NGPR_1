const mongoose = require('mongoose');

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
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer between 1 and 5'
        }
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    // Track likes/dislikes (or helpful votes)
    helpfulVotes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isHelpful: {
            type: Boolean,
            default: true
        },
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Report system
    reports: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'offensive', 'off-topic', 'other'],
            required: true
        },
        details: {
            type: String,
            maxlength: 500
        },
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Moderation fields
    isHidden: {
        type: Boolean,
        default: false
    },
    hiddenReason: {
        type: String,
        enum: ['reported', 'violation', 'user_deleted', 'other']
    },
    hiddenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    hiddenAt: {
        type: Date
    },
    // Edit history
    editedAt: {
        type: Date
    },
    editHistory: [{
        previousComment: String,
        previousRating: Number,
        editedAt: Date
    }],
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate reviews (one review per user per book)
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Indexes for common queries
reviewSchema.index({ book: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ 'helpfulVotes': 1 });
reviewSchema.index({ isHidden: 1 });

// Calculate helpful score (virtual)
reviewSchema.virtual('helpfulScore').get(function() {
    const helpful = this.helpfulVotes.filter(v => v.isHelpful).length;
    const total = this.helpfulVotes.length;
    return total > 0 ? Math.round((helpful / total) * 100) : 0;
});

// Calculate report count (virtual)
reviewSchema.virtual('reportCount').get(function() {
    return this.reports.length;
});

// Method to add/edit a vote
reviewSchema.methods.addVote = function(userId, isHelpful = true) {
    const existingIndex = this.helpfulVotes.findIndex(v => 
        v.user.toString() === userId.toString()
    );
    
    if (existingIndex > -1) {
        // Update existing vote
        this.helpfulVotes[existingIndex].isHelpful = isHelpful;
        this.helpfulVotes[existingIndex].votedAt = new Date();
    } else {
        // Add new vote
        this.helpfulVotes.push({
            user: userId,
            isHelpful,
            votedAt: new Date()
        });
    }
    
    return this.save();
};

// Method to remove a vote
reviewSchema.methods.removeVote = function(userId) {
    const initialLength = this.helpfulVotes.length;
    this.helpfulVotes = this.helpfulVotes.filter(v => 
        v.user.toString() !== userId.toString()
    );
    
    if (this.helpfulVotes.length !== initialLength) {
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to check if user has voted
reviewSchema.methods.hasUserVoted = function(userId) {
    return this.helpfulVotes.some(v => 
        v.user.toString() === userId.toString()
    );
};

// Method to get user's vote
reviewSchema.methods.getUserVote = function(userId) {
    const vote = this.helpfulVotes.find(v => 
        v.user.toString() === userId.toString()
    );
    return vote ? vote.isHelpful : null;
};

// Method to add a report
reviewSchema.methods.addReport = function(userId, reason, details = '') {
    // Check if user already reported
    const alreadyReported = this.reports.some(r => 
        r.user.toString() === userId.toString()
    );
    
    if (!alreadyReported) {
        this.reports.push({
            user: userId,
            reason,
            details,
            reportedAt: new Date()
        });
        return this.save();
    }
    
    return Promise.resolve(this);
};

// Method to check if user has reported
reviewSchema.methods.hasUserReported = function(userId) {
    return this.reports.some(r => 
        r.user.toString() === userId.toString()
    );
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;