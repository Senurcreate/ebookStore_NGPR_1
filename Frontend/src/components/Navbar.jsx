import React from "react";


function Navbar() {
  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="navbar-logo">
        <img src="/icon.svg" alt="Ayod Ebookstore" />
        <span>Ayod <strong>Ebookstore</strong></span>
        

      </div>

      {/* Center: Links */}
      <ul className="navbar-links">
        <li>Home</li>
        <li>E-Books</li>
        <li>AudioBooks</li>
        <li>Help</li>
      </ul>

      {/* Right: Search + Icons */}
      <div className="navbar-actions">
        <div className="search-wrapper">
          <input
          type="text"
          placeholder="Search books, authors, genres"
        />
        <i className="bi bi-search search-icon"></i>
        </div>
        
        <i className="bi bi-bell-fill custom-icon"></i>
        <i className="bi bi-cart-fill custom-icon"></i>
        <i className="bi bi-person-circle custom-icon"></i>
      </div>
    </nav>
  );
}

export default Navbar;