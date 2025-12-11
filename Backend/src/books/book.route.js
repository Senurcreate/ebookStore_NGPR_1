// src/books/book.route.js
const express = require('express');
const router = express.Router();
const bookController = require('./book.controller');

// frontend => backend server => controller => book schema  => database => send to server => back to the frontend

// Create
router.post('/create-book', bookController.createBook);

// Read all
router.get('/', bookController.getAllBooks);

// Read one
router.get('/:id', bookController.getBookById);

// Update
router.put('/:id', bookController.updateBook);    // or router.patch if partial updates

// Delete
router.delete('/:id', bookController.deleteBook);

module.exports = router;


