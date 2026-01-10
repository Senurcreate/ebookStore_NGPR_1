import React from 'react';

const ViewBookModal = ({ show, onClose, book }) => {
  if (!show || !book) return null;

  // Helper to handle "none" language case for Sinhala books
  const displayLanguage = (book.language === 'none') ? 'Sinhala' : book.language;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            
            {/* Header */}
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">Book Details</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              <div className="row g-4">
                
                {/* --- Left Column: Cover Image & Type --- */}
                <div className="col-md-4 text-center">
                  <div className="rounded-3 overflow-hidden shadow-sm mb-3 position-relative bg-light" style={{ minHeight: '300px' }}>
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="img-fluid w-100 h-100 object-fit-cover" />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 p-5 text-muted">
                        <i className="bi bi-book display-1"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Type Badge (eBook/Audio) */}
                  <span className={`badge ${book.type === 'audiobook' ? 'bg-danger' : 'bg-primary'} px-3 py-2 rounded-pill shadow-sm`}>
                    <i className={`bi ${book.type === 'audiobook' ? 'bi-headphones' : 'bi-book'} me-2`}></i>
                    {book.type === 'audiobook' ? 'Audiobook' : 'eBook'}
                  </span>
                </div>

                {/* --- Right Column: Details --- */}
                <div className="col-md-8">
                  {/* Title & Author */}
                  <h3 className="fw-bold mb-1 text-dark">{book.title}</h3>
                  <p className="text-muted fs-5 mb-3">by <span className="fw-medium text-dark">{book.author}</span></p>

                  {/* Badges Container - Fixed Alignment  */}
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-4 w-100">
                    <span className="badge bg-light text-dark border d-flex align-items-center px-3 py-2">
                        <i className="bi bi-tag-fill me-2 text-secondary"></i> {book.genre}
                    </span>
                    
                    <span className="badge bg-light text-dark border d-flex align-items-center px-3 py-2">
                        <i className="bi bi-translate me-2 text-secondary"></i> {displayLanguage}
                    </span>
                    
                    {book.trending && (
                        <span className="badge bg-warning text-dark d-flex align-items-center px-3 py-2">
                            <i className="bi bi-lightning-fill me-2"></i> Trending
                        </span>
                    )}
                  </div>

                  {/* Metadata Grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-6 col-sm-4">
                      <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Price</small>
                      <div className="fw-bold fs-5 text-dark mt-1">{book.price === 0 ? 'Free' : `$${book.price?.toFixed(2)}`}</div>
                    </div>
                    
                    <div className="col-6 col-sm-4">
                      <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Rating</small>
                      <div className="fw-bold text-warning mt-1">
                          <i className="bi bi-star-fill me-1"></i> {book.ratingStats?.average || 0} <span className="text-muted fw-normal small">/ 5.0</span>
                      </div>
                    </div>
                    
                    <div className="col-6 col-sm-4">
                      <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Publisher</small>
                      <div className="fw-medium text-dark mt-1 text-truncate" title={book.publisher}>{book.publisher}</div>
                    </div>
                    
                    <div className="col-6 col-sm-4">
                      <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Published</small>
                      <div className="fw-medium text-dark mt-1">{new Date(book.publication_date).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="col-6 col-sm-4">
                      <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>ISBN</small>
                      <div className="fw-medium text-dark font-monospace mt-1">{book.isbn}</div>
                    </div>
                    
                    {book.type === 'ebook' ? (
                        <div className="col-6 col-sm-4">
                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Pages</small>
                            <div className="fw-medium text-dark mt-1">{book.pages}</div>
                        </div>
                    ) : (
                        <div className="col-6 col-sm-4">
                            <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.75rem'}}>Duration</small>
                            <div className="fw-medium text-dark mt-1">{book.audioLength}</div>
                        </div>
                    )}
                  </div>

                  {/* Description Box */}
                  <div className="bg-light p-3 rounded-3 mb-3 border">
                    <h6 className="fw-bold mb-2 text-dark" style={{fontSize: '0.9rem'}}>Description</h6>
                    <p className="text-secondary small mb-0" style={{ lineHeight: '1.6' }}>{book.description}</p>
                  </div>

                  {/* Narrator Info (Audiobook Only) */}
                  {book.type === 'audiobook' && book.narrators && (
                    <div className="mb-3 d-flex align-items-center text-muted small">
                        <i className="bi bi-mic-fill me-2"></i>
                        <span>Narrated by: <span className="fw-medium text-dark">{book.narrators.map(n => n.name).join(', ')}</span></span>
                    </div>
                  )}
                  
                  {/* Action Button */}
                  <div className="d-grid mt-4">
                    <a href={book.cloudinaryUrl} target="_blank" rel="noreferrer" className="btn btn-outline-dark fw-medium py-2">
                        <i className="bi bi-cloud-download me-2"></i> View Source File
                    </a>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewBookModal;