import React from "react";
import "./Footer.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaPaperPlane } from "react-icons/fa";
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";

const Footer = () => {
  return (
    <footer className="footer">
    <div className="footer-container">
        {/* Left Section */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src="/src/assets/footer-logo.svg" alt="Ayod Logo" />
          </div>
         
        </div>

        {/* Middle Section */}
        <div className="footer-nav">
          <a href="#">Home</a>
          <a href="#">E-Books</a>
          <a href="#">Audiobooks</a>
          <a href="#">Help</a>
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <h3>Contact Us</h3>
          <p><HiOutlineLocationMarker /> No. 09 Pepiliyana Rd, Nugegoda</p>
          <p><HiOutlineMail /> info@ayod.lk</p>
          <p><HiOutlinePhone /> 071 123 4567</p>
        </div>
      
    </div>
      <div className="footer-bottom">
         <div className="social-icons">
            <FaFacebookF />
            <FaTwitter />
            <FaPaperPlane />
            <FaInstagram />
          </div>
       
        <div className="footer-links">
           <p>© 2025 All Rights Reserved</p>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
