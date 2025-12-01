import React, {useState, useRef, useEffect} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/BrandLogo.svg"; 
import ProfileMenu from "../components/ProfileMenu";

function Navbar() {

    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef(null);
    const profileIconRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          profileIconRef.current && 
          !profileIconRef.current.contains(event.target)
        ) {
          setShowProfileMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      };
    }, []);

    const handleProfileClick = () => {
      setShowProfileMenu(!showProfileMenu);
    };

    const handleProfileMouseEnter = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setShowProfileMenu(true);
    };

    const handleProfileMouseLeave = () => {
      // Start timeout when leaving profile icon
      hoverTimeoutRef.current = setTimeout(() => {
        // Only close if mouse is not over menu
        if (menuRef.current && !menuRef.current.matches(':hover')) {
          setShowProfileMenu(false);
        }
      }, 300);
    };

    const handleMenuMouseEnter = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };

    const handleMenuMouseLeave = () => {
      // Start timeout when leaving menu
      hoverTimeoutRef.current = setTimeout(() => {
        // Only close if mouse is not over profile icon
        if (profileIconRef.current && !profileIconRef.current.matches(':hover')) {
          setShowProfileMenu(false);
        }
      }, 300);
    };

  
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
            {/* Profile Icon with Menu */}
            <div className="position-relative">
              <i 
                ref={profileIconRef}
                className="bi bi-person custom-person"
                onClick={handleProfileClick}
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
                style={{ cursor: 'pointer' }}
              ></i>
              
              {/* Profile Menu */}
              {showProfileMenu && (
                <div 
                  ref={menuRef}
                  className="position-absolute end-0 mt-2"
                  style={{ zIndex: 1000 }}
                  onMouseEnter={handleMenuMouseEnter}
                  onMouseLeave={handleMenuMouseLeave}
                >
                  <ProfileMenu />
                </div>
              )}
            </div>


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


