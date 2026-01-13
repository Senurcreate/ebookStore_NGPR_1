import React, { useEffect, useState } from "react";
import BookCarousel from "./BookCarousel"; 
import AudioBookCarousel from "./AudioBookCarousel";
import { formatBookData } from "../utils/bookFormatter"; 

const BookSectionLoader = ({ title, fetchFunction, type = "ebook" }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Execute the function passed in props
        const response = await fetchFunction();
        
        if (response.data && response.data.length > 0) {
          const formattedBooks = response.data.map(book => formatBookData(book));
          setBooks(formattedBooks);
        } else {
            setBooks([]);
        }
      } catch (err) {
        console.error(`Error loading section: ${title}`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchFunction, title]);

  // Loading State 
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error or Empty State (Return null to hide section completely)
  if (error || books.length === 0) {
    return null; 
  }

  if (type === "audiobook") {
    return <AudioBookCarousel title={title} books={books} />;
  }

  // Success State
  return <BookCarousel title={title} books={books} />;
};

export default BookSectionLoader;