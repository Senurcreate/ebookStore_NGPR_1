import React from 'react'; 
import { Link } from 'react-router-dom'; 
import Navbar from '../../components/Navbar'; 
 
 
function NotFound() { 
  return ( 
    <> 
      <Navbar /> 
      <div className="notfound-page"> 
        <div className="notfound-container"> 
          {/* Large 404 with overlapping card */} 
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
            <p className="paragraph-1"> 
              It looks like this page has been checked out or doesn't exist in our library. 
            </p> 
            <p className="paragraph-2"> 
              The book you're looking for might have been moved, removed, or is temporarily 
unavailable. 
            </p> 
          </div> 
 
          {/* Search form */} 
          <form className="search-form" onSubmit={(e) => e.preventDefault()}> 
            <input 
              type="text" 
              className="search-input-main" 
              placeholder="Search for books, authors, or genres..." 
            /> 
            <button type="submit" className="search-btn"> 
              <i className="bi bi-search"></i> 
            </button> 
          </form> 
 
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