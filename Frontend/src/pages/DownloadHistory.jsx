import React, { useState, useEffect, useMemo } from 'react';
import { fetchDownloadHistory, downloadBookFile } from '../services/purchase.service';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DownloadHistory = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('All Downloads');
  const [sortLabel, setSortLabel] = useState('Date');

  // Real Data State
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Fetch Real Data
  useEffect(() => {
    if (currentUser) {
      loadHistory();
    }
  }, [currentUser]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetchDownloadHistory();
      if (response.success) {
        setDownloads(response.data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Re-Download (UPDATED: INSTANT DOWNLOAD)
  const handleRedownload = async (bookId, bookTitle, fileType) => {
    try {
      setProcessingId(bookId);
      
      // 1. Get the secure URL from backend
      const result = await downloadBookFile(bookId);
      
      if (result.success && result.data.downloadUrl) {
        // Refresh history counts immediately
        loadHistory(); 
        
        const fileUrl = result.data.downloadUrl;
        // Construct a filename if one wasn't provided
        const extension = fileType === 'audiobook' ? 'mp3' : 'pdf';
        const fileName = result.data.fileName || `${bookTitle.replace(/[^a-z0-9]/gi, '_')}.${extension}`;

        try {
            // STRATEGY A: Fetch as Blob (Forces download, No new tab)
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('Network error');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Force save
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (blobError) {
            // STRATEGY B: Fallback (Hidden iframe/anchor)
            console.warn("Blob download failed, trying direct link...", blobError);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', fileName);
            link.setAttribute('target', '_self'); // Try to keep in same tab
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Download failed. Access might be expired.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
  };

  // 3. GROUPING & PROCESSING LOGIC
  const processedDownloads = useMemo(() => {
    const groups = {};

    downloads.forEach(item => {
        if (!item.book || !item.book._id) return;

        const bookId = item.book._id;
        const itemDate = new Date(item.downloadedAt);

        if (!groups[bookId]) {
            groups[bookId] = {
                ...item,
                downloadCount: 1,
                latestDownload: itemDate
            };
        } else {
            groups[bookId].downloadCount += 1;
            if (itemDate > groups[bookId].latestDownload) {
                groups[bookId].latestDownload = itemDate;
                groups[bookId].downloadedAt = item.downloadedAt; 
            }
        }
    });

    return Object.values(groups).sort((a, b) => b.latestDownload - a.latestDownload);
  }, [downloads]);

  // 4. Filtering Logic
  const getFilteredBooks = () => {
    let filtered = [...processedDownloads];

    if (activeTab !== 'All Downloads') {
      const typeFilter = activeTab === 'Paid' ? 'purchased' : 'free';
      filtered = filtered.filter(item => item.downloadType === typeFilter);
    }

    return filtered;
  };
  const filteredBooks = getFilteredBooks();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  // Scroll to top helper
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = {
    total: downloads.length,
    paid: downloads.filter(d => d.downloadType === 'purchased').length,
    free: downloads.filter(d => d.downloadType === 'free').length
  };

  if (loading) return <div className="container py-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="container py-6" style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Download History</h2>
          <p className="text-muted small">Access all your downloaded ebooks anytime</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <ul className="nav nav-underline mb-4 border-bottom">
        {['All Downloads', 'Paid', 'Free'].map((tab) => (
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

      {/* Stat Cards */}
      <div className="row g-3 mb-5">
        <StatCard icon="bi-download" label="Total Downloads" value={stats.total} color="#eef2ff" iconColor="#4f46e5" />
        <StatCard icon="bi-cart3" label="Paid Downloads" value={stats.paid} color="#ecfdf5" iconColor="#10b981" />
        <StatCard icon="bi-book" label="Free Downloads" value={stats.free} color="#f5f3ff" iconColor="#8b5cf6" />
      </div>

      {/* Main Content Area */}
      {currentBooks.length > 0 ? (
        <>
        <div className="d-flex flex-column gap-3">
          {currentBooks.map((item) => {
            const book = item.book || {};
            const isPaid = item.downloadType === 'purchased';
            
            return (
              <div key={book._id} className="card border-0 shadow-sm p-3">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div className="rounded bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '80px', height: '110px' }}>
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="bi bi-image text-secondary opacity-25 fs-1"></i>
                      )}
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="fw-bold mb-0">{book.title || 'Unknown Title'}</h5>
                      <span className={`badge px-3 py-2 fw-normal border ${isPaid ? 'bg-success-subtle text-success border-success-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'}`}>
                        {isPaid ? 'Paid' : 'Free'}
                      </span>
                    </div>
                    <p className="text-muted small mb-3">{book.author || 'Unknown Author'}</p>
                    
                    <div className="d-flex gap-4 text-muted small mb-3">
                      <span className="text-uppercase"><i className="bi bi-file-earmark-text me-1"></i>{book.type === 'ebook' ? 'PDF' : 'MP3'}</span>
                      
                      {/* Last Download Date */}
                      <span title="Most recent download">
                        <i className="bi bi-calendar3 me-1"></i>
                        {formatDate(item.downloadedAt)}
                      </span>

                      {/* Download Count Badge */}
                      <span className="text-primary fw-medium" title="Total times downloaded">
                         <i className="bi bi-arrow-repeat me-1"></i>
                         Downloaded {item.downloadCount} time{item.downloadCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary px-4 py-2 fw-medium shadow-sm" 
                        style={{ backgroundColor: '#2563eb' }}
                        // UPDATED: Pass book details to handleRedownload
                        onClick={() => handleRedownload(book._id, book.title, book.type)}
                        disabled={processingId === book._id}
                      >
                        {processingId === book._id ? (
                            <span>Loading...</span>
                        ) : (
                            <><i className="bi bi-download me-2"></i>Download Again</>
                        )}
                      </button>
                      <Link to={`/books/${book._id}`} className="btn btn-outline-secondary px-4 py-2 fw-medium text-decoration-none">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      
        


        {filteredBooks.length > itemsPerPage && (
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
          <i className="bi bi-cloud-slash display-1 text-muted opacity-25"></i>
          <h4 className="fw-bold mt-3">Oops, nothing here!</h4>
          <p className="text-muted">There are no {activeTab === 'All Downloads' ? '' : activeTab.toLowerCase()} books in your library yet.</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, iconColor }) => (
  <div className="col-md-4">
    <div className="card border-0 shadow-sm p-3 h-100">
      <div className="d-flex align-items-center gap-3">
        <div className="rounded-3 d-flex align-items-center justify-content-center" 
             style={{ width: '56px', height: '56px', backgroundColor: color, color: iconColor }}>
          <i className={`bi ${icon} fs-4`}></i>
        </div>
        <div>
          <div className="text-muted small fw-medium">{label}</div>
          <div className="h4 fw-bold mb-0">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

export default DownloadHistory;