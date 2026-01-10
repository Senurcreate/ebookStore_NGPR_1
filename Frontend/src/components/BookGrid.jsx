import React from "react";
import BookCard from "../components/BookCard";

const BookGrid = ({ books }) => {
  return (
    <div className="bookpage">
      <div className="book-grid = [] ">
        {books.map((book, index) => (
          <div className="bookpage-card" key={book._id || book.id || index}>
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookGrid;


//row g-4

{/*import React from "react";
import BookCard from "../components/BookCard";

const BookGrid = ({ books }) => {
  return (
    <div className="book-grid">
      {books.map((book, index) => (
          <div className="bookpage-card" key={index}>
            <BookCard book={book} />
          </div>
      ))}
    </div>
  );
};

export default BookGrid;*/}