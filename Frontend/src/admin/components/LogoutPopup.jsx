import React from 'react';

const LogoutModal = ({ show, onClose, onConfirm }) => {
  // If 'show' is false, render nothing
  if (!show) return null;

  return (
    <>
      {/* Backdrop Overlay (Dims the background) */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1040 }}
        onClick={onClose} // Clicking outside closes it
      ></div>

      {/*  Modal Dialog */}
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        role="dialog" 
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow">
            
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fw-bold text-dark">Confirm Logout</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            
            <div className="modal-body text-secondary">
              <p>Are you sure you want to log out of the <strong>Admin Dashboard</strong>?</p>
            </div>
            
            <div className="modal-footer border-top-0 pt-0">
              <button 
                type="button" 
                className="btn btn-light px-4" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger px-4" 
                onClick={onConfirm}
              >
                Yes, Logout
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;