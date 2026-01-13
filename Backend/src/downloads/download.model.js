const mongoose = require('mongoose');

const downloadHistorySchema = new mongoose.Schema({
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
    // Track if download was free or purchased
    downloadType: {
        type: String,
        enum: ['free', 'purchased'],
        required: true
    },
    // Reference to purchase if it was a purchased book
    purchase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase',
        default: null
    },
    // Device/User agent info for analytics
    userAgent: {
        type: String
    },
    ipAddress: {
        type: String
    },
    downloadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
downloadHistorySchema.index({ user: 1, downloadedAt: -1 });
downloadHistorySchema.index({ book: 1 });
downloadHistorySchema.index({ user: 1, book: 1 });

const DownloadHistory = mongoose.model('DownloadHistory', downloadHistorySchema);

module.exports = DownloadHistory;