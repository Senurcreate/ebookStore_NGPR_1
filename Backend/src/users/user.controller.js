const User = require('./user.model');
const Wishlist = require('../wishlist/wishlist.model');
const Purchase = require('../purchases/purchase.model');
const DownloadHistory = require('../downloads/download.model');
const { auth } = require('../config/firebase.config');
const mongoose = require('mongoose');

/**
 * @desc    Get current user profile with stats
 * @route   GET /api/users/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-__v -updatedAt -firebaseUID -disabled')
      .populate('wishlistCount')
      .populate('purchaseCount')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional stats
    const [purchaseStats, downloadStats, wishlistCount] = await Promise.all([
      Purchase.aggregate([
        { $match: { user: req.user._id, status: 'completed' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]),
      DownloadHistory.countDocuments({ user: req.user._id }),
      Wishlist.countDocuments({ user: req.user._id })
    ]);

    // Add stats to user object
    user.stats = {
      purchases: purchaseStats[0] || { count: 0, total: 0 },
      downloads: downloadStats,
      wishlist: wishlistCount,
      readingHistory: user.readingHistory?.length || 0
    };

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    console.log("---------------------------------------");
    console.log("1. BACKEND: updateProfile called");
    console.log("2. RECEIVED BODY:", req.body);

    const updates = {};
    const allowedFields = ['displayName', 'photoURL', 'phoneNumber', 'preferences', 'isPremium', 'email'];
    
    // 1. Filter allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    console.log("3. FILTERED UPDATES:", updates); // <--- CHECK THIS LOG

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    // 2. Sync with Firebase
    if (auth) {
      const firebaseUpdates = {};
      
      if (updates.email && updates.email !== req.user.email) {
        firebaseUpdates.email = updates.email;
        updates.emailVerified = false; 
      }
      
      // Explicitly check for displayName
      if (updates.displayName) {
        firebaseUpdates.displayName = updates.displayName;
      }

      if (updates.photoURL) {
        firebaseUpdates.photoURL = updates.photoURL;
      }

      if (Object.keys(firebaseUpdates).length > 0) {
        try {
          await auth.updateUser(req.user.firebaseUID, firebaseUpdates);
          console.log("4. Firebase Updated Successfully");
        } catch (firebaseError) {
          console.error('Firebase Error (Non-fatal):', firebaseError);
          // Don't stop execution here, try to save to MongoDB anyway
        }
      }
    }

    // 3. Update MongoDB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-firebaseUID -__v -updatedAt -disabled');

    console.log("5. MongoDB Updated:", user.displayName); 

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
};
/**
 * @desc    Get user's reading history
 * @route   GET /api/users/me/reading-history
 * @access  Private
 */
const getReadingHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('readingHistory.book', 'title author coverImage type pages')
      .select('readingHistory');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sort by last read date (newest first)
    const sortedHistory = user.readingHistory.sort(
      (a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt)
    );

    res.status(200).json({
      success: true,
      data: sortedHistory
    });
  } catch (error) {
    console.error('Error fetching reading history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reading history',
      error: error.message
    });
  }
};

/**
 * @desc    Add book to reading history
 * @route   POST /api/users/me/reading-history
 * @access  Private
 */
