const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
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
    // For simulation - we'll generate a fake price
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    // Status for simulation
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'failed'],
        default: 'completed' // Since we're simulating successful purchases
    },
    // Simulated payment method
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'wallet', 'free'],
        default: 'credit_card'
    },
    // For tracking simulation
    simulatedOrderId: {
        type: String,
    },
    downloadTracking: {
        downloadsUsed: {
            type: Number,
            default: 0
        },
        maxDownloads: {
            type: Number,
            default: 3
        },
        downloadWindowHours: {
            type: Number,
            default: 24
        },
        downloadExpiry: {
            type: Date,
            default: function() {
                const expiry = new Date(this.purchasedAt);
                expiry.setHours(expiry.getHours() + 24);
                return expiry;
            }
        },
        devicesUsed: [{
            deviceId: String,
            userAgent: String,
            ipAddress: String,
            downloadedAt: Date
        }]
    },

    lastDownloadedAt: {
        type: Date
    },
    purchasedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to check if download is allowed
purchaseSchema.methods.canDownload = function() {
    const now = new Date();
    
    // Check if download window expired
    if (now > this.downloadTracking.downloadExpiry) {
        return {
            allowed: false,
            reason: 'download_window_expired',
            message: 'Download window has expired (24 hours from purchase)'
        };
    }
    
    // Check if max downloads reached
    if (this.downloadTracking.downloadsUsed >= this.downloadTracking.maxDownloads) {
        return {
            allowed: false,
            reason: 'max_downloads_reached',
            message: `Maximum downloads reached (${this.downloadTracking.maxDownloads})`,
            remaining: 0
        };
    }
    
    return {
        allowed: true,
        remaining: this.downloadTracking.maxDownloads - this.downloadTracking.downloadsUsed,
        expiresAt: this.downloadTracking.downloadExpiry
    };
};

// Method to register a download
purchaseSchema.methods.registerDownload = function(deviceInfo = {}) {
    this.downloadTracking.downloadsUsed += 1;
    
    if (deviceInfo) {
        this.downloadTracking.devicesUsed.push({
            deviceId: deviceInfo.deviceId,
            userAgent: deviceInfo.userAgent,
            ipAddress: deviceInfo.ipAddress,
            downloadedAt: new Date()
        });
    }
    
    return this.save();
};

// Compound index to prevent duplicate purchases (user can't buy same book twice)
purchaseSchema.index({ user: 1, book: 1 }, { unique: true });

// Index for faster queries
purchaseSchema.index({ user: 1, purchasedAt: -1 });
purchaseSchema.index({ simulatedOrderId: 1 });

// Generate a simulated order ID before saving
purchaseSchema.pre('save', function(next) {
    if (!this.simulatedOrderId) {
        this.simulatedOrderId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;