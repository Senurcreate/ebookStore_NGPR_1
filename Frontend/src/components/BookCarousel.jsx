import React, { useState, useRef, useEffect } from "react";
import BookCard from "../components/BookCard";

const BookCarousel = ({ title, books }) => {
  const scrollRef = useRef(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // Check scroll position and update arrow visibility
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;

    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft < maxScroll);
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -window.innerWidth * 0.6, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: window.innerWidth * 0.6, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  useEffect(() => {
    checkScroll();
  }, []);

  return (
    <section className="book-carousel-section py-5">
      <div className="container">
        {title && <h3 className="section-title mb-4">{title}</h3>}

        <div className="book-carousel position-relative">
          
          {/* LEFT ARROW */}
          {showLeft && (
            <button className="scroll-btn left" onClick={scrollLeft}>
              <i className="bi bi-chevron-left"></i>
            </button>
          )}

          <div className="carousel-container" ref={scrollRef} onScroll={checkScroll}>
            <div className="book-row">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>

          {/* RIGHT ARROW */}
          {showRight && (
            <button className="scroll-btn right" onClick={scrollRight}>
              <i className="bi bi-chevron-right"></i>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookCarousel;

