import React from "react";
import AudioBookCard from "../components/AudioBookCard";

const AudiobookGrid = ({ books = [] }) => {
  return (
    <div className="audiobook-grid">
      {books.map((book, index) => (
          <div className="audiobookpage-card" key={book._id || book.id || index}>
            <AudioBookCard book={book} />
          </div>
      ))}
    </div>
  );
};

export default AudiobookGrid;
