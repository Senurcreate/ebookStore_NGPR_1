import React, { useState, useRef } from "react";
import BookCarousel from "../components/BookCarousel";
import booksData from "../data/books.json"; 

const Categories = () => {
  const categories = ["Romance", "Mystery", "Thriller", "Adventure", "Fiction", "Sci-Fi"];
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef(null);

  const ebooks = booksData.map(book => ({
    id: book._id,
    title: book.title,
    author: book.author,
    price: book.price,
    rating: book.rating, 
    type: book.type, 
    image: book.coverImage
  }));

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -1000, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 1000, behavior: "smooth" });
  };

  // Dropdown menu options
  const authors = ["All Authors", "Stephen King", "J.K. Rowling", "Paulo Coelho", "Agatha Christie"];
  const genres = ["All Genres", "Horror", "Fantasy", "Science Fiction", "Romance", "Adventure"];
  const prices = ["All Prices", "Under Rs 500", "Rs 500 - Rs 1000", "Above Rs 1000"];
  const ratings = ["All Ratings", "1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : categories.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < categories.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="categories-section py-5">
      <div className="container text-center">
        <h2 className="section-title mb-4">Explore Categories</h2>

        {/* Categories Carousel */}
        <div className="d-flex align-items-center justify-content-center mb-4 category-carousel">
          <button className="arrow-btn me-2" onClick={handlePrev}>
            &lt;
          </button>

          {categories.map((cat, index) => (
            <button
              key={index}
              className={`btn px-4 py-2 mx-2 category-btn ${
                index === activeIndex ? "active" : ""
              }`}
            >
              {cat}
            </button>
          ))}

          <button className="arrow-btn ms-2" onClick={handleNext}>
            &gt;
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          <select className="form-select dropdown-menu-box">
            {authors.map((author, i) => (
              <option key={i}>{author}</option>
            ))}
          </select>

          <select className="form-select dropdown-menu-box">
            {genres.map((genre, i) => (
              <option key={i}>{genre}</option>
            ))}
          </select>

          <select className="form-select dropdown-menu-box">
            {prices.map((price, i) => (
              <option key={i}>{price}</option>
            ))}
          </select>

          <select className="form-select dropdown-menu-box">
            {ratings.map((rating, i) => (
              <option key={i}>{rating}</option>
            ))}
          </select>
        </div>

        {/* Horizontal Book Scroll */}
        <BookCarousel books={ebooks} />
        
      </div>
    </section>
  );
};

export default Categories;

