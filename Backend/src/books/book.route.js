// src/books/book.route.js
const express = require('express');
const router = express.Router();
const bookController = require('./book.controller');
const { verifyFirebaseToken } = require('../middleware/firebase.middleware'); // Assuming you have this imported


// frontend => backend server => controller => book schema  => database => send to server => back to the frontend

// --- 🔓 PUBLIC ROUTES (No Token Required) ---
// Anyone should be able to see the list of books
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);

// --- 🔒 PROTECTED ROUTES (Token Required) ---
// Apply middleware only to routes below this line
router.use(verifyFirebaseToken);

router.post('/create-book', bookController.createBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

// Note: If you have an upload route, that usually needs protection too
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), bookController.uploadFile);

module.exports = router;