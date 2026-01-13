import React, { useState, useEffect } from 'react';
import { fetchAllOrders } from '../../services/adminService'; 
import { cancelOrder } from '../../services/purchase.service';
import '../../styles/main.scss';

const Purchases = () => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState('');      
  const [executedSearch, setExecutedSearch] = useState(''); 

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);

  const tabs = ['All', 'Completed', 'Cancelled']; 

  useEffect(() => {
    loadData();
  }, []); 

  const loadData = async () => {
    try {
        setLoading(true);
        const res = await fetchAllOrders(); 
        if (res.success) {
            setPurchases(res.data);
        }
    } catch (error) {
        console.error("Error fetching sales history:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- HELPER: Get Style & Icon based on status ---
  const getStatusConfig = (status) => {
      const lowerStatus = status?.toLowerCase() || 'completed';
      if (lowerStatus === 'completed') {
          return { bg: '#00d25b', icon: 'bi-check-circle' };
      } else if (lowerStatus === 'cancelled') {
          return { bg: '#dc3545', icon: 'bi-x-circle' };
      } else {
          return { bg: '#6c757d', icon: 'bi-clock' }; 
      }
  };

  // --- FILTER & SEARCH LOGIC ---
  const filteredPurchases = purchases.filter(item => {
    const matchesTab = activeTab === 'All' 
        ? true 
        : (item.status || 'completed').toLowerCase() === activeTab.toLowerCase();

    const matchesSearch = executedSearch 
        ? (
            (item.simulatedOrderId || item._id).toLowerCase().includes(executedSearch.toLowerCase()) || 
            (item.user?.displayName || 'Guest').toLowerCase().includes(executedSearch.toLowerCase()) ||
            (item.user?.email || '').toLowerCase().includes(executedSearch.toLowerCase())
          )
        : true;

    return matchesTab && matchesSearch;
  });

  const ITEMS_PER_PAGE = 10;
  const currentTotalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE) || 1;
  
  const paginatedPurchases = filteredPurchases.slice(
      (page - 1) * ITEMS_PER_PAGE, 
      page * ITEMS_PER_PAGE
  );

  // --- HANDLERS ---
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

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= currentTotalPages) {
          setPage(newPage);
      }
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleTabChange = (tab) => {
      setActiveTab(tab);
      setOpenMenuIndex(null);
      setPage(1); 
  };

  const handleRefund = async (purchaseId) => {
    setOpenMenuIndex(null);
    if(!window.confirm("Are you sure you want to refund/cancel this purchase? Access to the book will be revoked.")) return;

    try {
        await cancelOrder(purchaseId);
        setPurchases(prev => 
            prev.map(item => 
                item._id === purchaseId ? { ...item, status: 'cancelled' } : item
            )
        );
        alert("Purchase cancelled and access revoked.");
    } catch (error) {
        alert("Failed to process refund: " + (error.message || "Unknown error"));
    }
  };

  const handleExport = () => {
    if (filteredPurchases.length === 0) return alert("No data to export");

    const headers = ["Transaction ID,Customer,Book Title,Format,Amount,Status,Date\n"];
    const rows = filteredPurchases.map(item => {
        return [
            item.simulatedOrderId || item._id, 
            `"${item.user?.displayName || 'Guest'}"`,
            `"${item.book?.title || 'Unknown Book'}"`,
            item.book?.type || 'ebook',
            item.amount,
            item.status || 'completed',
            new Date(item.purchasedAt).toLocaleDateString()
        ].join(",");
    });

    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border text-dark" role="status"></div>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-4" onClick={() => setOpenMenuIndex(null)} style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#333' }}>Sales & Purchases</h2>
          <p className="text-muted">Track your digital book sales ({filteredPurchases.length} Total)</p>
        </div>
        <button 
            onClick={handleExport}
            className="btn btn-white bg-white border d-flex align-items-center px-4 py-2 rounded-3 fw-medium shadow-sm"
        >
          <i className="bi bi-download me-2"></i> Export Report
        </button>
      </div>

      {/* Status Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`btn rounded-pill px-4 py-2 border-0 fw-medium transition-all ${
              activeTab === tab ? 'bg-dark text-white shadow' : 'bg-white text-muted shadow-sm'
            }`}
            style={{ minWidth: 'fit-content' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="card border-0 shadow-sm p-0 overflow-hidden" style={{ borderRadius: '16px' }}>
        
        {/* Toolbar */}
        <div className="p-4 bg-white border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
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
                    placeholder="Search Transaction ID or User... (Press Enter)" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0 custom-admin-table">
            <thead>
              <tr className="text-uppercase small text-muted">
                <th className="ps-4">Transaction ID</th>
                <th>Customer</th>
                <th>Book Title</th>
                <th className="text-center">Format</th>
                <th>Amount</th>
                <th className="text-center">Status</th>
                <th>Date</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPurchases.length > 0 ? (
                paginatedPurchases.map((item, i) => {
                  const statusConfig = getStatusConfig(item.status);

                  return (
                  <tr key={item._id || i}>
                    {/* Transaction ID */}
                    <td className="ps-4">
                        <span className="font-monospace text-muted small">
                            {item.simulatedOrderId || item._id?.substring(0,8)}
                        </span>
                    </td>
                    
                    {/* Customer */}
                    <td>
                        <div className="fw-bold text-dark">{item.user?.displayName || 'Guest'}</div>
                        <div className="small text-muted">{item.user?.email || 'N/A'}</div>
                    </td>

                    {/* Book Title */}
                    <td className="fw-medium text-dark">{item.book?.title ||item.bookInfo?.title || 'Deleted Book'}</td>
                    
                    {/* Format (eBook/Audio) */}
                    <td className="text-center">
                        {(item.book?.type || item.bookInfo?.type) === 'audiobook' ? (
                          <i className="bi bi-headphones text-danger" title="Audiobook"></i>
                      ) : (item.book?.type || item.bookInfo?.type) === 'ebook' ? (
                          <i className="bi bi-book text-primary" title="eBook"></i>
                      ) : (
                          <span className="text-muted">-</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="fw-bold text-dark">Rs {item.amount?.toFixed(2)}</td>
                    
                    {/* --- STATUS BADGE --- */}
                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center">
                        <span 
                          className="status-badge" 
                          style={{ 
                            backgroundColor: statusConfig.bg, 
                            color: '#fff', 
                            padding: '5px 12px', 
                            borderRadius: '20px', 
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <i className={`bi ${statusConfig.icon}`}></i>
                          {item.status || 'completed'}
                        </span>
                      </div>
                    </td>

                    <td className="text-muted small">{new Date(item.purchasedAt).toLocaleDateString()}</td>
                    
                    <td className="text-end pe-4 position-relative">
                      <button className="btn btn-link text-secondary p-0 shadow-none" onClick={(e) => toggleMenu(i, e)}>
                        <i className="bi bi-three-dots-vertical fs-5"></i>
                      </button>
                      
                      {openMenuIndex === i && (
                        <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow border py-2" style={{ zIndex: 1000, minWidth: '180px', right: '20px' }}>
                          <button className="dropdown-item px-3 py-2 d-flex align-items-center">
                            <i className="bi bi-receipt me-2 text-muted"></i> View Receipt
                          </button>
                          
                          {item.status !== 'cancelled' && (
                              <>
                                <div className="dropdown-divider"></div>
                                <button 
                                    className="dropdown-item px-3 py-2 d-flex align-items-center text-danger"
                                    onClick={() => handleRefund(item._id)}
                                >
                                    <i className="bi bi-arrow-counterclockwise me-2"></i> Refund & Revoke
                                </button>
                              </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-receipt fs-1 d-block mb-3 opacity-25"></i>
                    No {activeTab.toLowerCase()} purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        {filteredPurchases.length > 0 && (
            <div className="d-flex justify-content-between align-items-center p-4 border-top bg-light">
                <span className="text-muted small">
                    Showing <strong>{paginatedPurchases.length}</strong> of <strong>{filteredPurchases.length}</strong> orders
                </span>
                
                <nav>
                    <ul className="pagination mb-0 shadow-sm">
                        {/* Prev Button */}
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button 
                                className="page-link border-0 text-dark fw-medium" 
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >
                                <i className="bi bi-chevron-left small me-1"></i> Prev
                            </button>
                        </li>
                        
                        {/* Page Numbers */}
                        {[...Array(currentTotalPages)].map((_, idx) => {
                            const pageNum = idx + 1;
                            if (pageNum === 1 || pageNum === currentTotalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
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

                        {/* Next Button */}
                        <li className={`page-item ${page === currentTotalPages ? 'disabled' : ''}`}>
                            <button 
                                className="page-link border-0 text-dark fw-medium" 
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === currentTotalPages}
                            >
                                Next <i className="bi bi-chevron-right small ms-1"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}

      </div>
    </div>
  );
};

export default Purchases;