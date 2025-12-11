const express = require('express');
const router = express.Router();
const wishlistController = require('./wishlist.controller');
const { verifyFirebaseToken } = require('../middleware/firebase.middleware');


// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);

// Add book to wishlist
router.post('/add', wishlistController.addToWishlist);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Check if book is in wishlist
router.get('/check/:bookId', wishlistController.checkInWishlist);

// Get wishlist statistics
router.get('/stats', wishlistController.getWishlistStats);

// Update wishlist item
router.patch('/:id', wishlistController.updateWishlistItem);

// Remove from wishlist by wishlist item ID
router.delete('/:id', wishlistController.removeFromWishlist);

// Remove from wishlist by book ID
router.delete('/book/:bookId', wishlistController.removeByBookId);

// Clear entire wishlist
router.delete('/', wishlistController.clearWishlist);

module.exports = router;