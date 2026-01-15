import React from "react";
import "../styles/main.scss";
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import footerLogo from '../assets/footer-logo.svg';
import facebook from '../assets/footer-icons/facebook.svg';
import telegram from '../assets/footer-icons/telegram.svg';
import twitter from '../assets/footer-icons/twitter.svg';
import instagram from '../assets/footer-icons/instagram.svg';


const Footer = () => {
  return (
    <footer className="footer">
    <div className="footer-container">
        {/* Left Section */}
        <div className="footer-left">
          <div className="footer-logo">
            <img src={footerLogo} alt="Ayod Logo" />
          </div>
         
        </div>

        {/* Middle Section */}
        <div className="footer-nav">
          <a href="/">Home</a>
          <a href="/e-books">E-Books</a>
          <a href="/audiobooks">Audiobooks</a>
          <a href="/help">Help</a>
        </div>

        {/* Right Section */}
        <div className="footer-right">
          <h3>Contact Us</h3>
          <p className="mb-2"><HiOutlineLocationMarker className="me-2"/> No. 09 Pepiliyana Rd, Nugegoda</p>
         <div className="contact-info-footer">
            <div><HiOutlineMail className="me-2"/> info@ayod.lk</div>
            <div><HiOutlinePhone className="me-2"/> 071 123 4567</div>
         </div> 
        </div>
        </div>
        
        <div className="footer-separator"></div>

      <div className="footer-bottom">
         <div className="social-icons">
              <a href="#">
                <img src={facebook} alt="Facebook" />
              </a>
              <a href="#">
                <img src={twitter} alt="Twitter" />
              </a>
              <a href="#">
                <img src={telegram} alt="Telegram" />
              </a>
              <a href="#">
                <img src={instagram} alt="Instagram" />
              </a>
          </div>
       
        <div className="footer-links">
          <div>© 2025 All Rights Reserved</div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
