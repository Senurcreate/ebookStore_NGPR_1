import React, { useState, useRef, useEffect } from "react";
import AudioBookCard from "../components/AudioBookCard";

const AudioBookCarousel = ({ title, books  }) => {
  const scrollRef = useRef(null);

  if (!books || books.length === 0) {
      return null;
  }

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // Check scroll position to hide/show arrows
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;

    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft < maxScroll);
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -window.innerWidth * 0.6,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: window.innerWidth * 0.6,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  useEffect(() => {
    checkScroll();
  }, []);

  return (
    <section className="audiobook-carousel-section py-5">
      <div className="container">
        {title && <h3 className="section-title mb-4">{title}</h3>}

        <div className="audiobook-carousel position-relative">
          
          {/* LEFT ARROW — only visible after scrolling */}
          {showLeft && (
            <button className="scroll-btn left" onClick={scrollLeft}>
              <i className="bi bi-chevron-left"></i>
            </button>
          )}

          <div
            className="carousel-container"
            ref={scrollRef}
            onScroll={checkScroll}
          >
            <div className="audiobook-row">
              {books.map((book) => (
                <AudioBookCard key={book.id} book={book} />
              ))}
            </div>
          </div>

          {/* RIGHT ARROW — hides at the scroll end */}
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

export default AudioBookCarousel;

