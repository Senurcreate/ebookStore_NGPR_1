import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


const CardDetailsPage = () => {

  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from previous page (Payment Method)
  const previousData = location.state || {}; 

  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      // 1. Remove all non-digits
      const rawValue = value.replace(/\D/g, '');
      
      // 2. Limit to 16 digits
      const limitedValue = rawValue.slice(0, 16);
      
      // 3. Add a space after every 4 digits using regex
      const formattedValue = limitedValue.match(/.{1,4}/g)?.join(' ') || '';
      
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Button clicked! Current Form Data:", formData);

    // Manual Validation Check (stripping spaces for the check)
    const rawCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!formData.cardName || rawCardNumber.length < 16 || !formData.cvv) {
      alert("Please enter valid card details.");
      return;
    }

  

  // Pass accumulated data to Review Page
    navigate('/reviewOrder', { 
        state: { 
            paymentMethod: previousData.paymentMethod || 'visa', 
            cardDetails: {
                last4: rawCardNumber.slice(-4),
                name: formData.cardName
            }
        } 
    });
  };


  return (
    <div className="min-vh-100 bg-white" style={{ fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <nav className="navbar border-bottom py-3 bg-white">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-dark text-white rounded d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>L</div>
            <span className="fw-bold me-4 text-secondary">Logo</span>
            <div className="border-start ps-3 text-muted">
              <i className="bi bi-lock me-2"></i>Secure Checkout
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-4">
            <div className="text-center">
              <div className="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '30px', height: '30px' }}>1</div>
              <div className="small fw-bold text-secondary">Payment</div>
            </div>
            <div className="bg-light" style={{ width: '60px', height: '2px' }}></div>
            <div className="text-center opacity-50">
              <div className="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center mb-1" style={{ width: '30px', height: '30px' }}>2</div>
              <div className="small text-secondary">Review</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-5 d-flex justify-content-center" style={{ backgroundColor: '#f8fafd' }}>
        <div className="card shadow-sm border-0 rounded-4" style={{ maxWidth: '600px', width: '100%' }}>
          
          <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
            <button className="btn btn-link text-decoration-none text-muted p-0 mb-2 btn-sm border-0 shadow-none">
              <i className="bi bi-chevron-left me-1"></i>Back
            </button>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0">Card Details</h4>
                <p className="text-muted small">Enter your payment information</p>
              </div>
              <div className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill fw-normal">
                <i className="bi bi-shield-check me-1"></i>Secure
              </div>
            </div>
          </div>

          <div className="card-body px-4 pt-2 pb-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label small fw-bold">Name on Card<span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="cardName"
                  className="form-control form-control-lg bg-white border shadow-none" 
                  placeholder="John Doe"
                  value={formData.cardName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold">Card Number<span className="text-danger">*</span></label>
                <div className="input-group input-group-lg">
                  <input 
                    type="text" 
                    name="cardNumber"
                    className="form-control border shadow-none" 
                    placeholder="1234 5678 9012 3456"
                    maxLength="19" // Updated to 19 to account for spaces
                    value={formData.cardNumber}
                    onChange={handleChange}
                  />
                  <span className="input-group-text bg-white border text-muted">
                    <i className="bi bi-credit-card"></i>
                  </span>
                </div>
                <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                   <i className="bi bi-info-circle me-1"></i>Enter 16-digit card number
                </div>
              </div>

              <div className="row mb-4 pt-2">
                <div className="col-6">
                  <label className="form-label small fw-bold">CVV<span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    name="cvv"
                    className="form-control form-control-lg border shadow-none" 
                    placeholder="123"
                    maxLength="3"
                    value={formData.cvv}
                    onChange={handleChange}
                  />
                  <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>3 digits on back</div>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Expiry Date<span className="text-danger">*</span></label>
                  <div className="d-flex align-items-center gap-2">
                    <input 
                      type="text" 
                      name="expiryMonth"
                      className="form-control form-control-lg border shadow-none text-center px-0" 
                      placeholder="MM"
                      maxLength="2"
                      value={formData.expiryMonth}
                      onChange={handleChange}
                    />
                    <span className="text-muted">/</span>
                    <input 
                      type="text" 
                      name="expiryYear"
                      className="form-control form-control-lg border shadow-none text-center px-0" 
                      placeholder="YY"
                      maxLength="2"
                      value={formData.expiryYear}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="alert alert-primary border-0 rounded-3 d-flex align-items-center p-3 mb-4" style={{ backgroundColor: '#edf4ff' }}>
                <i className="bi bi-lock text-primary fs-5 me-3"></i>
                <div className="small text-primary" style={{ lineHeight: '1.4' }}>
                  Your payment information is encrypted and secure.
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-dark w-100 py-3 fw-bold rounded-3 shadow-sm border-0" 
                style={{ backgroundColor: '#0c1324', transition: '0.3s' }}
              >
                <i className="bi bi-lock-fill me-2"></i>Pay Price
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-muted small mb-3">We accept</p>
              <div className="d-flex justify-content-center gap-2">
                {['VISA', 'Mastercard', 'Amex'].map(card => (
                  <div key={card} className="border rounded px-3 py-2 small bg-light text-muted fw-bold" style={{ fontSize: '0.7rem' }}>
                    {card}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center">
        <p className="text-muted small">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
};

export default CardDetailsPage;