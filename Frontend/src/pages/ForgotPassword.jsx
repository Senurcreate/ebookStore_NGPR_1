import React, { useState } from 'react';
import { auth } from "../firebase/firebase.config"; 
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        type: "success",
        text: "Reset link sent! Please check your inbox.",
      });
      setEmail(""); 
    } catch (error) {
      let errorMsg = "Failed to send reset email. Please try again.";
      if (error.code === "auth/user-not-found") errorMsg = "No account found with this email.";
      if (error.code === "auth/invalid-email") errorMsg = "Please enter a valid email address.";
      
      setMessage({ type: "danger", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const cardStyle = {
    maxWidth: '450px',
    width: '100%',
    borderRadius: '1.5rem',
    border: 'none',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  };

  const iconCircleStyle = {
    width: '60px',
    height: '60px',
    backgroundColor: '#e7f0ff',
    color: '#0d6efd',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    margin: '0 auto 1.5rem',
  };

  return (
    <div style={containerStyle} className="p-3">
      {/* Back to Login */}
      <div className="mb-4" style={{ width: '450px', maxWidth: '100%' }}>
        <Link to="/login" className="text-decoration-none text-secondary d-flex align-items-center">
          <i className="bi bi-arrow-left me-2"></i> Back to Login
        </Link>
      </div>

      <div className="card p-5" style={cardStyle}>
        <div className="text-center">
          <div style={iconCircleStyle}>
            <i className="bi bi-lock"></i>
          </div>
          <h4 className="fw-bold mb-3">Forgot Password?</h4>
          <p className="text-muted mb-4">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Feedback Messages */}
        {message.text && (
          <div className={`alert alert-${message.type} py-2 small text-center mb-3`} role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="mb-4 text-start">
            <label className="form-label text-secondary small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                required
                className="form-control border-start-0 ps-0"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center"
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <i className="bi bi-envelope me-2"></i>
            )}
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#f0f7ff', border: '1px solid #d0e3ff' }}>
          <div className="d-flex">
            <i className="bi bi-shield-check text-primary me-2 mt-1"></i>
            <p className="small mb-0 text-primary" style={{ lineHeight: '1.4' }}>
              <strong>Security Note:</strong> For your protection, the reset link will expire in 1 hour. 
              If you don't receive the email, check your spam folder.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-4 text-center">
        <p className="text-secondary small">
          Remember your password? <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign in instead</Link>
        </p>
        <p className="text-secondary small mt-4">
          Need help? <br />
          <a href="/help" className="text-primary text-decoration-none small">
            Visit our Help Center <i className="bi bi-arrow-up-right small"></i>
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;