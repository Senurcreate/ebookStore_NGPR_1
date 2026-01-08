import React from "react";
import "./DeletePopup.scss";

const DeletePopup = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="overlay">
       <div className="delete-modal">

        {/* Close button */}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* Icon */}
        <div className="icon-wrapper">
          <i className="bi bi-trash-fill"></i>
        </div>


        {/* Title */}
        <h2>Delete Account</h2>

        {/* Description */}
        <p className="description">
          This action cannot be undone. This will permanently delete your account
          and remove all your data.
        </p>

        {/* Warning box */}
        <div className="warning-box">
          <strong>⚠️ You will lose:</strong>
          <ul className="list-unstyled mb-0">
            <li>All purchased books and audiobooks</li>
            <li>Wishlist and saved items</li>
            <li>Reviews and ratings</li>
            <li>Account settings and preferences</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="actions">
          <button className="cancel-btn" onClick={onClose}>
            Cancel    
          </button>
          <button className="delete-btn" onClick={onDelete}>
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default DeletePopup;
