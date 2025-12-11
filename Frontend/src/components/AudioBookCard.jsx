import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector} from "react-redux";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";



const AudioBookCard = ({ book }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get cart items from Redux store
  const cartItems = useSelector((state) => state.cart.cartItems);



  // Only render if type is 'audiobook'
  if (book.type !== "audiobook") return null;

  // Check if current book is in cart
  const isInCart = cartItems.some(item => item.id === book.id);

  const handleClick = () => {
    navigate(`/audiobooks/${book.id}`);

    };

    const handleCartAction = () => {
    if (isInCart) {
      dispatch(removeFromCart(book.id));
      
    } else {
      dispatch(addToCart(book));
      
    }
  };

  return (
    <div className="audiobook-card d-flex align-items-center shadow-sm p-2 rounded-4">
      <img
        src={book.image}
        alt={book.title}
        className="audiobook-img rounded-3 me-3"
        onClick={handleClick}
      />
      <div className="audiobook-details">
        <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">{book.title}<i className="bi bi-headphones text-primary"></i></h5>
        <p className="text-muted mb-2">{book.author}</p>
        <div className="rating mb-2">
          <i className="bi bi-star-fill text-warning me-1"></i>
          <i className="bi bi-star-fill text-warning me-1"></i>
          <i className="bi bi-star-fill text-warning me-1"></i>
          <i className="bi bi-star-fill text-warning me-1"></i>
          <i className="bi bi-star-half text-warning me-1"></i>
          <span className="text-secondary">{book.rating}</span>
        </div>
        <div className="price-audiocart">
          <p className="audioprice">Rs {book.price}</p>
          <button className={`audiocart-btn ${isInCart ? 'btn-success' : 'btn-outline-primary'}`}
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

export default AudioBookCard;
