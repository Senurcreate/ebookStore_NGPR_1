import React from "react";
import BookCard from "../components/BookCard";
import AudioBookCard from "./AudioBookCard";

const WishlistGrid = ({ books, onDelete, viewType }) => {
  const gridClass = viewType === 'audiobook' ? 'audiobook-view' : 'ebook-view';
  return (
    <div className={`wishlist-grid ${gridClass}`}>
      {books.map((book, index) => {
        const key = book._id || book.id || index;
        return (
          <div key={key}>
             {/* Conditional Rendering based on Type */}
             {book.type === 'audiobook' ? (
                <AudioBookCard 
                    book={book} 
                    showDelete={true} 
                    onDelete={onDelete} 
                />
             ) : (
                <BookCard 
                    book={book} 
                    showDelete={true} 
                    onDelete={onDelete} 
                />
             )}
          </div>
        );
      })}
    </div>
  );
};

export default WishlistGrid;