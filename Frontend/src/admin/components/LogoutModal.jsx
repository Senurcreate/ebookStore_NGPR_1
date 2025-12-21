import React from 'react';
import "../styles/main.scss";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  // Prevent clicks inside the modal content from closing it
  const handleContainerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal-container" onClick={handleContainerClick}>
        
        {/* Close Button (Top Right) */}
        <i className="bi bi-x-lg close-btn-icon" onClick={onClose}></i>

        {/* Main Icon */}
        <div className="logout-icon-container">
            <i className="bi bi-box-arrow-right logout-icon-primary"></i>
        </div>

        {/* Text Content */}
        <h4 className="modal-title">Confirm Logout</h4>
        <p className="modal-subtitle">
          Are you sure you want to logout? You'll need to sign in again to access your account.
        </p>

        {/* Info Box */}
        <div className="info-box">
          <i className="bi bi-exclamation-circle info-icon"></i>
          <div>
            <div className="info-text-title">Don't worry!</div>
            <p className="info-text-body">
              Your cart items & wishlist will be saved for when you return.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button className="btn btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-modal-logout" onClick={onConfirm}>
            Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default LogoutModal;