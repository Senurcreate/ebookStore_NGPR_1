import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";
import { useAuth } from "../context/AuthContext"; 

const BookCard = ({ book, showDelete = false, onDelete = () => {} }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  // Safety check
  if (!book) return null;
  if (book.type !== "ebook") return null;

  const bookId = book.id || book._id;

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.cartItems);
  const purchasedBookIds = useSelector((state) => state.purchases.purchasedBookIds);

  const isInCart = cartItems.some((item) => item.id === bookId);
  const isPurchased = purchasedBookIds.includes(String(bookId));

  const handleClick = () => {
    navigate(`/books/${bookId}`);
  };

  const handleCartAction = (e) => {
    e.stopPropagation(); 

    if (!currentUser) {
      navigate('/login', { 
        state: { message: "Please log in to add items to your cart." } 
      });
      return;
    }
    
    if (isInCart) {
      dispatch(removeFromCart(bookId));
    } else {
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

  const imageUrl = book.image || book.coverImage || "https://via.placeholder.com/150";
  const ratingValue = book.rating || (book.ratingStats?.average) || 0;
  const isOwned = isPurchased || book.price === 0;

  
  return (
    <div className="book-card">
      <img
        src={imageUrl}
        className="card-img-top"
        alt={book.title}
        onClick={handleClick}
        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} // Fallback image
      />
      <div className="card-body">
        <h5 className="card-title">{book.title}</h5>
        <p className=" mb-2 card-author">{book.author}</p>

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
            {isOwned ? (
               <button 
                  className="cart-btn btn btn-sm border-0" 
                  disabled
                  style={{ 
                    backgroundColor: '#198754', 
                    opacity: 1, 
                    cursor: 'default',
                    color: 'white',
                    pointerEvents: 'none'
                  }}
                  title="Owned" 
               >

                  <i className="bi bi-check-lg" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}></i>
               </button>
            ) : (
                <button
                className={`cart-btn btn btn-sm border-0 ${
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
            )}

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
