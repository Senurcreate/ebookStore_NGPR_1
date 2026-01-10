const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    publisher: {
        type: String,
        required: true,
        trim: true
    },
    publication_date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: String,
        required: true,
        trim: true,
        default: 'English'
    },
    isbn: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    trending: {
        type: Boolean,
        default: false
    },
    coverImage: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Allow both Cloudinary URLs and Goodreads URLs
                if (v.startsWith('http')) { 
                    return true;
                }
                return false;
            },
            message: 'Cover image must be a valid Cloudinary or Goodreads URL'
        }
    },
    type: {
        type: String,
        enum: ["ebook", "audiobook"],
        default: "ebook"
    },
    
    // Conditional fields based on type
    // For ebooks
    pages: {
        type: Number,
        min: 1,
        // Required only for ebooks
        required: function() {
            return this.type === 'ebook';
        }
    },
    
    // For audiobooks
    audioLength: {
        type: String,
        // Format: "HH:MM:SS" or "MM:SS"
        trim: true,
        // Required only for audiobooks
        required: function() {
            return this.type === 'audiobook';
        },
        validate: {
            validator: function(v) {
                if (!v || this.type !== 'audiobook') return true;
                // Validate time format (HH:MM:SS or MM:SS)
                const timePattern = /^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/;
                return timePattern.test(v);
            },
            message: 'Audio length must be in format HH:MM:SS or MM:SS'
        }
    },
    
    narrators: {
        type: [{
            name: {
                type: String,
                required: true,
                trim: true
            }
        }],
        // Required only for audiobooks
        required: function() {
            return this.type === 'audiobook';
        },
        default: undefined,
        validate: {
            validator: function(v) {
                if (this.type !== 'audiobook') return true;
                return Array.isArray(v) && v.length > 0;
            },
            message: 'At least one narrator is required for audiobooks'
        }
    },
    
    // Audio sample file (separate from main audio file)
    audioSampleCloudinaryUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v || this.type !== 'audiobook') return true;
                return v.startsWith('https://res.cloudinary.com/');
            },
            message: 'Please provide a valid Cloudinary URL for audio sample'
        }
    },
    
    // Main file (ebook or audiobook) stored in Cloudinary
    cloudinaryUrl: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return v.startsWith('https://res.cloudinary.com/');
            },
            message: 'Please provide a valid Cloudinary URL'
        }
    },
    
    // Cloudinary specific fields
    cloudinaryInfo: {
        publicId: {
            type: String,
            default: null
        },
        resourceType: {
            type: String,
            enum: ['image', 'video', 'raw', 'auto'],
            default: 'auto'
        },
        format: {
            type: String,
            default: null
        },
        secureUrl: {
            type: String,
            default: null
        },
        bytes: {
            type: Number,
            default: 0
        },
        duration: {
            type: Number,
            default: 0 // For audiobooks/videos
        }
    }, 

    // Auto-calculated fields (populated by pre-save middleware)
    fileInfo: {
        fileId: {
            type: String,
            default: null
        },
        downloadUrl: {
            type: String,
            default: null
        },
        previewUrl: {
            type: String,
            default: null
        },
        embedCode: {
            type: String,
            default: null
        }
    },
    
    // Download restrictions
    downloadPolicy: {
        maxDownloads: {
            type: Number,
            default: function() {
                return this.price > 0 ? 3 : 1;
            },
            min: 1
        },
        validityHours: {
            type: Number,
            default: 24,
            min: 1,
            max: 168 // 1 week max
        },
        allowMultipleDevices: {
            type: Boolean,
            default: true
        }
    },
    
    // Preview settings - different for ebooks vs audiobooks
    preview: {
        enabled: {
            type: Boolean,
            default: true
        },
        // For ebooks
        pages: {
            type: Number,
            default: 20,
            min: 1,
            max: 50
        },
        // For audiobooks - sample length in minutes
        sampleMinutes: {
            type: Number,
            default: 5,
            min: 1,
            max: 30 // Max 30 minutes sample
        },
        note: {
            type: String,
            default: function() {
                if (this.type === 'ebook') {
                    return 'First 20 pages available in preview';
                } else if (this.type === 'audiobook') {
                    return '5 minute sample available';
                }
                return 'Preview available';
            }
        }
    },

    price: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    
    // Rating statistics
    ratingStats: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
            set: v => parseFloat(v.toFixed(1))
        },
        count: {
            type: Number,
            default: 0
        },
        distribution: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 }
        }
    },
    
    // Additional metadata
    fileSize: {
        type: Number,
        default: function() {
            return this.cloudinaryInfo.bytes || 0;
        }
    },
    fileFormat: {
        type: String,
        default: function() {
            if (this.type === 'ebook') return 'PDF';
            if (this.type === 'audiobook') return 'MP3';
            return this.cloudinaryInfo.format || 'Unknown';
        }
    },
    
    // For audiobook quality/bitrate
    audioQuality: {
        type: String,
        enum: ['Standard', 'High', 'Lossless'],
        default: 'Standard'
    },
    // Cloudinary folder for organization
    cloudinaryFolder: {
        type: String,
        default: function() {
            if (this.type === 'ebook') return 'ebooks';
            if (this.type === 'audiobook') return 'audiobooks';
            return 'books';
        }
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1, type: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ 'ratingStats.average': -1 });
bookSchema.index({ trending: -1, createdAt: -1 });
bookSchema.index({ type: 1, createdAt: -1 });
bookSchema.index({ narrators: 1 });

