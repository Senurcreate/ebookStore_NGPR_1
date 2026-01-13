import React, { useEffect, useState } from "react";
import FilterSection from "./FilterSection";
import { useSearchParams } from "react-router-dom";
import BookGrid from "../../components/BookGrid";
import PaginationSection from "../../components/PaginationSection";
import { fetchBooks, fetchFilterOptions } from "../../services/book.service";

const ITEMS_PER_PAGE = 9;

const DEFAULT_FILTERS = {
  author: "Authors",
  genre: "Genres",
  price: "Prices",
  rating: "Ratings",
  language: "Languages",
};

const PRICE_OPTIONS = ["Prices", "Under Rs 500", "Rs 500 - Rs 1000", "Above Rs 1000", "Free"];
const RATING_OPTIONS = ["Ratings", "1 Stars", "2 Stars", "3 Stars", "4 Stars", "5 Stars"];

const BookPage = () => {
  const [searchParams] = useSearchParams();
  const activeSearch = searchParams.get("search");
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic Filter States
  const [authorOptions, setAuthorOptions] = useState(["Authors"]);
  const [genreOptions, setGenreOptions] = useState(["Genres"]);
  const [languageOptions, setLanguageOptions] = useState(["Languages"]);

  // Helper to format backend data for frontend components
  const formatBookData = (book) => ({
    ...book,
    id: book._id,
    image: book.coverImage || book.cloudinaryUrl || "https://img.freepik.com/free-vector/realistic-book-template-front-side_23-2147504375.jpg?t=st=1765781181~exp=1765784781~hmac=018dd9400eacd6dbe930b7a0a16f2dc85d1fc9fce0967270dd0bcba17c7a1e1e&w=1060",
    rating: book.ratingStats?.average || 0,
    price: Number(book.price)
  });

  // Load Dynamic Filter Options (Runs once on mount)
  useEffect(() => {
    const loadFilters = async () => {
      const data = await fetchFilterOptions();
      
      if (data) {
        setAuthorOptions(["Authors", ...data.authors]);
        setGenreOptions(["Genres", ...data.genres]);
        const formattedLanguages = data.languages.map(lang => 
        lang === "none" ? "Sinhala" : lang
      );
        setLanguageOptions(["Languages", ...formattedLanguages]);
      }
    };
    loadFilters();
  }, []);

  // Fetch Books (Runs when filters or page changes)
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Construct query parameters for the API
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          type: "ebook", 
          sortBy: "createdAt",
          sortOrder: "desc"
        };

        if (activeSearch) params.search = activeSearch;

        // Add filters to params if they are selected
        if (filters.genre !== "Genres") params.genre = filters.genre;
        if (filters.author !== "Authors") params.author = filters.author;
        if (filters.language !== "Languages") {
          params.language = filters.language === "Sinhala" ? "none" : filters.language;
        }
        
        // Handle Price Filter
        if (filters.price !== "Prices") {
           if (filters.price === "Under Rs 500") params.price = "0-500";
           else if (filters.price === "Rs 500 - Rs 1000") params.price = "500-1000";
           else if (filters.price === "Above Rs 1000") params.price = "1000-100000";
           else if (filters.price === "Free") params.price = "free";
        }

        const response = await fetchBooks(params);
        
        if (response.success) {
          let fetchedBooks = response.data.map(formatBookData);

          // Handle client-side rating filtering 
          if (filters.rating !== "Ratings") {
            const minRating = Number(filters.rating.split(' ')[0]); 
            if (!isNaN(minRating)) {
                fetchedBooks = fetchedBooks.filter(b => b.rating >= minRating);
            }
          }

          setBooks(fetchedBooks);
          
          // Use pagination data from backend
          if (response.pagination) {
             setTotalPages(response.pagination.pages);
          }
        } else {
           setError("Failed to load books");
        }
      } catch (err) {
        console.error("Error loading books:", err);
        setError("Something went wrong while fetching books.");
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
    window.scrollTo(0, 0);
  }, [filters, currentPage, activeSearch]); 

  /* Reset to page 1 whenever filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, activeSearch]);

  const handleFilterChange = (newFilters) => {
      setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };
  
  return (
    <div className="book-page">
      <div className="container">
        <h3 className="page-title">All E-Books</h3>
        
        {!loading && !error && (
            <p className="page-subtitle">
            Showing {books.length} books
            </p>
        )}

        <div className="bookpage-section">
          {/* Filters */}
          <FilterSection
            filters={filters}
            setFilters={handleFilterChange} 
            authors={authorOptions}
            genres={genreOptions}
            languages={languageOptions}
            // Pass Static Options
            prices={PRICE_OPTIONS} 
            ratings={RATING_OPTIONS}
            onReset={resetFilters}
          />
          
          {/* Loading / Error / Content States */}
          {loading ? (
             <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
             </div>
          ) : error ? (
              <div className="alert alert-danger text-center">{error}</div>
          ) : books.length === 0 ? (
              <div className="text-center py-5">
                  <h4>No books found matching your criteria.</h4>
                  {/*<button className="btn btn-outline-primary mt-3" onClick={resetFilters}>Reset Filters</button>*/}
              </div>
          ) : (
             <BookGrid books={books} />
          )}
          
          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <PaginationSection
              currentPage={currentPage}
              totalPages={totalPages}
              changePage={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BookPage;
