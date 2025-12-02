import React from "react";
import AudioBookCarousel from "../components/AudioBookCarousel";
import booksData from "../data/books.json"; 

const NewAudiobooks = () => {
  // Optional: filter only audiobooks
  const audiobooks = booksData.map(book => ({
    id: book._id,
    title: book.title,
    author: book.author,
    price: book.price,
    rating: book.rating, 
    type: book.type, 
    image: book.coverImage
  }));

  return <AudioBookCarousel title="New Audiobooks" audiobooks={audiobooks} />;
};

export default NewAudiobooks;