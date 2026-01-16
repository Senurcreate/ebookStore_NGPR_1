import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, clearCart } from '../../redux/features/cart/cartSlice';
import { useAuth } from '../../context/AuthContext';
import { addToWishlist } from '../../services/wishlist.service';
import "../../styles/main.scss";

const Checkout = () => {
  // 1. New User Status
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  // Get Real Data from Redux
  const cartItems = useSelector((state) => state.cart.cartItems);

  // UI States
  const [selectedIds, setSelectedIds] = useState(cartItems.map(item => item.id));
  const [loadingIds, setLoadingIds] = useState([]);

  // Derived Calculations
  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price, 0);
  const total = subtotal;

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(cartItems.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleItemSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
    setSelectedIds(selectedIds.filter(itemId => itemId !== id));
  };

  const handleMoveToWishlist = async (item) => {
    if (!currentUser) {
      alert("Please login to save items to your wishlist.");
      return;
    }

    try {
      // Add loading state for this specific item
      setLoadingIds(prev => [...prev, item.id]);

      // Call the API
      await addToWishlist(item.id);

      // If successful, remove from Cart (Redux)
      dispatch(removeFromCart(item.id));
      
      //Update local selection state
      setSelectedIds(selectedIds.filter(itemId => itemId !== item.id));

      
      // alert("Moved to wishlist!"); 

    } catch (error) {
      console.error("Failed to move to wishlist", error);
      alert(error.message || "Failed to add to wishlist. It might already be there.");
    } finally {
      // Remove loading state
      setLoadingIds(prev => prev.filter(id => id !== item.id));
    }
  };

  // NAVIGATE ---
  const handleProceed = () => {
    if (!currentUser) {
      alert("Please login to checkout");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one item");
      return;
    }

    // Save selected items if needed (optional, or rely on Cart state)
    // Simply navigate to the next step
    navigate('/paymentMethod');
  };

  
  // --- RENDER ---
  if (cartItems.length === 0) {
    return (
      <div className="container py-5 mt-6 text-center">
        <div className="mb-4">
           <i className="bi bi-cart-x display-1 text-muted opacity-50"></i>
        </div>
        <h2 className="fw-bold text-dark mb-3">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary px-5 py-2 rounded-pill">
          Start Shopping
        </button>
      </div>
    );
  }

      return(
      <div className="container py-5">
          <h2 className="fw-normal mb-4 text-start mt-4">Checkout</h2>
          
          <div className="row g-4">
            {/* LEFT COLUMN: Cart Items */}
            <div className="col-lg-8">
              
              {/* Select All Header */}
              <div className="card shadow-sm border-0 mb-3">
                <div className="card-body d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="form-check d-flex align-items-center p-0">
                        <input 
                          type="checkbox" 
                          className="form-check-input custom-checkbox me-3 ms-0" 
                          style={{width: '20px', height: '20px'}}
                          checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                          onChange={handleSelectAll}
                        />
                        <span className="fw-medium">Select All Items ({cartItems.length})</span>
                    </div>
                  </div>
                  <button onClick={() => dispatch(clearCart())} className="btn text-muted p-0">Remove All</button>
                </div>
              </div>

              {/* Items List */}
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`card shadow-sm mb-3 ${selectedIds.includes(item.id) ? 'border-primary' : ''}`}
                >
                  <div className="card-body d-flex align-items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                      className="form-check-input custom-checkbox me-3 flex-shrink-0"
                      style={{width: '20px', height: '20px'}}
                    />
                    <img 
                      src={item.coverImage || item.image || "https://via.placeholder.com/150"}
                      alt={item.title} 
                      className="rounded me-3 object-fit-cover"
                      style={{width: '80px', height: '110px'}} 
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1 fw-semibold text-dark">{item.title}</h6>
                          <p className="mb-1 text-muted small">{item.author}</p>
                          <p className="mb-0 text-muted small">{item.format}</p>
                        </div>
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleMoveToWishlist(item)}
                            disabled={loadingIds.includes(item.id)}
                            className="btn btn-light btn-sm text-secondary rounded-circle" 
                            style={{width: '32px', height: '32px'}}
                            title="Move to Wishlist"
                          >
                             {loadingIds.includes(item.id) ? (
                               <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{width: '12px', height: '12px'}}></span>
                             ) : (
                               <i className="bi bi-heart"></i>
                             )}
                          </button>
                          <button onClick={() => handleRemoveItem(item.id)} className="btn btn-light btn-sm text-secondary rounded-circle" style={{width: '32px', height: '32px'}}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="text-end mt-2">
                        <span className="fw-bold text-danger fs-5">Rs {item.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 overflow-hidden">
                <div className="card-header bg-primary text-white py-3">
                  <h5 className="mb-0 fs-5">Order Summary</h5>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Items Selected</span>
                    <span className="fw-medium">{selectedItems.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Total</span>
                    <span className="fw-medium">Rs {total.toFixed(2)}</span>
                  </div>
                  
                  <hr className="my-3 text-muted opacity-25" />
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="fw-medium">Total ({selectedItems.length} items)</span>
                    <span className="fw-bold text-danger fs-5">Rs {total.toFixed(2)}</span>
                  </div>
                  <button 
                    className="btn btn-primary w-100 py-2 mb-3 fw-medium checkout-btn d-flex align-items-center justify-content-center gap-2"
                    disabled={selectedItems.length === 0}
                    onClick={handleProceed}
                  >
                    <i className="bi bi-credit-card-2-back"></i>
                    Proceed to Checkout
                  </button>
                  <div className="text-center text-muted small mb-4">
                    <i className="bi bi-lock-fill me-1"></i>
                    Secure checkout powered by Stripe
                  </div>
                  <div className="d-flex justify-content-center gap-2">
                    <div className="border rounded px-2 py-1 small text-muted">VISA</div>
                    <div className="border rounded px-2 py-1 small text-muted">Mastercard</div>
                    <div className="border rounded px-2 py-1 small text-muted">PayPal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
};

export default Checkout;