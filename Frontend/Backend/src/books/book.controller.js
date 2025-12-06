// src/books/book.controller.js
const Book = require('./book.model');

/**
 * Create a new book
 */
async function createBook(req, res) {
  try {
    //Normalize / copy body 
    const body = { ...(req.body || {}) };

    //Required fields (adjust to match your schema)
    const required = [
      'title',
      'author',
      'publisher',
      'publication_date', 
      'description',
      'genre',
      'language',
      'isbn',
      'trending',
      'coverImage',
      'fileUrl',
      'pages',
      'price'
    ];

    const missing = required.filter(f => body[f] === undefined || body[f] === '');
    if (missing.length) {
      return res.status(400).json({ message: 'Missing required fields', missing });
    }

    // Create & save
    const newBook = new Book(body);
    const savedBook = await newBook.save();

    console.log('Book saved:', savedBook._id);
    return res.status(201).json({ message: 'Book posted successfully', book: savedBook });
  } catch (error) {
    console.error('Error creating a book', error);

    if (error && error.name === 'ValidationError') {
      const errors = Object.keys(error.errors || {}).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    return res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
}

/**
 * Get all books (with optional query filters)
 */
async function getAllBooks(req, res) {
  try {
    const { genre, type, price } = req.query;
    let filter = {};

    if (genre) filter.genre = genre;
    if (type) filter.type = type;

    // Filter free or premium
    if (price === "0") filter.price = 0;              // free
    if (price === "premium") filter.price = { $gt: 0 }; // premium

    const books = await Book.find(filter).sort({ createdAt: -1 });

    return res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books', error);
    return res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
}


/**
 * Get a single book by id
 */
async function getBookById(req, res) {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book', error);
    return res.status(500).json({ message: 'Failed to fetch book', error: error.message });
  }
}

/**
 * Update a book by id
 */
async function updateBook(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const updated = await Book.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json({ message: 'Book updated', book: updated });
  } catch (error) {
    console.error('Error updating book', error);
    if (error && error.name === 'ValidationError') {
      const errors = Object.keys(error.errors || {}).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    return res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
}

/**
 * Delete a book by id
 */
async function deleteBook(req, res) {
  try {
    const { id } = req.params;
    const removed = await Book.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json({ message: 'Book deleted' });
  } catch (error) {
    console.error('Error deleting book', error);
    return res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
}

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook
};
