import React , { useState }from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector} from "react-redux";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";


const BookCard = ({ book, showDelete = false,onDelete = () => {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.cartItems);
  
  if (!book) return null;
  if (book.type !== "ebook") return null;
  
  const bookId = book.id || book._id;
  // Check if current book is in cart
  const isInCart = cartItems.some(item => item.id === bookId);

  const handleClick = () => {
    navigate(`/books/${bookId}`);
  };

  const handleCartAction = (e) => {
  e.stopPropagation();
  if (isInCart) {
      dispatch(removeFromCart(bookId));
    } else {
      // Create a clean object for the cart to avoid storing too much data
      const cartItem = {
        id: bookId,
        title: book.title,
        author: book.author,
        price: book.price,
        image: book.image || book.coverImage,
        type: book.type
      };
      dispatch(addToCart(cartItem));
    
  }
};

// Safe property access for backend data vs static data
  const imageUrl = book.image || book.coverImage || "https://via.placeholder.com/150";
  // Backend returns ratingStats.average, Frontend expects rating
  const ratingValue = book.rating || (book.ratingStats?.average) || 0;

  return (
    <div className="book-card">
      <img
        src={imageUrl}
        className="card-img-top"
        alt={book.title}
        onClick={handleClick}
        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} 
      />
      <div className="card-body">
        <h5 className="card-title">{book.title}</h5>
        <p className="text-muted mb-2">{book.author}</p>

        <div className="rating">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            if (ratingValue >= starValue) {
              return <i key={i} className="bi bi-star-fill text-warning"></i>;
            } else if (ratingValue >= starValue - 0.5) {
              return <i key={i} className="bi bi-star-half text-warning"></i>;
            } else {
              return <i key={i} className="bi bi-star text-warning"></i>;
            }
          })}
          <span className="ms-1">{ratingValue}</span>
        </div>

        <div className="price-cart d-flex justify-content-between align-items-center mt-2">
          <p className="price mb-0 fw-semibold">
            {book.price === 0 ? "Free" : `Rs ${book.price}`}
          </p>
          <div className="actions">
            <button className={`cart-btn btn btn-sm border-0 ${isInCart ? 'btn-success' : 'btn-outline-primary'}`}
            onClick={handleCartAction}
              style={{ 
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
            <i className={`bi ${isInCart ? 'bi-check-lg' : 'bi-cart3'}`}></i>
             
            </button>
            
            {/* Delete button only for wishlist */}
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

export default BookCard;
