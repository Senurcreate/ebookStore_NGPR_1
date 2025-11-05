import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/BrandLogo.svg"; // adjust path if needed

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg fixed-top shadow-sm custom-navbar ">
      <div className="container-fluid px-4">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="#">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </a>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links and actions */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Center links */}
          <ul className="navbar-nav ms-4 me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link fw-medium text-dark" href="#">Home</a>
            </li>
            <li className="nav-item font-family-sans-serif">
              <a className="nav-link fw-medium text-dark" href="#">About</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium text-dark" href="#">Services</a>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-medium text-dark" href="#">Contact</a>
            </li>
          </ul>

          {/* Right actions */}
          <div className="d-flex align-items-center gap-3 ">
            {/* Search box */}
            <div className="position-relative search-wrapper me-5">
              <input
                type="text"
                placeholder="Search books, authors, genres..."
                className="form-control ps-3 pe-5"
              />
              <i className="bi bi-search search-icon"></i>
            </div>
            
            {/* Icons */}
            <i className="bi bi-bell custom-icon me-2"></i>
            <i className="bi bi-cart custom-icon me-2"></i>
            <i className="bi bi-person custom-person"></i>

             {/*}
            <div className="profile-circle">
              <img src="/path/to/default-avatar.jpg" alt="User" />
            </div>*/}
          
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


{/*import React from "react";
import Logo from "../assets/BrandLogo.svg";

function Navbar() {
  return (
    <nav className="navbar">
      
      <div className="navbar-logo"
      style={{ backgroundImage: `url(${Logo})` }}>
      </div>

    
      <ul className="navbar-links">
        <li>Home</li>
        <li>E-Books</li>
        <li>AudioBooks</li>
        <li>Help</li>
      </ul>

     
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

*/}