// Virtual for formatted publication date
bookSchema.virtual('formattedPublicationDate').get(function() {
    if (!this.publication_date) return 'Unknown';
    const date = new Date(this.publication_date);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Virtual for price display
bookSchema.virtual('priceDisplay').get(function() {
    if (this.price === undefined || this.price === null) return '$0.00';
    if (this.price === 0) return 'Free';
    return `$${this.price.toFixed(2)}`;
});

// Virtual for isPremium
bookSchema.virtual('isPremium').get(function() {
    return (this.price || 0) > 0;
});

// Virtual for narrators list as string
bookSchema.virtual('narratorsList').get(function() {
    if (!this.narrators || !Array.isArray(this.narrators) || this.narrators.length === 0) return '';
    return this.narrators.map(n => n.name).join(', ');
});

// Virtual for formatted audio length (e.g., "2 hours 15 minutes")
bookSchema.virtual('formattedAudioLength').get(function() {
    if (this.type !== 'audiobook' || !this.audioLength) return '';
    
    const parts = this.audioLength.split(':').map(Number);
     if (parts.some(isNaN)) return this.audioLength;
    
    let hours = 0, minutes = 0, seconds = 0;
    if (parts.length === 3) [hours, minutes, seconds] = parts;
    else if (parts.length === 2) [minutes, seconds] = parts;
    
    const res = [];
    if (hours > 0) res.push(`${hours} hr`);
    if (minutes > 0) res.push(`${minutes} min`);
    if (res.length === 0) return `${seconds} sec`;
    
    return res.join(' ');
});

// Virtual for formatted file size
bookSchema.virtual('formattedFileSize').get(function() {
    const bytes = this.fileSize || this.cloudinaryInfo?.bytes || 0;
    if (!bytes) return '0 B';
    
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
});

// Virtual for audio sample URL
bookSchema.virtual('audioSampleUrl').get(function() {
    if (this.type !== 'audiobook') return null;
    return this.audioSampleCloudinaryUrl || this.fileInfo?.downloadUrl || this.cloudinaryUrl || null;
});

// Virtual for audio embed code (for inline playback)
bookSchema.virtual('audioEmbedCode').get(function() {
    if (this.type !== 'audiobook') return null;
    const url = this.audioSampleUrl || this.cloudinaryUrl;
    if (!url) return null;
    
    return `<audio controls src="${url}" style="width:100%"></audio>`;
});

// Middleware to auto-populate fileInfo when cloudinaryUrl is set
bookSchema.pre('save', function(next) {
    // Update file info if cloudinaryUrl changed or fileInfo is empty
    if (this.isModified('cloudinaryUrl') || !this.fileInfo?.downloadUrl) {
        // For Cloudinary, the URL can be used directly as download URL
        this.fileInfo = {
            downloadUrl: this.cloudinaryUrl,
            previewUrl: this.cloudinaryUrl, // Same URL for preview
            embedCode: this.generateCloudinaryEmbedCode()
        };
        
        // Extract public ID from Cloudinary URL
        const urlMatch = this.cloudinaryUrl.match(/res\.cloudinary\.com\/[^\/]+\/(?:video|image|raw)\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
        if (urlMatch && !this.cloudinaryInfo.publicId) {
            this.cloudinaryInfo.publicId = urlMatch[1];
        }
    }
    
    // Ensure preview note is set based on type
    if (!this.preview.note || this.isModified('type') || 
        this.isModified('preview.pages') || this.isModified('preview.sampleMinutes')) {
        if (this.type === 'ebook') {
            this.preview.note = `First ${this.preview.pages || 20} pages available in preview`;
        } else if (this.type === 'audiobook') {
            this.preview.note = `${this.preview.sampleMinutes || 5} minute sample available`;
        }
    }
    
    // Clear type-specific fields if type changes
    if (this.isModified('type')) {
        if (this.type === 'ebook') {
            if (this.audioLength !== undefined) delete this.audioLength;
            if (this.narrators !== undefined) delete this.narrators;
            if (this.audioSampleCloudinaryUrl !== undefined) delete this.audioSampleCloudinaryUrl;
            if (this.audioQuality !== undefined) delete this.audioQuality;
        } else if (this.type === 'audiobook') {
            if (this.pages !== undefined) delete this.pages;
        }
    }
    
    // Set default file format based on type
    if (this.isModified('type')) {
        if (this.type === 'ebook') {
            this.fileFormat = 'PDF';
        } else if (this.type === 'audiobook') {
            this.fileFormat = 'MP3';
        }
    }
    
    next();
});



// Method to generate Cloudinary embed code
bookSchema.methods.generateCloudinaryEmbedCode = function() {
    if (this.type === 'audiobook') {
        return `
            <audio controls style="width: 100%;">
                <source src="${this.cloudinaryUrl}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
        `;
    } else if (this.type === 'ebook') {
        // For ebooks, we can embed PDF using iframe
        return `
            <iframe 
                src="${this.cloudinaryUrl}#view=fitH" 
                width="100%" 
                height="600px" 
                frameborder="0"
                style="border: 1px solid #ddd;">
            </iframe>
        `;
    }
    return null;
};

// Method to get preview content based on type
bookSchema.methods.getPreviewContent = function() {
    if (!this.preview.enabled) {
        return {
            available: false,
            message: 'Preview not available for this book'
        };
    }
    
    if (this.type === 'ebook') {
        return {
            available: true,
            type: 'ebook',
            format: this.fileFormat,
            content: {
                previewUrl: this.fileInfo?.previewUrl,
                pages: this.preview.pages,
                note: this.preview.note
            }
        };
    } else if (this.type === 'audiobook') {
        return {
            available: true,
            type: 'audiobook',
            format: this.fileFormat,
            content: {
                sampleUrl: this.audioSampleUrl,
                durationMinutes: this.preview.sampleMinutes,
                note: this.preview.note,
                audioEmbedCode: this.audioEmbedCode,
                narrators: this.narratorsList,
                length: this.formattedAudioLength
            }
        };
    }
    
    return {
        available: false,
        message: 'Unknown book type'
    };
};

// Method to get download URL
bookSchema.methods.getDownloadInfo = function() {
    const baseInfo = {
        url: this.fileInfo?.downloadUrl,
        publicId: this.cloudinaryInfo.publicId,
        fileName: `${this.title.replace(/[^a-z0-9]/gi, '_')}.${this.fileFormat.toLowerCase()}`,
        type: this.type,
        format: this.fileFormat,
        size: this.formattedFileSize,
        cloudinaryUrl: this.cloudinaryUrl
    };
    
    if (this.type === 'audiobook') {
        baseInfo.audioLength = this.formattedAudioLength;
        baseInfo.quality = this.audioQuality;
    } else if (this.type === 'ebook') {
        baseInfo.pages = this.pages;
    }
    
    return baseInfo;
};


// Static method to find books by type
bookSchema.statics.findByType = function(type, query = {}) {
    return this.find({ ...query, type });
};

// Static method to find audiobooks by narrator
bookSchema.statics.findByNarrator = function(narratorName) {
    return this.find({
        type: 'audiobook',
        'narrators.name': { $regex: narratorName, $options: 'i' }
    });
};

// Static method to get statistics
bookSchema.statics.getTypeStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                avgPrice: { $avg: '$price' },
                freeCount: {
                    $sum: { $cond: [{ $eq: ['$price', 0] }, 1, 0] }
                },
                premiumCount: {
                    $sum: { $cond: [{ $gt: ['$price', 0] }, 1, 0] }
                },
                totalPages: {
                    $sum: {
                        $cond: [
                            { $and: [
                                { $eq: ['$type', 'ebook'] },
                                { $ifNull: ['$pages', false] }
                            ]},
                            '$pages',
                            0
                        ]
                    }
                },
                avgRating: { $avg: '$ratingStats.average' }
            }
        }
    ]);
    
    return stats.reduce((acc, stat) => {
        acc[stat._id] = stat;
        return acc;
    }, {});
};

