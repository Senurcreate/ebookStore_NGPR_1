import React from "react";
import BookCarousel from "../components/BookCarousel";
import booksData from "../data/books.json"; 

const BestSellers = () => {
  // Optional: filter only ebooks
  const ebooks = booksData.map(book => ({
    id: book._id,
    title: book.title,
    author: book.author,
    price: book.price,
    rating: book.rating, 
    type: book.type, 
    image: book.coverImage
  }));

  return <BookCarousel title="Best Sellers" books={ebooks} />;
};

export default BestSellers;

