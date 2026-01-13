import React, { useState, useEffect } from 'react';
import '../../styles/main.scss';
import { 
    fetchModerationQueue, 
    approveReview, 
    deleteReview, 
    toggleHideReview,
    fetchAllReviews 
} from '../../services/review.service';
import { suspendUser } from '../../services/adminService';

const Reviews = () => {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [filter, setFilter] = useState('All Reviews');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
        let data = [];
        
        if (filter === 'All Reviews') {
            const res = await fetchAllReviews();
            if (res.success) data = res.data;
        } else {
            const res = await fetchModerationQueue();
            if (res.success) {
                const reported = res.moderation?.reportedReviews || [];
                const hidden = res.moderation?.hiddenReviews || [];
                const reviewMap = new Map();
                [...reported, ...hidden].forEach(r => reviewMap.set(r._id, r));
                data = Array.from(reviewMap.values());
            }
        }
        
        setReviews(data);
    } catch (error) {
        console.error("Error loading reviews:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleApprove = async (id) => {
    if(!window.confirm("Clear all reports for this review?")) return;
    try {
        await approveReview(id);
        setReviews(prev => prev.map(r => r._id === id ? { ...r, reports: [] } : r));
        setOpenMenuIndex(null);
    } catch (error) {
        alert("Failed to approve review");
    }
  };

  const handleToggleHide = async (id, currentStatus) => {
    try {
        await toggleHideReview(id, !currentStatus);
        setReviews(prev => prev.map(r => r._id === id ? { ...r, isHidden: !currentStatus } : r));
        setOpenMenuIndex(null);
    } catch (error) {
        alert("Failed to update visibility");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently delete this review?")) return;
    try {
        await deleteReview(id);
        setReviews(prev => prev.filter(r => r._id !== id));
        setOpenMenuIndex(null);
    } catch (error) {
        alert("Failed to delete review");
    }
  };

  const handleSuspendUser = async (userId, userName) => {
    if (!userId) return alert("Error: User ID missing");
    if (!window.confirm(`Are you sure you want to SUSPEND user "${userName}"?`)) return;

    try {
        await suspendUser(userId, true);
        alert(`User "${userName}" has been suspended.`);
        setOpenMenuIndex(null);
    } catch (error) {
        alert("Failed to suspend user: " + (error.message || "Unknown error"));
    }
  };

  // --- STAR RENDERER ---
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => {
      // Logic for half stars and full stars
      const starValue = i + 1;
      let starClass = 'bi-star'; // Default empty star

      if (rating >= starValue) {
        starClass = 'bi-star-fill'; // Full star
      } else if (rating >= starValue - 0.5) {
        starClass = 'bi-star-half'; // Half star
      }

      return (
        <i 
          key={i} 
          className={`bi ${starClass} text-warning me-1`} 
          style={{ fontSize: '0.9rem' }}
        ></i>
      );
    });
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuIndex(openMenuIndex === id ? null : id);
  };

  const filteredReviews = reviews.filter(review => {
      if (filter === 'Reported') return review.reports && review.reports.length > 0;
      if (filter === 'Hidden') return review.isHidden;
      return true; 
  });

  if (loading) return <div className="p-5 text-center text-muted">Loading Reviews...</div>;

  return (
    <div className="container-fluid py-4 px-4" onClick={() => setOpenMenuIndex(null)} style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Reviews Management</h2>
          <p className="text-muted">Moderate and manage customer reviews</p>
        </div>
        <div style={{ width: '200px' }}>
          <select 
            className="form-select bg-light border px-3 py-2 rounded-3 shadow-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All Reviews</option>
            <option>Reported</option>
            <option>Hidden</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="d-flex flex-column gap-3">
        {filteredReviews.length > 0 ? filteredReviews.map((review) => (
          <div 
            key={review._id} 
            className="card border-0 shadow-sm p-4 position-relative" 
            style={{ 
                borderRadius: '16px',
                overflow: 'visible',
                zIndex: openMenuIndex === review._id ? 100 : 1
            }}
          >
            
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="d-flex align-items-center gap-3">
                <img 
                    src={review.user?.photoURL || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                    alt="user" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                    <h6 className="fw-bold mb-0">{review.user?.displayName || 'Anonymous'}</h6>
                    <div className="d-flex small text-muted align-items-center">
                        <div className="d-flex me-2">{renderStars(review.rating)}</div>
                        <span>• {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center">
                    <span 
                    className="status-badge shadow-sm" 
                    style={{ 
                        backgroundColor: review.isHidden ? '#dc3545' : (review.reports?.length > 0 ? '#ffc107' : '#e9ecef'), 
                        color: review.isHidden ? '#fff' : (review.reports?.length > 0 ? '#000' : '#000'),
                        border: 'none',
                        minWidth: '110px',
                        height: '32px',
                        borderRadius: '50px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                    }}
                    >
                    <i className={`bi ${review.isHidden ? 'bi-eye-slash' : (review.reports?.length > 0 ? 'bi-flag-fill' : 'bi-check-circle')} me-2`}></i>
                    {review.isHidden ? 'Hidden' : (review.reports?.length > 0 ? 'Reported' : 'Active')}
                    </span>
                </div>

                <div className="position-relative">
                    <button 
                        className="btn btn-link text-secondary p-0 shadow-none" 
                        onClick={(e) => toggleMenu(review._id, e)}
                    >
                        <i className="bi bi-three-dots-vertical fs-5"></i>
                    </button>

                    {openMenuIndex === review._id && (
                    <div 
                        className="custom-action-menu shadow border" 
                        style={{ 
                            position: 'absolute',
                            right: '0', 
                            top: '100%', 
                            zIndex: 1000, 
                            backgroundColor: 'white', 
                            borderRadius: '8px', 
                            minWidth: '180px', 
                            padding: '8px 0',
                            marginTop: '5px'
                        }}
                    >
                        <button className="dropdown-item px-3 py-2 d-flex align-items-center" onClick={() => handleApprove(review._id)}>
                            <i className="bi bi-check2-all me-3 text-success"></i> Approve
                        </button>
                        
                        <button className="dropdown-item px-3 py-2 d-flex align-items-center" onClick={() => handleToggleHide(review._id, review.isHidden)}>
                            <i className={`bi ${review.isHidden ? 'bi-eye' : 'bi-eye-slash'} me-3 text-warning`}></i> 
                            {review.isHidden ? 'Unhide' : 'Hide'}
                        </button>

                        <hr className="my-1 mx-2 opacity-25" />

                        <button className="dropdown-item px-3 py-2 d-flex align-items-center text-danger" onClick={() => handleSuspendUser(review.user?._id, review.user?.displayName)}>
                            <i className="bi bi-person-slash me-3"></i> Suspend User
                        </button>
                        
                        <button className="dropdown-item px-3 py-2 d-flex align-items-center text-danger" onClick={() => handleDelete(review._id)}>
                            <i className="bi bi-trash3 me-3"></i> Delete
                        </button>
                    </div>
                    )}
                </div>
              </div>
            </div>

            <div className="mb-2 mt-2">
              <span className="text-muted small fw-medium">Book: </span>
              <span className="text-dark small fw-bold">{review.book?.title || 'Unknown Book'}</span>
            </div>

            <p className="text-secondary mb-0" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              {review.comment}
            </p>
            
            {review.reports && review.reports.length > 0 && (
                <div className="mt-3 p-2 bg-warning bg-opacity-10 rounded small text-dark border border-warning border-opacity-25">
                    <strong>Reported for: </strong> 
                    {review.reports.map(r => r.reason).join(', ')}
                </div>
            )}
          </div>
        )) : (
            <div className="text-center text-muted py-5">
                <i className="bi bi-chat-right-text fs-1 d-block mb-3 opacity-25"></i>
                No reviews found.
            </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;