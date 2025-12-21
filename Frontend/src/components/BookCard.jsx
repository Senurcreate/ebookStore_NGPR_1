import React , { useState }from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector} from "react-redux";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";


const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.cartItems);
  
  if (book.type !== "ebook") return null;
  
  // Check if current book is in cart
  const isInCart = cartItems.some(item => item.id === book.id);

  const handleClick = () => {
    navigate(`/books/${book.id}`);
  };

  const handleCartAction = () => {
  if (isInCart) {
    dispatch(removeFromCart(book.id));
    
  } else {
    dispatch(addToCart(book));
    
  }
};

  return (
    <div className="book-card">
      <img
        src={book.coverImage || book.image}
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
          <span className="ms-1">{book.rating}</span>
        </div>

        <div className="price-cart d-flex justify-content-between align-items-center mt-2">
          <p className="price mb-0 fw-semibold">Rs {book.price}</p>
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
        </div>
      </div>
    </div>
  );
};

export default BookCard;
