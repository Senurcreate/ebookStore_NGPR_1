import React from 'react'; 
import { Link } from 'react-router-dom'; 
import Navbar from '../components/Navbar'; 
import '../styles/main.scss'; 
 
function NotFound() { 
  return ( 
    <> 
      <Navbar /> 
      <div className="notfound-page"> 
        <div className="notfound-container">  
          <div className="error-display"> 
            <h1 className="error-code">404</h1> 
            <div className="error-card"> 
              <i className="bi bi-book error-icon"></i> 
              <p className="card-text">Page Not Found</p> 
            </div> 
          </div> 
 
          {/* Text content */} 
          <div className="text-content"> 
            <h2 className="heading-2">Oops! This Chapter is Missing</h2> 
            <p className="paragraph-1 text-bold"> 
              It looks like this page has been checked out or doesn't exist in our library. 
            </p> 
            <p className="paragraph-2"> 
              The book you're looking for might have been moved, removed, or is temporarily 
unavailable. 
            </p> 
          </div> 
 
          {/* Action buttons */} 
          <div className="button-group"> 
            <Link to="/" className="btn btn-primary-custom"> 
              <i className="bi bi-house-door"></i> 
              Back to Home 
            </Link> 
            <Link to="/e-books" className="btn btn-secondary-custom"> 
              <i className="bi bi-book"></i> 
              Browse All Books 
            </Link> 
          </div> 
        </div> 
      </div> 
    </> 
  ); 
} 
 
export default NotFound;