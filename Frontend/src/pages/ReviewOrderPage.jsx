import React from 'react';

const ReviewOrderPage = () => {
  const orderItems = [
    {
      id: 1,
      title: "The Secret Garden Chronicles",
      author: "Emma Thompson",
      format: "Ebook(Epub)",
      price: 24.99,
      image: "https://via.placeholder.com/80x110" // Replace with your book cover
    },
    {
      id: 2,
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      format: "Ebook(Epub)",
      price: 19.99,
      image: "https://via.placeholder.com/80x110"
    },
    {
      id: 3,
      title: "Four Seasons in Japan",
      author: "Yuki Tanaka",
      format: "Ebook(Epub)",
      price: 28.99,
      image: "https://via.placeholder.com/80x110"
    }
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* Header Section */}
      <nav className="navbar navbar-light bg-white border-bottom py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="bg-dark text-white rounded d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>L</div>
            <span className="fw-bold">Logo</span>
            <div className="ms-4 text-muted border-start ps-4 d-none d-md-block">
              <i className="bi bi-lock-fill me-2"></i>Secure Checkout
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="d-flex align-items-center">
            <div className="text-center me-4">
              <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '30px', height: '30px' }}>
                <i className="bi bi-check"></i>
              </div>
              <div className="small text-muted">Payment</div>
            </div>
            <div className="border-bottom" style={{ width: '50px', marginBottom: '20px' }}></div>
            <div className="text-center ms-4">
              <div className="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '30px', height: '30px' }}>2</div>
              <div className="small fw-bold">Review</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <h4 className="mb-4 fw-bold">Review Order</h4>
        
        <div className="row g-4">
          {/* Left Column: Order Items */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4 rounded-4">
              <h5 className="mb-4">Order Items <span className="text-muted small">({orderItems.length})</span></h5>
              
              {orderItems.map((item, index) => (
                <div key={item.id} className={`d-flex py-3 ${index !== orderItems.length - 1 ? 'border-bottom' : ''}`}>
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="rounded shadow-sm me-3" 
                    style={{ width: '80px', height: '110px', objectFit: 'cover' }} 
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <h6 className="fw-bold mb-1">{item.title}</h6>
                      <span className="fw-bold text-danger">${item.price}</span>
                    </div>
                    <p className="text-muted small mb-1">{item.author}</p>
                    <p className="text-muted small mb-0">{item.format}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Payment & Summary */}
          <div className="col-lg-4">
            {/* Payment Type */}
            <div className="card border-0 shadow-sm p-4 rounded-4 mb-4">
              <h6 className="fw-bold mb-3">Payment Type</h6>
              <div className="d-flex align-items-center bg-light p-3 rounded">
                <div className="bg-dark text-white p-2 rounded me-3">
                  <i className="bi bi-credit-card-2-back fs-5"></i>
                </div>
                <div>
                  <div className="small fw-bold">•••• 1234</div>
                  <div className="text-muted small">Visa Credit Card</div>
                </div>
              </div>
              {/*<a href="#" className="text-primary small mt-3 d-inline-block text-decoration-none">
                <i className="bi bi-pencil-square me-1"></i> Change payment method
              </a>*/}
            </div>

            {/* Order Summary */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="p-4 bg-light border-bottom">
                <h6 className="fw-bold mb-0">Order Summary</h6>
              </div>
              <div className="p-4">
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold">$73.97</span>
                </div>
                
                <hr className="my-3" />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold fs-5 text-danger">$73.97</span>
                </div>
                
                <button className="btn btn-primary w-100 py-2 fw-bold mb-3 rounded-3" style={{ backgroundColor: '#3f5ed9', borderColor: '#3f5ed9' }}>
                  <i className="bi bi-lock-fill me-2"></i> Confirm Order
                </button>
                
                <div className="text-center text-muted small">
                  <i className="bi bi-lock me-1"></i> Secure transaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrderPage;