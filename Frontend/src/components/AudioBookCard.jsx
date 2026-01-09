import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const AudioBookCard = ({ book }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Safety check
  if (!book) return null;
  // Ensure we only render audiobooks
  if (book.type !== "audiobook") return null;

  // Handle MongoDB _id vs Frontend id
  const bookId = book.id || book._id;

  // Check if current book is in cart
  const isInCart = cartItems.some((item) => item.id === bookId);

  const handleClick = () => {
    navigate(`/books/${bookId}`);
  };

  const handleCartAction = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the button

    if (isInCart) {
      dispatch(removeFromCart(bookId));
    } else {
      // Create a clean object for the cart
      const cartItem = {
        id: bookId,
        title: book.title,
        author: book.author,
        price: book.price,
        image: book.image || book.coverImage,
        type: book.type,
      };
      dispatch(addToCart(cartItem));
    }
  };

  // Map backend fields to frontend display variables
  const imageUrl = book.image || book.coverImage || "https://via.placeholder.com/150";
  // Backend returns ratingStats.average, Frontend expects rating
  const ratingValue = book.rating || book.ratingStats?.average || 0;

  return (
    <div className="audiobook-card d-flex align-items-center shadow-sm p-2 rounded-4">
      <img
        src={imageUrl}
        alt={book.title}
        className="audiobook-img rounded-3 me-3"
        onClick={handleClick}
        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
      />
      <div className="audiobook-details">
        <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
          <span className="title-text">{book.title}</span>
          <i className="bi bi-headphones text-primary"></i>
        </h5>
        <p className="text-muted mb-2">{book.author}</p>
        <div className="rating mb-2">
          {Array.from({ length: 5 }, (_, i) => {
             const starValue = i + 1;
             if (ratingValue >= starValue) {
               return <i key={i} className="bi bi-star-fill text-warning me-1"></i>;
             } else if (ratingValue >= starValue - 0.5) {
               return <i key={i} className="bi bi-star-half text-warning me-1"></i>;
             } else {
               return <i key={i} className="bi bi-star text-warning me-1"></i>;
             }
          })}
          <span className="text-secondary ms-1">{ratingValue}</span>
        </div>
        <div className="price-audiocart">
          <p className="audioprice">
             {book.price === 0 ? "Free" : `Rs ${book.price}`}
          </p>
          <button
            className={`audiocart-btn ${
              isInCart ? "btn-success" : "btn-outline-primary"
            }`}
            onClick={handleCartAction}
            style={{
              transition: "all 0.3s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <i className={`bi ${isInCart ? "bi-check-lg" : "bi-cart3"}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioBookCard;
