import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import AddBookModal from '../components/AddBookModal';
import ViewBookModal from '../components/ViewBookModal';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // This controls the spinner
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  
  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');      
  const [executedSearch, setExecutedSearch] = useState(''); 
  const [filterType, setFilterType] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true); // 1. Start Loading (Spinner appears)
      const params = {
        page: page,
        limit: 20
      };
      
      if (executedSearch) params.search = executedSearch;
      if (filterType && filterType !== 'All Types') params.type = filterType.toLowerCase();
      if (filterLanguage) {
        if (filterLanguage === 'Sinhala') params.language = 'none';
        else params.language = filterLanguage;
      }

      const res = await axiosInstance.get('/books', { params });
      
      if (res.data.success) {
        setBooks(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalBooks(res.data.pagination.total);
      }
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false); // 2. Stop Loading (Spinner disappears)
    }
  };

  useEffect(() => {
    fetchData();
  }, [executedSearch, filterType, filterLanguage, page]); 

  // --- HANDLERS ---
  
  // ✅ NEW: Reset Handler
  // This clears all inputs and forces the useEffect to re-run
  const handleReset = () => {
    setSearchQuery('');
    setExecutedSearch('');
    setFilterType('');
    setFilterLanguage('');
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        setExecutedSearch(searchQuery); 
        setPage(1); 
    }
  };

  const handleSearchClick = () => {
      setExecutedSearch(searchQuery);
      setPage(1);
  };

  const handleFilterChange = (setter, value) => {
      setter(value);
      setPage(1);
  };

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleAddNewClick = () => {
    setSelectedBook(null);
    setShowAddModal(true);
  };

  const handleEditClick = (book) => {
    setOpenMenuIndex(null);
    setSelectedBook(book); 
    setShowAddModal(true);
  };

  const handleViewClick = (book) => {
    setOpenMenuIndex(null);
    setSelectedBook(book);
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    setOpenMenuIndex(null);
    if(window.confirm("Are you sure you want to permanently delete this book?")) {
      try {
        await axiosInstance.delete(`/books/${id}`);
        fetchData(); 
      } catch (err) { 
        alert("Failed to delete: " + (err.response?.data?.message || err.message)); 
      }
    }
  };

  const handleBookSaved = () => {
    fetchData(); 
  };

  if (loading && books.length === 0) return <div className="p-5 text-center text-muted">Loading Library...</div>;

  return (
    <div className="container-fluid py-4 px-4" onClick={() => setOpenMenuIndex(null)} style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Books Management</h2>
          <p className="text-muted">Manage your book inventory ({totalBooks} Total)</p>
        </div>
        <button 
          className="btn btn-dark d-flex align-items-center px-4 py-2 rounded-3 fw-medium shadow-sm"
          onClick={handleAddNewClick}
        >
          <i className="bi bi-plus-lg me-2"></i> Add New Book
        </button>
      </div>

      <div className="card border-0 shadow-sm p-0 overflow-hidden" style={{ borderRadius: '16px' }}>
        
        {/* Toolbar */}
        <div className="p-4 bg-white border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group bg-light rounded-3 px-3 py-2 border-0">
                <button 
                    className="input-group-text bg-transparent border-0 text-muted ps-0 btn" 
                    onClick={handleSearchClick}
                    style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-search"></i>
                </button>
                <input 
                  type="text" 
                  className="form-control bg-transparent border-0 shadow-none ps-2" 
                  placeholder="Search title/author... (Press Enter)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                />
              </div>
            </div>
            
            <div className="col-md-8 d-flex justify-content-md-end gap-2 flex-wrap">
              <select 
                className="form-select bg-light border-0 px-3 py-2 rounded-3 text-muted shadow-sm" 
                style={{ width: 'auto', minWidth: '140px' }}
                value={filterType}
                onChange={(e) => handleFilterChange(setFilterType, e.target.value)}
              >
                <option value="">All Types</option>
                <option value="ebook">eBook</option>
                <option value="audiobook">Audiobook</option>
              </select>

              <select 
                className="form-select bg-light border-0 px-3 py-2 rounded-3 text-muted shadow-sm" 
                style={{ width: 'auto', minWidth: '160px' }}
                value={filterLanguage}
                onChange={(e) => handleFilterChange(setFilterLanguage, e.target.value)}
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Sinhala">Sinhala</option>
              </select>

              {/* ✅ UPDATED REFRESH/RESET BUTTON */}
              <button 
                className="btn btn-white bg-white border d-flex align-items-center justify-content-center rounded-3 text-dark fw-medium shadow-sm"
                style={{ width: '42px', height: '40px' }}
                onClick={handleReset}
                disabled={loading} // Prevent clicks while loading
                title="Reset Filters"
              >
                {loading ? (
                    // 🌀 Show Spinner when loading
                    <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></span>
                ) : (
                    // 🔄 Show Icon when idle
                    <i className="bi bi-arrow-clockwise"></i>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="table-responsive">
          <table className="table align-middle mb-0 custom-admin-table">
            <thead>
              <tr className="text-secondary">
                <th className="ps-4">BOOK</th>
                <th>GENRE</th>
                <th>PRICE</th>
                <th className="text-center">RATING</th>
                <th className="text-center">TYPE</th>
                <th className="text-end pe-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {books.length > 0 ? (
                books.map((book, i) => (
                <tr key={book._id || i}>
                  <td className="ps-4 py-4">
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary bg-opacity-10 rounded-2 me-3 d-flex align-items-center justify-content-center text-muted" style={{ width: '40px', height: '55px', flexShrink: 0, overflow: 'hidden' }}>
                          {book.coverImage ? (
                             <img src={book.coverImage} alt="cover" style={{ width:'100%', height:'100%', objectFit:'cover'}} />
                          ) : (
                             <i className="bi bi-book fs-4 opacity-50"></i>
                          )}
                      </div>
                      <div>
                        <div className="fw-bold text-dark mb-0 text-truncate" style={{maxWidth: '200px'}}>{book.title}</div>
                        <div className="text-muted small">{book.author}</div>
                      </div>
                    </div>
                  </td>

                  <td className="text-muted">{book.genre}</td>
                  <td className="fw-bold text-dark">{book.price === 0 ? 'Free' : `Rs ${book.price?.toFixed(2)}`}</td>
                  
                  <td className="text-center fw-medium">
                    <div className="d-inline-flex align-items-center px-2 py-1 rounded-3 bg-warning bg-opacity-10 text-warning">
                        <i className="bi bi-star-fill me-1" style={{ fontSize: '0.8rem' }}></i> {book.ratingStats?.average || 0}
                    </div>
                  </td>

                  <td>
                    <div className="d-flex justify-content-center">
                      <span className="status-badge" style={{ backgroundColor: book.type === 'audiobook' ? '#f43f5e' : '#6366f1', color: '#fff', justifyContent: 'center', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        <i className={`bi ${book.type === 'audiobook' ? 'bi-headphones' : 'bi-book'} me-1`}></i>
                        {book.type}
                      </span>
                    </div>
                  </td>

                  <td className="text-end pe-4 position-relative">
                    <button className="btn btn-link text-secondary p-0 shadow-none" onClick={(e) => toggleMenu(i, e)}>
                      <i className="bi bi-three-dots-vertical fs-5"></i>
                    </button>
                    
                    {openMenuIndex === i && (
                      <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow border py-2" style={{ zIndex: 1000, minWidth: '160px', right: '20px' }}>
                        <button className="dropdown-item px-3 py-2 d-flex align-items-center" onClick={() => handleViewClick(book)}>
                          <i className="bi bi-eye me-2 text-muted"></i> View Details
                        </button>
                        <button className="dropdown-item px-3 py-2 d-flex align-items-center" onClick={() => handleEditClick(book)}>
                          <i className="bi bi-pencil me-2 text-muted"></i> Edit Book
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item px-3 py-2 d-flex align-items-center text-danger" onClick={() => handleDelete(book._id)}>
                          <i className="bi bi-trash3 me-2"></i> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
             ) : (
               <tr>
                   <td colSpan="6" className="text-center py-5 text-muted">No books found.</td>
               </tr>
             )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {totalBooks > 0 && (
            <div className="d-flex justify-content-between align-items-center p-4 border-top bg-light">
                <span className="text-muted small">
                    Showing <strong>{books.length}</strong> of <strong>{totalBooks}</strong> books
                </span>
                <nav>
                    <ul className="pagination mb-0 shadow-sm">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button 
                                className="page-link border-0 text-dark fw-medium" 
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                <i className="bi bi-chevron-left small me-1"></i> Prev
                            </button>
                        </li>
                        
                        {[...Array(totalPages)].map((_, idx) => {
                            const pageNum = idx + 1;
                            if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                                return (
                                    <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                                        <button 
                                            className={`page-link border-0 fw-bold ${page === pageNum ? 'bg-dark border-dark' : 'text-muted'}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    </li>
                                );
                            } else if (pageNum === page - 2 || pageNum === page + 2) {
                                return <li key={pageNum} className="page-item disabled"><span className="page-link border-0 text-muted">...</span></li>;
                            }
                            return null;
                        })}

                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                            <button 
                                className="page-link border-0 text-dark fw-medium" 
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                            >
                                Next <i className="bi bi-chevron-right small ms-1"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}

      </div>

      <AddBookModal 
        show={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onSave={handleBookSaved}
        initialData={selectedBook}
      />

      <ViewBookModal 
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        book={selectedBook}
      />

    </div>
  );
};

export default Books;