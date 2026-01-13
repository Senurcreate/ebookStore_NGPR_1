import React, { useState, useEffect } from 'react';
import { fetchMyPurchases } from '../services/purchase.service';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('All Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Change this number to show more/less books per page

  useEffect(() => {
    if (currentUser) {
      loadOrders();
    }
  }, [currentUser]);

  // --- Reset to page 1 when tab changes ---
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchMyPurchases();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const getFilteredOrders = () => {
    if (activeTab === 'All Orders') return orders;
    if (activeTab === 'eBooks') return orders.filter(o => o.book?.type === 'ebook');
    if (activeTab === 'Audiobooks') return orders.filter(o => o.book?.type === 'audiobook');
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  // --- Pagination Calculation ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Scroll to top when page changes (optional smooth UX)
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="container py-5 text-center" style={{minHeight: '60vh'}}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="container py-5" style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 mt-4 text-start">My Orders</h2>
          <p className="text-muted small">Manage your purchased books</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-underline mb-4 border-bottom">
        {['All Orders', 'eBooks', 'Audiobooks'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button 
              className={`nav-link border-0 px-4 ${activeTab === tab ? 'active fw-bold text-primary' : 'text-muted'}`}
              onClick={() => setActiveTab(tab)}
              style={{ background: 'none' }}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      {/* Orders List - UPDATED: Mapping 'currentItems' instead of 'filteredOrders' */}
      {currentItems.length > 0 ? (
        <>
          <div className="d-flex flex-column gap-3">
            {currentItems.map((order) => {
              const book = order.book || {};
              if (!book._id) return null; 

              const isDownloaded = order.downloadTracking?.downloadsUsed > 0;

              return (
                <div key={order._id} className="card border-0 shadow-sm p-3">
                  <div className="row align-items-center">
                    
                    {/* Cover Image */}
                    <div className="col-auto">
                      <div className="rounded bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '80px', height: '110px' }}>
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <i className="bi bi-book text-secondary opacity-25 fs-1"></i>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="col">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="d-flex align-items-center gap-5">
                            <h5 className="fw-bold mb-0">{book.title || 'Unknown Title'}</h5>
                            
                            {isDownloaded && (
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill" style={{fontSize: '0.7rem'}}>
                                <i className="bi bi-check-circle-fill me-1"></i> Downloaded
                              </span>
                            )}
                          </div>
                          <p className="text-muted small mb-0 mt-1">Order: <span className="font-monospace">{order._id.slice(-8).toUpperCase()}</span></p>
                        </div>
                        
                        <div className="text-end">
                          <div className="fw-bold">Rs {order.amount?.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="d-flex gap-4 text-muted small mb-3">
                        <span><i className="bi bi-calendar3 me-1"></i> {formatDate(order.purchasedAt)}</span>
                        <span className="text-uppercase"><i className="bi bi-file-earmark me-1"></i> {book.type}</span>
                      </div>

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        {order.status === 'completed' && (
                          <Link to={`/books/${book._id}`} className="btn btn-primary btn-sm px-4 fw-medium">
                            {isDownloaded ? (
                              <><i className="bi bi-cloud-download me-2"></i>Download Again</>
                            ) : (
                              <><i className="bi bi-cloud-arrow-down me-2"></i>Download</>
                            )}
                          </Link>
                        )}
                        <Link to={`/books/${book._id}`} className="btn btn-outline-secondary px-4 fw-medium">
                          View Details
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* --- NEW: Pagination Controls --- */}
          {filteredOrders.length > itemsPerPage && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination">
                {/* Previous Button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)} aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </button>
                </li>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(index + 1)}>
                      {index + 1}
                    </button>
                  </li>
                ))}

                {/* Next Button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage + 1)} aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-5 mt-5">
          <i className="bi bi-book display-1 text-muted opacity-25"></i>
          <h4 className="fw-bold mt-3">Your library is empty</h4>
          <p className="text-muted">You haven't purchased any books yet.</p>
          <Link to="/" className="btn btn-primary mt-2">Browse Store</Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;