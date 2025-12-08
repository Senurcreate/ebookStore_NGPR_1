import React from "react";
import { useNavigate } from "react-router-dom";


const BookCard = ({ book }) => {
  const navigate = useNavigate();
  
  if (book.type !== "ebook") return null;

  const handleClick = () => {
    navigate(`/books/${book.id}`);
  };

  return (
    <div className="book-card">
      <img
        src={book.image}
        className="card-img-top"
        alt={book.title}
        onClick={handleClick}
      />
      <div className="card-body">
        <h5 className="card-title">{book.title}</h5>
        <p className="text-muted mb-2">{book.author}</p>

        <div className="rating">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            if (book.rating >= starValue) {
              return <i key={i} className="bi bi-star-fill text-warning"></i>;
            } else if (book.rating >= starValue - 0.5) {
              return <i key={i} className="bi bi-star-half text-warning"></i>;
            } else {
              return <i key={i} className="bi bi-star text-secondary"></i>;
            }
          })}
          <span className="ms-1 text-muted">{book.rating}</span>
        </div>

        <div className="price-cart d-flex justify-content-between align-items-center mt-2">
          <p className="price mb-0 fw-semibold">Rs {book.price}</p>
          <button className="cart-btn btn btn-sm border-0">
            <i className="bi bi-cart3"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
