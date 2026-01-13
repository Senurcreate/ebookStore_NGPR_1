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
    bookInfo: {
        title: String,
        author: String,
        price: Number,
        type: { type: String, enum: ['ebook', 'audiobook'] },
        coverImage: String
    },
    // For simulation - generate a fake price
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
            type: Date
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

// This runs automatically BEFORE saving to the database.
// It guarantees 'purchasedAt' exists before calculating expiry.
purchaseSchema.pre('save', function(next) {
    // Generate Order ID if missing
    if (!this.simulatedOrderId) {
        this.simulatedOrderId = `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Set PurchasedAt if missing
    if (!this.purchasedAt) {
        this.purchasedAt = new Date();
    }

    // Calculate Download Expiry
    // If it's a new record OR expiry hasn't been set yet
    if (!this.downloadTracking.downloadExpiry) {
        const hours = this.downloadTracking.downloadWindowHours || 24;
        
        // Create a FRESH date object based on purchasedAt
        const expiryDate = new Date(this.purchasedAt.getTime());
        
        // Add hours
        expiryDate.setHours(expiryDate.getHours() + hours);
        
        this.downloadTracking.downloadExpiry = expiryDate;
    }

    next();
});

// Method to check if download is allowed
purchaseSchema.methods.canDownload = function() {
    const now = new Date();
    
    // Check if download window expired
    if (this.status === 'completed') {
        return {
            allowed: true,
            remaining: 'Unlimited',
            expiresAt: null
        };
    }
    
    return {
        allowed: false,
        reason: 'payment_pending',
        message: 'Payment not completed'
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