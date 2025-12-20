import "../../styles/main.scss";
import React, { useState } from 'react';



const Checkout = () => {
  // 1. STATE: New User Status
  const [isNewUser, setIsNewUser] = useState(true); 

  // 2. STATE: Cart Items 
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "The Secret Garden Chronicles",
      author: "Emma Thompson",
      format: "Ebook(Epub)",
      price: 24.99,
      image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1717596365i/124798505.jpg",
      selected: false 
    },
    {
      id: 2,
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      format: "Ebook(Epub)",
      price: 19.99,
      image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1717596365i/124798505.jpg",
      selected: false
    },
    {
      id: 3,
      title: "Four Seasons in Japan",
      author: "Yuki Tanaka",
      format: "Ebook(Epub)",
      price: 28.99,
      image: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1717596365i/124798505.jpg",
      selected: false
    }
  ]);

  // Derived Calculations
  const selectedItems = cartItems.filter(item => item.selected);
  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length;
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price, 0);
  const discountAmount = isNewUser ? (subtotal * 0.10) : 0;
  const total = subtotal - discountAmount;

  // Handlers
  const handleSelectAll = () => {
    const newStatus = !allSelected;
    setCartItems(cartItems.map(item => ({ ...item, selected: newStatus })));
  };

  const handleItemSelect = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleRemoveAll = () => {
    setCartItems([]);
  };

  // --- RENDER ---

  return (
    <div className="container py-5">
      
      {/* DEV TOOLS: Buttons to test the UI states */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <button className="btn btn-outline-danger btn-sm" onClick={() => setCartItems([])}>
          Test Empty State
        </button>
        <button className="btn btn-outline-primary btn-sm" onClick={() => window.location.reload()}>
          Reset Data
        </button>
      </div>

      {/* CONDITIONAL RENDERING */}
      {cartItems.length === 0 ? (
        
        // ------------------------------------------
        // EMPTY STATE UI (The "Oops" Screen)
        // ------------------------------------------
        <div className="text-center py-5">
          <div className="mb-4">
            {/* Big muted icon */}
            <i className="bi bi-cart-x display-1 text-muted opacity-50"></i>
          </div>
          <h2 className="fw-bold text-dark mb-3">Oops! Your cart is empty</h2>
          <p className="text-muted mb-4 lead">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button className="btn btn-primary px-5 py-2 fw-medium rounded-pill">
            <i className="bi bi-arrow-left me-2"></i>
            Start Shopping
          </button>
        </div>

      ) : (

        // ------------------------------------------
        // CHECKOUT UI (When items exist)
        // ------------------------------------------
        <>
          <h2 className="fw-normal mb-4">Checkout</h2>
          
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
                          checked={allSelected}
                          onChange={handleSelectAll}
                        />
                        <span className="fw-medium">Select All Items ({cartItems.length})</span>
                    </div>
                  </div>
                  <button onClick={handleRemoveAll} className="btn text-muted p-0">Remove All</button>
                </div>
              </div>

              {/* Items List */}
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`card shadow-sm mb-3 item-card ${item.selected ? 'border-primary border-2' : 'border-0'}`}
                >
                  <div className="card-body d-flex align-items-center">
                    <input 
                      type="checkbox" 
                      checked={item.selected}
                      onChange={() => handleItemSelect(item.id)}
                      className="form-check-input custom-checkbox me-3 flex-shrink-0"
                      style={{width: '20px', height: '20px'}}
                    />
                    <img 
                      src={item.image} 
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
                          <button className="btn btn-light btn-sm text-secondary rounded-circle" style={{width: '32px', height: '32px'}}>
                            <i className="bi bi-heart"></i>
                          </button>
                          <button className="btn btn-light btn-sm text-secondary rounded-circle" style={{width: '32px', height: '32px'}}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="text-end mt-2">
                        <span className="fw-bold text-danger fs-5">${item.price}</span>
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
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <hr className="my-3 text-muted opacity-25" />
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="fw-medium">Total ({selectedItems.length} items)</span>
                    <span className="fw-bold text-danger fs-5">${total.toFixed(2)}</span>
                  </div>
                  <button 
                    className="btn btn-primary w-100 py-2 mb-3 fw-medium checkout-btn d-flex align-items-center justify-content-center gap-2"
                    disabled={selectedItems.length === 0}
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
        </>
      )}
    </div>
  );
};

export default Checkout;