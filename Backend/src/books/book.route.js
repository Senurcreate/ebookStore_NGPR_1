// src/books/book.route.js
const express = require('express');
const router = express.Router();
const bookController = require('./book.controller');
const { verifyFirebaseToken } = require('../middleware/firebase.middleware'); // Assuming you have this imported

// frontend => backend server => controller => book schema  => database => send to server => back to the frontend

// --- PUBLIC ROUTES (No Token Required) ---
// Anyone should be able to see the list of books
router.get('/type/:type', bookController.getBooksByType);
router.get('/filters', bookController.getFilterOptions);
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);


// --- PROTECTED ROUTES (Token Required) ---
router.use(verifyFirebaseToken);

router.post('/create-book', bookController.createBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), bookController.uploadFile);

module.exports = router;