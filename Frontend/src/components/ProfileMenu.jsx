import React from 'react';
import "../styles/main.scss";
import { Link } from 'react-router-dom';

function ProfileMenu() {
  return (
    <div className="profile-menu border rounded shadow-sm p-3 bg-white" style={{ width: '250px' }}>
      <ul className="list-unstyled m-0">
        <li className="menu-item py-2 px-3">
          <Link to="/catogeries" className="d-flex align-items-center text-decoration-none text-dark">
          <i className="bi bi-book me-2"></i> Categories
          </Link>
        </li>
        <li className="menu-item py-2 px-3">
          <Link to="/wishlist" className="d-flex align-items-center text-decoration-none text-dark">
          <i className="bi bi-heart me-2"></i> Wishlist
          </Link>
        </li>
        <li className="menu-item py-2 px-3">
          <Link to="/history" className="d-flex align-items-center text-decoration-none text-dark">
          <i className="bi bi-clock-history me-2"></i> History
          </Link>
        </li>
        <li className="menu-item py-2 px-3">
          <Link to="/profile" className="d-flex align-items-center text-decoration-none text-dark">
          <i className="bi bi-person me-2"></i> Account
          </Link>
        </li>
        <li className="menu-item py-2 px-3">

          <i className="bi bi-box-arrow-right me-2"></i> Sign Out
        </li>
      </ul>
    </div>
  );
}

export default ProfileMenu;