bookSchema.statics.updateRatingStats = async function(bookId) {
    // Require Review here to avoid circular dependency
    const Review = require('../reviews/review.model'); 

    try {
        // Convert to String first to ensure safety, then to ObjectId
        const objectId = new mongoose.Types.ObjectId(String(bookId));

        const stats = await Review.aggregate([
            {
                $match: {
                    book: objectId, // Use the clean ObjectId
                    isHidden: { $ne: true }
                }
            },
            {
                $group: {
                    _id: '$book',
                    average: { $avg: '$rating' },
                    count: { $sum: 1 },
                    oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                    twoStar: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    threeStar: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    fourStar: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    fiveStar: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
                }
            }
        ]);

        let update = {};

        if (stats.length > 0) {
            update = {
                'ratingStats.average': Math.round(stats[0].average * 10) / 10,
                'ratingStats.count': stats[0].count,
                'ratingStats.distribution': {
                    1: stats[0].oneStar,
                    2: stats[0].twoStar,
                    3: stats[0].threeStar,
                    4: stats[0].fourStar,
                    5: stats[0].fiveStar
                }
            };
        } else {
            update = {
                'ratingStats.average': 0,
                'ratingStats.count': 0,
                'ratingStats.distribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        // Use findByIdAndUpdate to apply changes
        await this.findByIdAndUpdate(objectId, { $set: update });
        console.log(`✅ Rating updated for book ${objectId}: ${update['ratingStats.average']}`);

    } catch (error) {
        console.error("❌ Error updating rating stats:", error);
    }
};


/**
 * Check if a user is eligible to download this book
 * Returns object with canDownload (bool) and purchase details
 */
bookSchema.methods.checkDownloadEligibility = async function(userId) {
    // 1. If the book is free, anyone can download
    if (this.price === 0) {
        return { 
            canDownload: true, 
            reason: 'free',
            isFree: true
        };
    }

    // 2. If no user ID provided (not logged in) and book is not free
    if (!userId) {
        return { 
            canDownload: false, 
            reason: 'authentication_required',
            isFree: false
        };
    }

    // 3. Check for a COMPLETED purchase
    // We use mongoose.model to avoid circular dependency issues
    const Purchase = mongoose.model('Purchase');
    const purchase = await Purchase.findOne({
        user: userId,
        book: this._id,
        status: 'completed' // Crucial: Only completed transactions
    });

    if (purchase) {
        // 4. Check if the purchase allows downloading (limits/expiry)
        const downloadStatus = purchase.canDownload(); // Using the method from your Purchase model
        
        if (downloadStatus.allowed) {
            return { 
                canDownload: true, 
                reason: 'purchased',
                purchase: purchase,
                isFree: false
            };
        } else {
            return {
                canDownload: false,
                reason: downloadStatus.reason, // e.g., 'max_downloads_reached'
                message: downloadStatus.message
            };
        }
    }

    // 5. No purchase found
    return { 
        canDownload: false, 
        reason: 'purchase_required', 
        isFree: false
    };
};

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;