import React, { useState, useEffect } from 'react';
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
  const [processingId, setProcessingId] = useState(null); // For loading state on buttons

  // 1. Fetch Real Data
  useEffect(() => {
    if (currentUser) {
      loadHistory();
    }
  }, [currentUser]);

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

  // 2. Handle Re-Download
  const handleRedownload = async (bookId) => {
    try {
      setProcessingId(bookId);
      const result = await downloadBookFile(bookId);
      
      if (result.success && result.data.downloadUrl) {
        window.open(result.data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert("Download failed. Access might be expired.");
    } finally {
      setProcessingId(null);
    }
  };

  // 3. Helpers for Formatting
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // 4. Filtering & Sorting Logic
  const getFilteredBooks = () => {
    let filtered = [...downloads];

    // Filter by Tab
    if (activeTab !== 'All Downloads') {
      const typeFilter = activeTab === 'Paid' ? 'purchased' : 'free';
      filtered = filtered.filter(item => item.downloadType === typeFilter);
    }

    // Sort by Date
    if (sortLabel === 'Date') {
      filtered.sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt));
    }
    
    // Sort by Today (Client side filter)
    if (sortLabel === 'Today') {
      const todayStr = new Date().toDateString();
      filtered = filtered.filter(item => new Date(item.downloadedAt).toDateString() === todayStr);
    }

    return filtered;
  };

  const filteredBooks = getFilteredBooks();

  // 5. Calculate Stats
  const hasTodayData = downloads.some(d => new Date(d.downloadedAt).toDateString() === new Date().toDateString());
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

        <div className="d-flex gap-2">
          {/* SORT DROPDOWN */}
          <div className="dropdown">
            <button 
              className="btn btn-white border shadow-sm dropdown-toggle btn-sm px-3" 
              type="button" 
              id="sortDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              Sort by {sortLabel}
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="sortDropdown">
              <li>
                <button 
                  className={`dropdown-item ${!hasTodayData ? 'disabled text-muted' : ''}`} 
                  onClick={() => setSortLabel('Today')}
                  disabled={!hasTodayData}
                >
                  Today
                </button>
              </li>
              <li><button className="dropdown-item" onClick={() => setSortLabel('Last Week')}>Last Week</button></li>
              <li><button className="dropdown-item" onClick={() => setSortLabel('Last Month')}>Last Month</button></li>
            </ul>
          </div>

          <button className="btn btn-white border shadow-sm btn-sm px-3">
            <i className="bi bi-filter me-2"></i>Filter
          </button>
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
              <span className="badge rounded-pill bg-primary-subtle text-primary ms-2 fw-normal">
                {tab === 'All Downloads' ? stats.total : (tab === 'Paid' ? stats.paid : stats.free)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Stat Cards */}
      <div className="row g-3 mb-5">
        <StatCard icon="bi-download" label="Total Downloads" value={stats.total} color="#eef2ff" iconColor="#4f46e5" />
        <StatCard icon="bi-cart3" label="Paid Books" value={stats.paid} color="#ecfdf5" iconColor="#10b981" />
        <StatCard icon="bi-book" label="Free Books" value={stats.free} color="#f5f3ff" iconColor="#8b5cf6" />
      </div>

      {/* Main Content Area */}
      {/* Main Content Area */}
      {filteredBooks.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {filteredBooks.map((item, idx) => {
            const book = item.book || {};
            const isPaid = item.downloadType === 'purchased';
            
            return (
              <div key={item._id || idx} className="card border-0 shadow-sm p-3">
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
                      <span className="text-uppercase"><i className="bi bi-file-earmark-text me-1"></i>{book.type === 'ebook' ? 'PDF' : 'Audio'}</span>
                      {/* Note: backend controller needs to select 'fileSize' in populate for this to work perfectly, otherwise pass null */}
                      <span><i className="bi bi-hdd me-1"></i>{formatFileSize(book.fileSize || 0)}</span>
                      <span><i className="bi bi-calendar3 me-1"></i>{formatDate(item.downloadedAt)}</span>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary btn-sm px-4 py-2 fw-medium shadow-sm" 
                        style={{ backgroundColor: '#2563eb' }}
                        onClick={() => handleRedownload(book._id)}
                        disabled={processingId === book._id}
                      >
                        {processingId === book._id ? (
                            <span>Loading...</span>
                        ) : (
                            <><i className="bi bi-arrow-clockwise me-2"></i>Re-download</>
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