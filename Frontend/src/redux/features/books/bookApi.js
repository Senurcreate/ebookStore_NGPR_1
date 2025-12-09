// src/redux/api/bookApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL
const BASE_URL = 'http://localhost:3000/api/books';

// Create base query with headers
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from state (assuming you have auth slice)
    const token = getState()?.auth?.token;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Book types interface
export const bookTypes = {
  EBOOK: 'ebook',
  AUDIOBOOK: 'audiobook'
};

// Tag types for cache invalidation
export const bookApiTags = {
  BOOKS: 'Books',
  BOOK: 'Book',
  AUDIOBOOKS: 'Audiobooks',
  EBOOKS: 'Ebooks',
  STATS: 'Stats',
  SEARCH: 'Search'
};

// Create the API
export const bookApi = createApi({
  reducerPath: 'bookApi',
  baseQuery,
  tagTypes: Object.values(bookApiTags),
  endpoints: (builder) => ({
    // Get all books with filters
    getBooks: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          limit = 20,
          genre,
          type,
          price,
          author,
          language,
          trending,
          search,
          narrator,
          sortBy = 'createdAt',
          sortOrder = 'desc'
        } = params;
        
        let queryString = `?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        
        if (genre) queryString += `&genre=${genre}`;
        if (type) queryString += `&type=${type}`;
        if (price) queryString += `&price=${price}`;
        if (author) queryString += `&author=${author}`;
        if (language) queryString += `&language=${language}`;
        if (trending) queryString += `&trending=${trending}`;
        if (search) queryString += `&search=${encodeURIComponent(search)}`;
        if (narrator) queryString += `&narrator=${encodeURIComponent(narrator)}`;
        
        return {
          url: queryString,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: bookApiTags.BOOK, id: _id })),
              bookApiTags.BOOKS,
            ]
          : [bookApiTags.BOOKS],
      transformResponse: (response) => ({
        books: response.data,
        pagination: response.pagination,
        filters: response.filters,
        typeStats: response.typeStats
      }),
    }),

    // Get single book by ID
    getBookById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: bookApiTags.BOOK, id }],
    }),

    // Create a new book
    createBook: builder.mutation({
      query: (bookData) => {
        // Prepare form data for file uploads
        const formData = new FormData();
        
        // Add all book data
        Object.keys(bookData).forEach(key => {
          if (key === 'coverImage' || key === 'driveUrl' || key === 'audioSampleDriveUrl') {
            // Handle files separately
            return;
          }
          
          if (key === 'narrators' && Array.isArray(bookData[key])) {
            formData.append(key, JSON.stringify(bookData[key]));
          } else if (key === 'preview') {
            formData.append(key, JSON.stringify(bookData[key]));
          } else if (key === 'downloadPolicy') {
            formData.append(key, JSON.stringify(bookData[key]));
          } else {
            formData.append(key, bookData[key]);
          }
        });
        
        // Add files
        if (bookData.coverImage instanceof File) {
          formData.append('coverImage', bookData.coverImage);
        }
        
        if (bookData.driveUrl instanceof File) {
          formData.append('driveUrl', bookData.driveUrl);
        }
        
        if (bookData.audioSampleDriveUrl instanceof File) {
          formData.append('audioSampleDriveUrl', bookData.audioSampleDriveUrl);
        }
        
        return {
          url: '/create-book',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [bookApiTags.BOOKS, bookApiTags.STATS],
    }),

    // Update book
    updateBook: builder.mutation({
      query: ({ id, ...updates }) => {
        const formData = new FormData();
        
        Object.keys(updates).forEach(key => {
          if (key === 'coverImage' || key === 'driveUrl' || key === 'audioSampleDriveUrl') {
            // Handle files separately
            return;
          }
          
          if (key === 'narrators' && Array.isArray(updates[key])) {
            formData.append(key, JSON.stringify(updates[key]));
          } else if (key === 'preview') {
            formData.append(key, JSON.stringify(updates[key]));
          } else if (key === 'downloadPolicy') {
            formData.append(key, JSON.stringify(updates[key]));
          } else {
            formData.append(key, updates[key]);
          }
        });
        
        // Add files if provided
        if (updates.coverImage instanceof File) {
          formData.append('coverImage', updates.coverImage);
        }
        
        if (updates.driveUrl instanceof File) {
          formData.append('driveUrl', updates.driveUrl);
        }
        
        if (updates.audioSampleDriveUrl instanceof File) {
          formData.append('audioSampleDriveUrl', updates.audioSampleDriveUrl);
        }
        
        return {
          url: `/${id}`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: bookApiTags.BOOK, id },
        bookApiTags.BOOKS,
        bookApiTags.STATS,
      ],
    }),

    // Delete book
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [bookApiTags.BOOKS, bookApiTags.STATS],
    }),

    // Check download permission
    checkDownloadPermission: builder.query({
      query: (id) => ({
        url: `/${id}/download-permission`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: bookApiTags.BOOK, id }],
    }),

    // Get book statistics
    getBookStats: builder.query({
      query: () => ({
        url: '/stats',
        method: 'GET',
      }),
      providesTags: [bookApiTags.STATS],
    }),

    // Search books
    searchBooks: builder.query({
      query: (params = {}) => {
        const {
          q = '',
          page = 1,
          limit = 20,
          genre,
          author,
          narrator,
          minPrice,
          maxPrice,
          type,
          language,
          minPages,
          maxPages
        } = params;
        
        let queryString = `?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`;
        
        if (genre) queryString += `&genre=${genre}`;
        if (author) queryString += `&author=${encodeURIComponent(author)}`;
        if (narrator) queryString += `&narrator=${encodeURIComponent(narrator)}`;
        if (minPrice) queryString += `&minPrice=${minPrice}`;
        if (maxPrice) queryString += `&maxPrice=${maxPrice}`;
        if (type) queryString += `&type=${type}`;
        if (language) queryString += `&language=${language}`;
        if (minPages) queryString += `&minPages=${minPages}`;
        if (maxPages) queryString += `&maxPages=${maxPages}`;
        
        return {
          url: `/search${queryString}`,
          method: 'GET',
        };
      },
      providesTags: [bookApiTags.SEARCH],
      transformResponse: (response) => ({
        books: response.data,
        pagination: response.pagination,
      }),
    }),

    // Get audiobooks by narrator
    getAudiobooksByNarrator: builder.query({
      query: ({ narrator, page = 1, limit = 20 }) => ({
        url: `/narrator/${encodeURIComponent(narrator)}?page=${page}&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: [bookApiTags.AUDIOBOOKS],
      transformResponse: (response) => ({
        narrator: response.narrator,
        stats: response.stats,
        audiobooks: response.audiobooks,
        pagination: response.pagination,
      }),
    }),

    // Get books by type
    getBooksByType: builder.query({
      query: ({ type, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }) => ({
        url: `/type/${type}?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        method: 'GET',
      }),
      providesTags: (result, error, { type }) => [
        { type: type === bookTypes.AUDIOBOOK ? bookApiTags.AUDIOBOOKS : bookApiTags.EBOOKS }
      ],
    }),

    // Download book file
    downloadBook: builder.mutation({
      query: (id) => ({
        url: `/${id}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get book preview
    getBookPreview: builder.query({
      query: (id) => ({
        url: `/${id}/preview`,
        method: 'GET',
      }),
    }),

    // Mark book as trending
    markAsTrending: builder.mutation({
      query: (id) => ({
        url: `/${id}/trending`,
        method: 'PATCH',
        body: { trending: true },
      }),
      invalidatesTags: (result, error, id) => [
        { type: bookApiTags.BOOK, id },
        bookApiTags.BOOKS,
      ],
    }),

    // Remove from trending
    removeFromTrending: builder.mutation({
      query: (id) => ({
        url: `/${id}/trending`,
        method: 'PATCH',
        body: { trending: false },
      }),
      invalidatesTags: (result, error, id) => [
        { type: bookApiTags.BOOK, id },
        bookApiTags.BOOKS,
      ],
    }),

    // Update book rating (when user submits a review)
    updateBookRating: builder.mutation({
      query: (id) => ({
        url: `/${id}/update-rating`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: bookApiTags.BOOK, id },
        bookApiTags.BOOKS,
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useCheckDownloadPermissionQuery,
  useGetBookStatsQuery,
  useSearchBooksQuery,
  useGetAudiobooksByNarratorQuery,
  useGetBooksByTypeQuery,
  useDownloadBookMutation,
  useGetBookPreviewQuery,
  useMarkAsTrendingMutation,
  useRemoveFromTrendingMutation,
  useUpdateBookRatingMutation,
} = bookApi;