const addToReadingHistory = async (req, res) => {
  try {
    const { bookId, progress } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if book already in reading history
    const existingIndex = user.readingHistory.findIndex(
      item => item.book && item.book.toString() === bookId
    );

    if (existingIndex > -1) {
      // Update existing entry
      user.readingHistory[existingIndex].lastReadAt = new Date();
      user.readingHistory[existingIndex].progress = progress || 
        user.readingHistory[existingIndex].progress;
    } else {
      // Add new entry
      user.readingHistory.push({
        book: bookId,
        progress: progress || 0,
        lastReadAt: new Date()
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Reading history updated',
      readingHistory: user.readingHistory
    });
  } catch (error) {
    console.error('Error updating reading history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reading history',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's dashboard stats
 * @route   GET /api/users/me/stats
 * @access  Private
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [purchaseStats, downloadStats, wishlistCount, readingHistoryCount] = await Promise.all([
            // Purchase stats
            Purchase.aggregate([
                { $match: { user: userId, status: 'completed' } },
                {
                    $lookup: {
                        from: 'books',
                        localField: 'book',
                        foreignField: '_id',
                        as: 'bookDetails'
                    }
                },
                { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
                { 
                    $group: { 
                        _id: null, 
                        count: { $sum: 1 }, 
                        totalSpent: { $sum: '$amount' },
                        averagePurchase: { $avg: '$amount' },
                        ebookPurchases: {
                            $sum: {
                                $cond: [
                                    { $and: [
                                        { $eq: ['$bookDetails.type', 'ebook'] },
                                        { $ifNull: ['$bookDetails.type', false] }
                                    ]},
                                    1,
                                    0
                                ]
                            }
                        },
                        audiobookPurchases: {
                            $sum: {
                                $cond: [
                                    { $and: [
                                        { $eq: ['$bookDetails.type', 'audiobook'] },
                                        { $ifNull: ['$bookDetails.type', false] }
                                    ]},
                                    1,
                                    0
                                ]
                            }
                        }
                    } 
                }
            ]),
            // Download stats
            DownloadHistory.aggregate([
                { $match: { user: userId } },
                {
                    $lookup: {
                        from: 'books',
                        localField: 'book',
                        foreignField: '_id',
                        as: 'bookDetails'
                    }
                },
                { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
                { 
                    $group: { 
                        _id: null, 
                        total: { $sum: 1 },
                        free: { $sum: { $cond: [{ $eq: ['$downloadType', 'free'] }, 1, 0] } },
                        purchased: { $sum: { $cond: [{ $eq: ['$downloadType', 'purchased'] }, 1, 0] } },
                        ebookDownloads: {
                            $sum: {
                                $cond: [
                                    { $and: [
                                        { $eq: ['$bookDetails.type', 'ebook'] },
                                        { $ifNull: ['$bookDetails.type', false] }
                                    ]},
                                    1,
                                    0
                                ]
                            }
                        },
                        audiobookDownloads: {
                            $sum: {
                                $cond: [
                                    { $and: [
                                        { $eq: ['$bookDetails.type', 'audiobook'] },
                                        { $ifNull: ['$bookDetails.type', false] }
                                    ]},
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]),
            // Wishlist count
            Wishlist.countDocuments({ user: userId }),
            // Reading history count
            User.findById(userId).select('readingHistory').then(user => user ? user.readingHistory.length : 0)
        ]);

        // Recent downloads (last 5)
        const recentDownloads = await DownloadHistory.find({ user: userId })
            .populate('book', 'title author coverImage type pages audioLength')
            .sort({ downloadedAt: -1 })
            .limit(5);

        // Recent purchases (last 5)
        const recentPurchases = await Purchase.find({ user: userId, status: 'completed' })
            .populate('book', 'title author coverImage price type')
            .sort({ purchasedAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                purchases: purchaseStats[0] || { 
                    count: 0, 
                    totalSpent: 0, 
                    averagePurchase: 0,
                    ebookPurchases: 0,
                    audiobookPurchases: 0 
                },
                downloads: downloadStats[0] || { 
                    total: 0, 
                    free: 0, 
                    purchased: 0,
                    ebookDownloads: 0,
                    audiobookDownloads: 0 
                },
                wishlist: wishlistCount,
                readingHistory: readingHistoryCount,
                recentDownloads,
                recentPurchases
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: error.message
        });
    }
};

/**
 * @desc    Update user preferences
 * @route   PATCH /api/users/me/preferences
 * @access  Private
 */
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferences data'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's purchase history (alternative to dedicated purchase API)
 * @route   GET /api/users/me/purchases
 * @access  Private
 */
const getUserPurchases = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      Purchase.find({ user: req.user._id })
        .populate('book', 'title author coverImage price type')
        .sort({ purchasedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Purchase.countDocuments({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: (skip + limit) < total,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases',
      error: error.message
    });
  }
};

/**
 * @desc    Get user's download history (alternative to dedicated download API)
 * @route   GET /api/users/me/download-history
 * @access  Private
 */
const getUserDownloadHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [downloads, total] = await Promise.all([
      DownloadHistory.find({ user: req.user._id })
        .populate('book', 'title author coverImage type')
        .populate('purchase', 'amount purchasedAt')
        .sort({ downloadedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DownloadHistory.countDocuments({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: downloads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: (skip + limit) < total,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching download history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch download history',
      error: error.message
    });
  }
};


/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const usersRaw = await User.find(query)
      .select('-firebaseUID -__v -updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    
    // 2. NEW STEP: Calculate Total Spent for each user
    const users = await Promise.all(usersRaw.map(async (user) => {
        const purchases = await Purchase.find({ user: user._id });
        const totalSpent = purchases.reduce((acc, purchase) => {
            return acc + (purchase.totalAmount || 0);
        }, 0);

        return { ...user, totalSpent };
    }));
    

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: (skip + parseInt(limit)) < total,
        hasPrevious: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-firebaseUID -__v')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete from Firebase if available
    if (auth) {
      try {
        await auth.deleteUser(user.firebaseUID);
      } catch (firebaseError) {
        console.error('Error deleting Firebase user:', firebaseError);
      }
    }

    // Delete from MongoDB
    await User.findByIdAndDelete(id);

    // Clean up user's wishlist
    await Wishlist.deleteMany({ user: id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

/**
 * @desc    Change User Password
 * @route   PATCH /api/users/me/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user._id;
    const firebaseUid = req.user.firebaseUID;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // 1. Update Password in Firebase (This handles the actual login auth)
    if (auth) {
      await auth.updateUser(firebaseUid, {
        password: newPassword
      });
    } else {
      throw new Error("Firebase Auth service not initialized");
    }

    // 2. Update User in MongoDB (Update timestamp/metadata)
    // We do NOT store the password text in Mongo if using Firebase
    await User.findByIdAndUpdate(userId, {
      $set: { 
        // You could add a field like 'passwordLastChangedAt' to your schema if you wanted
        updatedAt: new Date() 
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
};

const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Delete from MongoDB
    await User.findByIdAndDelete(userId);
    
    // 2. Optional: Delete related data (Wishlists, etc.)
    const Wishlist = require('../wishlist/wishlist.model'); // Adjust path if needed
    if (Wishlist) {
        await Wishlist.deleteMany({ user: userId });
    }

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully from database'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Server error during deletion' });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  getReadingHistory,
  addToReadingHistory,
  getUserStats,
  updatePreferences,
  getUserPurchases,
  getUserDownloadHistory,
  getAllUsers,
  getUserById,
  deleteUser,
  changePassword,
  deleteMyAccount
};