import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../assets/BrandLogo.svg";
import ProfileMenu from "../components/ProfileMenu";
import LogoutModal from "../components/LogoutModal";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");

  const menuRef = useRef(null);
  const profileIconRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useSelector((state) => state.cart.cartCount);

  // --- SMART SEARCH HANDLER ---
  const handleSearch = (e) => {
    // Trigger on 'Enter' key or Click
    if ((e.type === 'keydown' && e.key === 'Enter') || e.type === 'click') {
        e.preventDefault();
        
        const rawQuery = searchQuery.trim();
        if (!rawQuery) return;

        const lowerQuery = rawQuery.toLowerCase();
        let targetPath = '/e-books'; // Default
        let finalSearchTerm = rawQuery;

        // Check if user is ALREADY on audiobooks (keep them there unless they specify otherwise)
        if (location.pathname.includes('/audiobooks')) {
            targetPath = '/audiobooks';
        }

        // DETECT INTENT: Did they type "audiobook"?
        // Example: "horror audiobooks" -> Go to /audiobooks, search for "horror"
        if (lowerQuery.includes('audiobook') || lowerQuery.includes('audio book')) {
            targetPath = '/audiobooks';
            // Remove the word "audiobook" so we don't restrict results unnecessarily
            finalSearchTerm = rawQuery.replace(/audio\s?books?/gi, '').trim();
        } 
        // DETECT INTENT: Did they type "ebook"?
        else if (lowerQuery.includes('ebook') || lowerQuery.includes('e-book')) {
            targetPath = '/e-books';
            finalSearchTerm = rawQuery.replace(/e-?books?/gi, '').trim();
        }

        //  Navigate
        // If the user just typed "Audiobooks" (and finalSearchTerm is empty), just go to the page
        if (!finalSearchTerm) {
             navigate(targetPath);
        } else {
             navigate(`${targetPath}?search=${encodeURIComponent(finalSearchTerm)}`);
        }
    }
  };

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowProfileMenu(true);
  };

  const handleProfileMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (menuRef.current && !menuRef.current.matches(":hover")) {
        setShowProfileMenu(false);
      }
    }, 300);
  };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg fixed-top shadow-sm custom-navbar ">
        <div className="container-fluid px-4">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>

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

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-4 me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/">Home</Link>
              </li>
              <li className="nav-item font-family-sans-serif">
                <Link className="nav-link fw-medium" to="/e-books">E-books</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/audiobooks">Audiobooks</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/help">Help</Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3 ">
              <div className="position-relative search-wrapper me-5">
                <input
                  type="text"
                  placeholder="Search books, authors..."
                  className="form-control ps-3 pe-5"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
                <i 
                  className="bi bi-search search-icon" 
                  style={{cursor: 'pointer'}}
                  onClick={handleSearch}
                ></i>
              </div>

              {currentUser ? (
                <>
                  <Link to="/checkout" className="position-relative me-2 text-decoration-none text-dark">
                    <i className="bi bi-cart custom-icon"></i>
                    {cartCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{
                          fontSize: "0.65rem",
                          padding: "0.25em 0.5em",
                          minWidth: "1.25rem",
                          animation: cartCount > 0 ? "cartBounce 0.5s" : "none",
                        }}
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>

                  <div className="position-relative">
                    <i
                      ref={profileIconRef}
                      className="bi bi-person custom-person fs-4"
                      onMouseEnter={handleProfileMouseEnter}
                      onMouseLeave={handleProfileMouseLeave}
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      style={{ cursor: "pointer" }}
                    ></i>

                    {showProfileMenu && (
                      <div
                        ref={menuRef}
                        className="position-absolute end-0 mt-2"
                        style={{ zIndex: 1000 }}
                        onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
                        onMouseLeave={handleProfileMouseLeave}
                      >
                        <ProfileMenu onSignOutClick={handleLogoutClick} />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn btn-outline-dark btn-sm fw-bold">Sign In</Link>
                  <Link to="/signup" className="btn btn-dark btn-sm fw-bold">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

export default Navbar;