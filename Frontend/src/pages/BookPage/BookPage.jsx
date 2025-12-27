import React, { useEffect, useState } from "react";
import FilterSection from "./FilterSection";
import BookGrid from "../../components/BookGrid";
import PaginationSection from "../../components/PaginationSection";
import booksData from "../../data/books.json";

const ITEMS_PER_PAGE = 9;

const DEFAULT_FILTERS = {
  author: "Authors",
  genre: "Genres",
  price: "Prices",
  rating: "Ratings",
  language: "Languages",
};

const BookPage = () => {
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setBooks(booksData);
  }, []);

  /* Reset to page 1 whenever filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  /* filter logic */
  const filteredBooks = books.filter((book) => {
    if (book.type !== "ebook") return false;
    return (
      (filters.author === "Authors" || book.author === filters.author) &&
      (filters.genre === "Genres" || book.genre === filters.genre) &&
      (filters.price === "Prices" || book.priceRange === filters.price) &&
      (filters.rating === "Ratings" ||
        book.rating >= Number(filters.rating)) &&
      (filters.language === "Languages" ||
        book.language === filters.language)
    );
  });

  /* pagination */
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="book-page">
      <div className="container">
        <h3 className="page-title">All E-Books</h3>
        <p className="page-subtitle">
          Showing {filteredBooks.length} of {books.length} books
        </p>

        <div className="bookpage-section">
          {/* Filters */}
          <FilterSection
          filters={filters}
          setFilters={setFilters}
          authors={["Authors", ...new Set(books.map(b => b.author))]}
          genres={["Genres", ...new Set(books.map(b => b.genre))]}
          prices={["Prices", "0-500", "500-1000", "1000-1500"]}
          ratings={["Ratings", "3", "4", "4.5", "5"]}
          languages={["Languages", "English", "Sinhala"]}
          onReset={resetFilters}
          />
          
          {/* Grid */}
          <BookGrid books={paginatedBooks} />
          
          {/* Pagination */}
          {totalPages > 1 && (
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
