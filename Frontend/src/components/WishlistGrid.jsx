import React from "react";
import BookCard from "../components/BookCard";

const WishlistGrid = ({ books, onDelete }) => {
  return (
    <div className="wishlist-grid">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          showDelete={true}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default WishlistGrid;
