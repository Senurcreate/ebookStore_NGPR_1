import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 text-center p-5">
              
              <div className="mb-4">
                <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-check-lg display-4"></i>
                </div>
              </div>

              <h2 className="fw-bold mb-3">Payment Successful!</h2>
              <p className="text-muted mb-4">
                Thank you for your purchase. Your order has been processed successfully. You can now download your books from your library.
              </p>

              <div className="d-grid gap-3">
                {/* Link to the Download History Page */}
                <Link to="/orders" className="btn btn-primary py-3 fw-bold rounded-3" style={{ backgroundColor: '#3f5ed9', borderColor: '#3f5ed9' }}>
                  <i className="bi bi-journal-album me-2"></i> Go to Order History
                </Link>
                
                <Link to="/" className="btn btn-outline-secondary py-3 fw-bold rounded-3">
                  Continue Browsing
                </Link>
              </div>

              <div className="mt-4 pt-3 border-top">
                <p className="small text-muted mb-0">
                  Transaction ID: <span className="fw-bold text-dark">TRX-{Math.floor(100000 + Math.random() * 900000)}</span>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;