import React, { useState } from 'react';


const DownloadHistory = () => {
  const [activeTab, setActiveTab] = useState('Paid');
  const [sortLabel, setSortLabel] = useState('Date');

  // Mock Data: Using a specific date format to match logic
  const [books] = useState([
    { id: 1, title: 'Atomic Habits', author: 'James Clear', type: 'Paid', price: '$24.99', format: 'EPUB', size: '2.4 MB', date: 'Dec 5, 2024' },
    { id: 2, title: 'Atomic Habits', author: 'James Clear', type: 'Paid', price: '$24.99', format: 'EPUB', size: '2.4 MB', date: 'Dec 5, 2024' },
    { id: 3, title: 'Deep Work', author: 'Cal Newport', type: 'Free', price: 'Free', format: 'PDF', size: '1.8 MB', date: 'Oct 12, 2024' },
    { id: 4, title: 'Deep Work', author: 'Cal Newport', type: 'Free', price: 'Free', format: 'PDF', size: '1.8 MB', date: 'Dec 17, 2025' },
  ]);

  // Check if "Today" exists in the data to toggle disabled state
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const hasTodayData = books.some(book => book.date === todayStr);

  const filteredBooks = books.filter(book => 
    activeTab === 'All Downloads' ? true : book.type === activeTab
  );

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
                {tab === 'All Downloads' ? books.length : books.filter(b => b.type === tab).length}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Stat Cards */}
      <div className="row g-3 mb-5">
        <StatCard icon="bi-download" label="Total Downloads" value={books.length} color="#eef2ff" iconColor="#4f46e5" />
        <StatCard icon="bi-cart3" label="Paid Books" value={books.filter(b => b.type === 'Paid').length} color="#ecfdf5" iconColor="#10b981" />
        <StatCard icon="bi-book" label="Free Books" value={books.filter(b => b.type === 'Free').length} color="#f5f3ff" iconColor="#8b5cf6" />
      </div>

      {/* Main Content Area */}
      {filteredBooks.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {filteredBooks.map((book, idx) => (
            <div key={idx} className="card border-0 shadow-sm p-3">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div className="rounded bg-light d-flex align-items-center justify-content-center" style={{ width: '80px', height: '110px' }}>
                    <i className="bi bi-image text-secondary opacity-25 fs-1"></i>
                  </div>
                </div>
                <div className="col">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="fw-bold mb-0">{book.title}</h5>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-normal">
                      Paid {book.price}
                    </span>
                  </div>
                  <p className="text-muted small mb-3">{book.author}</p>
                  <div className="d-flex gap-4 text-muted small mb-3">
                    <span><i className="bi bi-file-earmark-text me-1"></i>{book.format}</span>
                    <span><i className="bi bi-hdd me-1"></i>{book.size}</span>
                    <span><i className="bi bi-calendar3 me-1"></i>{book.date}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary btn-sm px-4 py-2 fw-medium shadow-sm" style={{ backgroundColor: '#2563eb' }}>
                      <i className="bi bi-arrow-clockwise me-2"></i>Re-download
                    </button>
                    <button className="btn btn-outline-secondary px-4 py-2 fw-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 mt-5">
          <i className="bi bi-cloud-slash display-1 text-muted opacity-25"></i>
          <h4 className="fw-bold mt-3">Oops, nothing here!</h4>
          <p className="text-muted">There are no {activeTab.toLowerCase()} books in your library yet.</p>
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