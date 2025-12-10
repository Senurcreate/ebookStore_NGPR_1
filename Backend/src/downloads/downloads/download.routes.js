const express = require('express');
const router = express.Router();
const downloadController = require('./download.controller');
// Use the correct firebase middleware
const { verifyFirebaseToken } = require('../middleware/firebase.middleware');
const Book = require('../books/book.model');

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);

// Download a book
router.post('/:bookId', downloadController.downloadBook);

// Get download history
router.get('/history', downloadController.getDownloadHistory);

// Get download statistics
router.get('/stats', downloadController.getDownloadStats);

// Clear download history (optional)
router.delete('/history', downloadController.clearDownloadHistory);

// Get book preview (first 20 pages)
router.get('/:bookId/preview', downloadController.getBookPreview);

// Get audiobook preview 
router.get('/:bookId/preview', downloadController.getAudioPreview);

// Check download eligibility
router.get('/:bookId/check-eligibility', downloadController.checkDownloadRestrictions);

module.exports = router;


 

    
    