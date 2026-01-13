import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { simulatePurchase } from '../../services/purchase.service';

const ReviewOrderPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // 1. Get Simulation Data (passed from Card Details Page)
  const paymentInfo = location.state || { paymentMethod: 'visa', cardDetails: { last4: '1234', name: 'User' } };

  // 2. Get Real Book Data from Redux
  const orderItems = useSelector((state) => state.cart.cartItems);

  // 3. Calculate Totals
  const subtotal = orderItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const total = subtotal;

  // 4. Handle Payment Confirmation -> Backend Call
  const handleConfirmOrder = async () => {
    setLoading(true);

    try {
      // Process items in parallel
      const promises = orderItems.map(async (item) => {
        try {
          await simulatePurchase(item.id);
          return { success: true };
        } catch (err) {
          //  CHECK STATUS CODE
          if (err.response && err.response.status === 400) {
            console.warn(`⚠️ Item '${item.title}' skipped (Status 400 - Likely already owned).`);
            return { success: true, skipped: true }; 
          }
          
          // Log other errors (500, Network Error) but don't throw yet
          console.error(`❌ Error on '${item.title}':`, err.message);
          return { success: false, error: err };
        }
      });

      await Promise.all(promises);

      // FORCE SUCCESS NAVIGATION
      console.log("✅ navigating to success...");
      dispatch(clearCart());
      navigate('/paymentSuccess');

    } catch (error) {
      console.error("Critical System Error:", error);
      alert("System error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (orderItems.length === 0) {
    return <div className="container py-5 text-center"><h3>Your order is empty.</h3><button className="btn btn-link" onClick={() => navigate('/')}>Go Home</button></div>;
  }

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
        <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted p-0 mb-3 small">
        <i className="bi bi-chevron-left me-1"></i> Back
        </button>
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
                      <span className="fw-bold text-danger">Rs {item.price}</span>
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
                  <span className="fw-bold">Rs {subtotal.toFixed(2)}</span>
                </div>
                
                <hr className="my-3" />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold fs-5 text-danger">Rs {total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 fw-bold mb-3 rounded-3" 
                  style={{ backgroundColor: '#3f5ed9', borderColor: '#3f5ed9' }}>
                    {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                  ) : (
                    <><i className="bi bi-lock-fill me-2"></i> Confirm Order</>
                    )}
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