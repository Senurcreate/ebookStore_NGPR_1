import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const AudioBookCard = ({ book, showDelete = false, onDelete = () => {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Safety check
  if (!book) return null;
  // render audiobooks
  if (book.type !== "audiobook") return null;

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
        format: 'MP3'
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
        <div className="price-audiocart d-flex justify-content-between align-items-center">
          <p className="audioprice mb-0">
             {book.price === 0 ? "Free" : `Rs ${book.price}`}
          </p>

          
          <div className="d-flex gap-2 align-items-center">
             <button        
               className={`audiocart-btn ${isInCart ? "btn-success" : ""}`}
               onClick={handleCartAction}
             >
               <i className={`bi ${isInCart ? 'bi-check-lg' : 'bi-cart3'}`}></i>
             </button>

             {showDelete && (
                <button
                  className="action-btn delete" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onDelete(bookId);
                  }}
                >
                  <i className="bi bi-trash"></i>
                </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioBookCard;
