import React, { createContext, useState, useContext, useCallback } from 'react';
import BookService from '../service/bookService';

const BookContext = createContext();

export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBookContext must be used within a BookProvider');
  }
  return context;
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  // Fetch all books
  const fetchBooks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookService.getAllBooks(params);
      setBooks(response.data);
      setPagination(response.pagination || {
        page: 1,
        limit: 20,
        total: response.data.length,
        pages: 1,
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single book
  const fetchBookById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookService.getBookById(id);
      setCurrentBook(response.book);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create book
  const createBook = useCallback(async (bookData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookService.createBook(bookData);
      setBooks(prev => [response.book, ...prev]);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update book
  const updateBook = useCallback(async (id, bookData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookService.updateBook(id, bookData);
      setBooks(prev => prev.map(book => 
        book._id === id ? response.book : book
      ));
      if (currentBook?._id === id) {
        setCurrentBook(response.book);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBook]);

  // Delete book
  const deleteBook = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookService.deleteBook(id);
      setBooks(prev => prev.filter(book => book._id !== id));
      if (currentBook?._id === id) {
        setCurrentBook(null);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBook]);

  // Search books
  const searchBooks = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await BookService.searchBooks(searchParams);
      setBooks(response.data);
      setPagination(response.pagination || {
        page: 1,
        limit: 20,
        total: response.data.length,
        pages: 1,
      });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear current book
  const clearCurrentBook = useCallback(() => {
    setCurrentBook(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    books,
    currentBook,
    loading,
    error,
    pagination,
    fetchBooks,
    fetchBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    clearCurrentBook,
    clearError,
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};