import { useCallback } from 'react';
import BookService from '../service/bookService';

export const useBooks = () => {
  const getAllBooks = useCallback(async (params = {}) => {
    try {
      return await BookService.getAllBooks(params);
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }, []);

  const getBookById = useCallback(async (id) => {
    try {
      return await BookService.getBookById(id);
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }, []);

  const createBook = useCallback(async (bookData) => {
    try {
      return await BookService.createBook(bookData);
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }, []);

  const updateBook = useCallback(async (id, bookData) => {
    try {
      return await BookService.updateBook(id, bookData);
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }, []);

  const deleteBook = useCallback(async (id) => {
    try {
      return await BookService.deleteBook(id);
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }, []);

  const searchBooks = useCallback(async (searchParams) => {
    try {
      return await BookService.searchBooks(searchParams);
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }, []);

  const checkDownloadPermission = useCallback(async (bookId) => {
    try {
      return await BookService.checkDownloadPermission(bookId);
    } catch (error) {
      console.error('Error checking download permission:', error);
      throw error;
    }
  }, []);

  return {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    checkDownloadPermission,
  };
};