import React, { useState } from 'react';


const PaymentMethodPage = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const paymentSections = [
    {
      title: "Credit Card / Visa Debit",
      icon: "bi-credit-card",
      options: [
        { id: 'visa', name: 'Visa', icon: 'bi-credit-card-2-front-fill', color: '#0d6efd' },
        { id: 'mastercard', name: 'Mastercard', icon: 'bi-credit-card-2-back-fill', color: '#dc3545' },
        { id: 'amex', name: 'American Express', icon: 'bi-credit-card-2-front', color: '#0d6efd' }
      ]
    },
    {
      title: "Mobile Wallet",
      icon: "bi-phone",
      options: [
        { id: 'easzycah', name: 'EaszyCah', icon: 'bi-phone-fill', color: '#212529' },
        { id: 'genie', name: 'Genie', icon: 'bi-phone-vibrate', color: '#0d6efd' },
        { id: 'mcash', name: 'mCash', icon: 'bi-device-ssd', color: '#0d6efd' }
      ]
    },
    {
      title: "Internet Banking",
      icon: "bi-bank",
      options: [
        { id: 'sampath', name: 'Sampath Bank', icon: 'bi-building-fill', color: '#0d6efd' },
        { id: 'boc', name: 'BOC', icon: 'bi-building', color: '#b02a37' },
        { id: 'nsb', name: 'NSB', icon: 'bi-bank2', color: '#fd7e14' }
      ]
    }
  ];

  return (
    <div className="min-vh-100 bg-light ">
      {/* Header */}
      <nav className="navbar border-bottom py-3 bg-white">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-dark text-white rounded d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>L</div>
            <span className="fw-bold me-4 text-secondary">Logo</span>
            <div className="border-start ps-3 text-muted">
              <i className="bi bi-lock me-2"></i>Secure Checkout
            </div>
          </div>
          
          {/* Progress Steps */}
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
      <div className="container mt-5 pt-5" style={{ maxWidth: '800px' }}>
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            
            <button className="btn btn-link text-decoration-none text-muted p-0 mb-3 small">
              <i className="bi bi-chevron-left me-1"></i> Back
            </button>
            
            <h5 className="fw-bold mb-1">Payment Method</h5>
            <p className="text-muted small mb-4">Select your preferred payment option</p>

            <hr className="opacity-10 mb-4" />

            {paymentSections.map((section, idx) => (
              <div key={idx} className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <i className={`bi ${section.icon} me-2`}></i>
                  <span className="fw-bold small">{section.title}</span>
                </div>
                <div className="row g-3">
                  {section.options.map((option) => (
                    <div className="col-4" key={option.id}>
                      <div 
                        onClick={() => setSelectedMethod(option.id)}
                        className={`card h-100 text-center p-3 border-2 cursor-pointer transition-all ${selectedMethod === option.id ? 'border-primary' : 'border-light-subtle'}`}
                        style={{ cursor: 'pointer', transition: '0.2s' }}
                      >
                        <div className="rounded-3 p-2 mb-2 d-inline-block mx-auto" style={{ backgroundColor: option.color }}>
                          <i className={`bi ${option.icon} text-white fs-3`}></i>
                        </div>
                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>{option.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* PayPal Special Row */}
            <div 
              onClick={() => setSelectedMethod('paypal')}
              className={`card p-3 mb-4 border-2 ${selectedMethod === 'paypal' ? 'border-primary' : 'border-light-subtle'}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded p-2 me-3">
                  <i className="bi bi-paypal text-white fs-4"></i>
                </div>
                <div>
                  <div className="fw-bold small">PayPal</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Fast and secure payment</div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            {/* Footer Action */}
            <button 
            disabled={!selectedMethod} 
            className={`btn w-100 py-3 rounded-3 fw-bold transition-all ${
                selectedMethod 
                ? 'btn-primary shadow-sm' 
                : 'btn-secondary opacity-25'
            }`}
            style={{ 
                backgroundColor: selectedMethod ? '' : '#c6d2e1', 
                border: 'none',
                cursor: selectedMethod ? 'pointer' : 'not-allowed'
            }}
            onClick={() => alert(`Proceeding with ${selectedMethod}`)}
            >
            Next
            </button>
            
            <div className="text-center mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
              <i className="bi bi-lock-fill me-1"></i>
              Your payment information is secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPage;