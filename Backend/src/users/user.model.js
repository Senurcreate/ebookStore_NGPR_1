// src/users/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    }
  },
  readingHistory: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  
  lastLoginAt: {
    type: Date
  },
  // ADD: Additional useful fields
  accountCreatedAt: {
    type: Date,
    default: Date.now
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.firebaseUID;
      delete ret.disabled;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Compound index for common queries
userSchema.index({ email: 1, role: 1 });
userSchema.index({ lastLoginAt: -1 });

// Virtual for formatted createdAt
userSchema.virtual('joinedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for wishlist count (will be populated when needed)
userSchema.virtual('wishlistCount', {
  ref: 'Wishlist',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Virtual for purchase count
userSchema.virtual('purchaseCount', {
  ref: 'Purchase',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Virtual for total spent
userSchema.virtual('totalSpent', {
  ref: 'Purchase',
  localField: '_id',
  foreignField: 'user',
  options: { match: { status: 'completed' } }
});

// Methods
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.firebaseUID;
  delete user.disabled;
  delete user.__v;
  return user;
};

userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Static method to get user stats
userSchema.statics.getUserStats = async function(userId) {
  const Purchase = require('../purchases/purchase.model');
  const DownloadHistory = require('../downloads/download.model');
  const Wishlist = require('../wishlist/wishlist.model');
  
  const [purchaseStats, downloadStats, wishlistCount] = await Promise.all([
    Purchase.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId), status: 'completed' } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]),
    DownloadHistory.countDocuments({ user: userId }),
    Wishlist.countDocuments({ user: userId })
  ]);
  
  return {
    purchases: purchaseStats[0] || { count: 0, total: 0 },
    downloads: downloadStats,
    wishlist: wishlistCount
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;