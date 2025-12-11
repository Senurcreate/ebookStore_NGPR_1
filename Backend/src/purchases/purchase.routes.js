const express = require('express');
const router = express.Router();
const purchaseController = require('./purchase.controller');
// Use the correct firebase middleware
const { verifyFirebaseToken } = require('../middleware/firebase.middleware');

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);

// Simulate a purchase
router.post('/simulate', purchaseController.simulatePurchase);

// Get purchase history
router.get('/history', purchaseController.getPurchaseHistory);

// Get purchase statistics
router.get('/stats', purchaseController.getPurchaseStats);

// Check if book is purchased
router.get('/check/:bookId', purchaseController.checkBookPurchase);

// Get specific purchase
router.get('/:id', purchaseController.getPurchaseById);

// Get purchase type
router.get('/:type', purchaseController.getPurchasesByType);

// Cancel purchase (simulation)
router.patch('/:id/cancel', purchaseController.cancelPurchase);



module.exports = router;