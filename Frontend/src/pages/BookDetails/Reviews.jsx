import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/firebase.config'; 
import { API_ENDPOINTS } from '../../config/config'; 
import PP from "../../assets/PP.png"
import "../../styles/main.scss"; 

const DEFAULT_PROFILE_PIC = PP;

// --- STAR RATING COMPONENT ---
const StarRating = ({ rating, editable = false, onRatingChange, hoverRating = 0, onHoverChange, showNumber = true }) => {
  const displayRating = hoverRating || rating;
  const getRatingFromEvent = (e, starIndex) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    return percent < 0.5 ? starIndex - 0.5 : starIndex;
  };
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    let starClass = 'bi-star';
    if (displayRating >= i) starClass = 'bi-star-fill';
    else if (displayRating >= i - 0.5) starClass = 'bi-star-half';
    stars.push(
      <i key={i} className={`bi ${starClass} star ${editable ? 'editable' : ''}`}
        style={{ cursor: editable ? 'pointer' : 'default' }}
        onMouseMove={(e) => editable && onHoverChange && onHoverChange(getRatingFromEvent(e, i))}
        onMouseLeave={() => editable && onHoverChange && onHoverChange(0)}
        onClick={(e) => editable && onRatingChange && onRatingChange(getRatingFromEvent(e, i))}
      ></i>
    );
  }
  return <div className="star-rating-container d-flex align-items-center"><div className="star-rating">{stars}</div>{showNumber && rating > 0 && <span className="rating-number ms-2">{rating.toFixed(1)}</span>}</div>;
};

// --- MAIN COMPONENT ---
const CommentSection = ({ bookId, onReviewAdded }) => {
  const { currentUser } = useAuth();
  
  // --- STATE ---
  const [mongoUser, setMongoUser] = useState(null); 
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ comment: "", rating: 0, hoverRating: 0 });
  const [replyInput, setReplyInput] = useState({});
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- NEW STATE: Track locally hidden content (Preserved from Current Version) ---
  const [hiddenContentIds, setHiddenContentIds] = useState([]); 

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ comment: "", rating: 0, hoverRating: 0 });
  const [isSaving, setIsSaving] = useState(false);
  
  const [flagPopup, setFlagPopup] = useState({
    show: false,
    reviewId: null,
    replyId: null,
    userName: '',
    type: '',
    position: { top: 0, left: 0, arrowPosition: 'left' }
  });

  const popupRef = useRef(null);
  const MAX_VISIBLE_REVIEWS = 2; 

  // --- AUTH HEADER HELPER ---
  const getAuthHeader = async () => {
    if (!auth.currentUser) return {};
    try {
      const token = await auth.currentUser.getIdToken();
      return { Authorization: `Bearer ${token}` };
    } catch (error) { return {}; }
  };

  // --- FETCH USER ---
  useEffect(() => {
    const fetchMongoUser = async () => {
        if (!currentUser) { setMongoUser(null); return; }
        try {
            const headers = await getAuthHeader();
            const res = await axios.get(`${API_ENDPOINTS.BOOKS.replace('/books', '/users/me')}`, { headers });
            if (res.data.success) setMongoUser(res.data.data);
        } catch (err) { console.error("Failed to sync user", err); }
    };
    fetchMongoUser();
  }, [currentUser]);

  const loggedInUser = mongoUser ? {
    id: mongoUser._id, 
    name: mongoUser.displayName || 'User',
    photo: mongoUser.photoURL || currentUser?.photoURL || DEFAULT_PROFILE_PIC,
    isAdmin: mongoUser.role === 'admin' || mongoUser.role === 'moderator'
  } : (currentUser ? {
      id: currentUser.uid, 
      name: currentUser.displayName,
      photo: currentUser.photoURL || DEFAULT_PROFILE_PIC,
      isAdmin: false
  } : null);

  // --- FETCH REVIEWS ---
  useEffect(() => {
    if (!bookId) { setLoading(false); return; }
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const url = API_ENDPOINTS.REVIEWS_BY_BOOK(bookId);
        const res = await axios.get(url);
        if (res.data.success) setReviews(res.data.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchReviews();
  }, [bookId, currentUser]); 

  // --- POPUP CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        const isFlagButton = event.target.closest('.flag-btn') || event.target.closest('.action-btn')?.querySelector('.bi-flag');
        if (!isFlagButton) setFlagPopup(prev => ({ ...prev, show: false }));
      }
    };
    if (flagPopup.show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [flagPopup.show]);

  // --- HANDLERS (RESTORED FROM OLD VERSION) ---

  const handleStartEdit = (review) => { 
      setEditingId(review.id); 
      setEditForm({ comment: review.comment, rating: review.rating, hoverRating: 0 }); 
  };
  
  const handleCancelEdit = () => { 
      setEditingId(null); 
      setEditForm({ comment: "", rating: 0, hoverRating: 0 }); 
  };

  // Restored handleSaveEdit
  const handleSaveEdit = async (reviewId) => {
    if (!editForm.comment.trim() || editForm.rating === 0) return alert("Rating and comment are required.");
    
    setIsSaving(true);
    try {
      const headers = await getAuthHeader();
      const res = await axios.put(API_ENDPOINTS.EDIT_REVIEW(reviewId), {
        rating: editForm.rating,
        comment: editForm.comment
      }, { headers });

      if (res.data.success) {
        setReviews(prevReviews => prevReviews.map(r => {
           if (r.id === reviewId) {
             return { 
               ...r, 
               rating: res.data.review.rating || editForm.rating, 
               comment: res.data.review.comment || editForm.comment,
               time: "Edited just now" 
             };
           }
           return r;
        }));
        
        handleCancelEdit(); 
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update review");
    } finally {
      setIsSaving(false);
    }
  };

  // Restored handlePostReview
  const handlePostReview = async () => {
    if (!loggedInUser) return alert("Please log in to write a review");
    if (!newReview.comment.trim() || newReview.rating === 0) return alert("Please write a review and provide a rating");

    setIsPosting(true);
    try {
      const headers = await getAuthHeader();
      const res = await axios.post(API_ENDPOINTS.ADD_REVIEW(bookId), {
        rating: newReview.rating,
        comment: newReview.comment
      }, { headers });

      if (res.data.success) {
        const reviewWithPhoto = {
            ...res.data.review,
            photo: loggedInUser.photo
        };
        setReviews([reviewWithPhoto, ...reviews]);
        setNewReview({ comment: "", rating: 0, hoverRating: 0 });
        if (onReviewAdded) onReviewAdded();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post review");
    } finally {
      setIsPosting(false);
    }
  };

  // Restored handleVote logic (Crucial for Likes/Dislikes)
  const handleVote = async (reviewId, replyId, action) => {
    if (!loggedInUser) return alert("Please log in to vote");

    setReviews(prevReviews => prevReviews.map(r => {
        if (r.id !== reviewId) return r;

        const updateItem = (item) => {
            let { likes, dislikes, userLiked, userDisliked } = item;
            if (action === 'like') {
                if (userLiked) { likes--; userLiked = false; }
                else { 
                    likes++; userLiked = true; 
                    if (userDisliked) { dislikes--; userDisliked = false; } 
                }
            } else {
                if (userDisliked) { dislikes--; userDisliked = false; }
                else { 
                    dislikes++; userDisliked = true; 
                    if (userLiked) { likes--; userLiked = false; } 
                }
            }
            return { ...item, likes, dislikes, userLiked, userDisliked };
        };

        if (replyId) {
            return {
                ...r,
                replies: r.replies.map(rep => rep.id === replyId ? updateItem(rep) : rep)
            };
        }
        return updateItem(r);
    }));

    try {
        const headers = await getAuthHeader();
        await axios.post(API_ENDPOINTS.VOTE_REVIEW(reviewId), {
            action,
            replyId
        }, { headers });
    } catch (err) {
        console.error("Vote failed:", err);
    }
  };

  const handleLike = (reviewId, replyId = null) => handleVote(reviewId, replyId, 'like');
  const handleDislike = (reviewId, replyId = null) => handleVote(reviewId, replyId, 'dislike');
  
  // Flag Click Handler
  const handleFlagClick = (event, reviewId, replyId = null, userName, type) => {
    event.stopPropagation();
    if (!loggedInUser) return alert("Please log in to report content");
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 280;
    const popupHeight = 180;
    let left = rect.right + 8;
    let top = rect.top;
    if (left + popupWidth > viewportWidth - 10) left = rect.left - popupWidth - 8;
    if (top < 10) top = 10;
    else if (top + popupHeight > viewportHeight - 10) top = viewportHeight - popupHeight - 10;
    const arrowPosition = left < rect.left ? 'right' : 'left';
    
    setFlagPopup({ show: true, reviewId, replyId, userName, type: type || (replyId ? 'reply' : 'review'), position: { top, left, arrowPosition } });
  };

  // --- CONFIRM FLAG (KEPT FROM NEW VERSION WITH HIDE LOGIC) ---
  const confirmFlag = async () => {
    const { reviewId, replyId } = flagPopup;
    try {
      const headers = await getAuthHeader();
      await axios.post(API_ENDPOINTS.REPORT_REVIEW(reviewId), { reason: 'inappropriate', replyId }, { headers });
      
      // 1. Close Popup
      setFlagPopup({ ...flagPopup, show: false });
      
      // 2. Hide content locally immediately (Optimistic UI)
      const idToHide = replyId || reviewId;
      setHiddenContentIds(prev => [...prev, idToHide]);

      alert("Content reported. We have hidden this from your view.");
    } catch (err) { alert("Failed to report."); }
  };

  const cancelFlag = () => setFlagPopup({ ...flagPopup, show: false });

  // Restored handleDelete
  const handleDelete = async (reviewId, replyId = null) => {
    if (!window.confirm("Are you sure?")) return;
    try {
        const headers = await getAuthHeader();
        const url = replyId 
            ? `${API_ENDPOINTS.DELETE_REVIEW(reviewId)}?replyId=${replyId}`
            : API_ENDPOINTS.DELETE_REVIEW(reviewId);
            
        await axios.delete(url, { headers });
        
        if (replyId) {
            setReviews(reviews.map(r => r.id === reviewId ? { ...r, replies: r.replies.filter(rep => rep.id !== replyId) } : r));
        } else {
            setReviews(reviews.filter(r => r.id !== reviewId));
            if (onReviewAdded) onReviewAdded(); 
        }
    } catch (err) { alert("Failed to delete."); }
  };

  // Restored handlePostReply
  const handlePostReply = async (reviewId) => {
    if (!loggedInUser) return alert("Please log in to reply");
    const replyText = replyInput[reviewId];
    if (!replyText?.trim()) return;

    try {
      const headers = await getAuthHeader();
      const res = await axios.post(API_ENDPOINTS.ADD_REPLY(reviewId), {
        comment: replyText
      }, { headers });

      if (res.data.success) {
        // Optimistically add photo
        const replyWithPhoto = {
            ...res.data.reply,
            photo: loggedInUser.photo
        };
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, replies: [...r.replies, replyWithPhoto], showReplies: true } : r));
        setReplyInput({ ...replyInput, [reviewId]: "" });
      }
    } catch (err) {
      alert("Failed to post reply");
    }
  };

  // Restored toggleReplies
  const toggleReplies = (reviewId) => {
    setReviews(reviews.map(review => review.id === reviewId ? { ...review, showReplies: !review.showReplies } : review));
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, MAX_VISIBLE_REVIEWS);
  const canDelete = (userId) => loggedInUser && (userId === loggedInUser.id || loggedInUser.isAdmin);
  const canEdit = (userId) => loggedInUser && userId === loggedInUser.id;
  const hasUserFlagged = (flaggedBy) => loggedInUser && flaggedBy && flaggedBy.includes(loggedInUser.id);

  // --- RENDER ---
  return (
    <div className="container mt-5 mb-5 pt-5 pb-5 comment-section">
      <style>{`
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 12px; border: 1px solid #e0e0e0; flex-shrink: 0; }
        .user-avatar.small { width: 30px; height: 30px; margin-right: 10px; }
        .review-header .d-flex, .reply-card .d-flex { align-items: center; }
        /* NEW: Style for hidden content placeholder */
        .hidden-content-placeholder { background: #f8f9fa; border: 1px dashed #dee2e6; padding: 10px; border-radius: 8px; color: #6c757d; font-style: italic; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between; }
      `}</style>

      {/* Flag Popup - Keep exactly as is */}
      {flagPopup.show && (
        <div ref={popupRef} className="flag-popup" style={{ top: `${flagPopup.position.top}px`, left: `${flagPopup.position.left}px` }} onClick={(e) => e.stopPropagation()}>
          <div className="popup-header"><i className="bi bi-flag-fill text-danger me-2"></i><span>Report {flagPopup.type}</span><button type="button" className="popup-close" onClick={cancelFlag}><i className="bi bi-x"></i></button></div>
          <div className="popup-body"><p className="mb-2">Report this {flagPopup.type} by <strong>{flagPopup.userName}</strong>?</p><p className="text-muted small mb-0"><i className="bi bi-info-circle me-1"></i> Moderators will review this content.</p></div>
          <div className="popup-footer"><button type="button" className="btn btn-outline-secondary" onClick={cancelFlag}>Cancel</button><button type="button" className="btn  btn-danger" onClick={confirmFlag}><i className="bi bi-flag-fill me-1"></i> Report</button></div>
        </div>
      )}

      <h5 className="mb-4">Reader Reviews ({reviews.length})</h5>

      {/* User Info Alert - Keep as is */}
      <div className={`alert ${loggedInUser ? 'alert-info' : 'alert-warning'} d-flex align-items-center mb-4`}>
        {loggedInUser ? ( <> <img src={loggedInUser.photo} alt={loggedInUser.name} className="user-avatar" onError={(e) => e.target.src = DEFAULT_PROFILE_PIC} /> <div> <strong>Logged in as:</strong> {loggedInUser.name} {loggedInUser.isAdmin && <span className="badge bg-danger ms-2">Admin</span>} </div> </> ) : ( <div>Please <a href="/login">log in</a> to write a review.</div> )}
      </div>

      {/* Write Review - Keep as is */}
      {loggedInUser && ( <div className="review-card mb-4"> <h5>Write a Review</h5> <div className="mb-3"> <label className="form-label">Your Rating</label> <StarRating rating={newReview.rating} editable={true} hoverRating={newReview.hoverRating} onRatingChange={(r) => setNewReview({...newReview, rating: r})} onHoverChange={(r) => setNewReview({...newReview, hoverRating: r})} showNumber={false} /> </div> <div className="mb-3"> <label htmlFor="comment" className="form-label"> Share your thoughts about this book... </label> <div className="d-flex gap-2"> <img src={loggedInUser.photo} alt="Me" className="user-avatar" style={{marginTop:'5px'}} onError={(e) => e.target.src = DEFAULT_PROFILE_PIC} /> <textarea className="form-control" id="comment" rows="3" placeholder="Write your review here..." value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} ></textarea> </div> </div> <button className="btn btn-primary post-review-btn" onClick={handlePostReview} disabled={isPosting}> {isPosting ? ( <><span className="spinner-border spinner-border-sm me-2"></span>Posting...</> ) : ( <><i className="bi bi-send me-2"></i> Post Review</> )} </button> </div> )}

      {loading ? ( <div className="text-center p-5"><div className="spinner-border text-primary"></div></div> ) : reviews.length === 0 ? ( <div className="text-center p-5 border rounded bg-light"> <i className="bi bi-chat-square-quote display-4 text-muted mb-3"></i> <p className="lead">No reviews yet.</p> </div> ) : (
        /* Reviews List */
        visibleReviews.map((review) => {
          const userHasFlaggedReview = hasUserFlagged(review.flaggedBy);
          const isEditing = editingId === review.id;
          
          // --- CHECK IF HIDDEN ---
          const isReviewHidden = hiddenContentIds.includes(review.id);

          if (isReviewHidden) {
            return (
              <div key={review.id} className="review-card mb-3">
                <div className="hidden-content-placeholder">
                  <span><i className="bi bi-eye-slash me-2"></i> You reported this content. It is now hidden.</span>
                  <button className="btn btn-link btn-sm text-muted p-0" onClick={() => setHiddenContentIds(prev => prev.filter(id => id !== review.id))}>Undo</button>
                </div>
              </div>
            );
          }

          return (
            <div key={review.id} className={`review-card ${review.flagged ? 'flagged' : ''}`}>
              {/* Review Header */}
              <div className="review-header">
                <div className="d-flex align-items-center">
                  <img src={`${review.photo || DEFAULT_PROFILE_PIC}?t=${new Date(review.time).getTime()}`} alt={review.name} className="user-avatar" onError={(e) => e.target.src = DEFAULT_PROFILE_PIC} />
                  <span className="user-badge"> {review.name} {loggedInUser && review.userId === loggedInUser.id && <span className="badge bg-primary ms-2">You</span>} </span>
                  <span className="time-badge ms-2">• {review.time}</span>
                  {review.flagged && <span className="badge bg-danger ms-2"><i className="bi bi-flag-fill me-1"></i> Reported</span>}
                </div>
                
                <div className="review-actions">
                  {loggedInUser && review.userId !== loggedInUser.id && (
                    <button className={`action-btn flag-btn ${userHasFlaggedReview ? 'user-flagged' : ''}`} onClick={(e) => handleFlagClick(e, review.id, null, review.name, 'review')}>
                      <i className={`bi ${userHasFlaggedReview ? 'bi-flag-fill text-danger' : review.flagged ? 'bi-flag-fill text-warning' : 'bi-flag'}`}></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Editing vs Viewing Logic - Keep as is */}
              {isEditing ? (
                <div className="edit-form mt-2 mb-3 p-3 bg-light rounded">
                   {/* ... Edit form inputs ... */}
                   <div className="mb-2"><label className="form-label small text-muted">Update Rating</label><StarRating rating={editForm.rating} editable={true} hoverRating={editForm.hoverRating} onRatingChange={(r) => setEditForm(prev => ({...prev, rating: r}))} onHoverChange={(r) => setEditForm(prev => ({...prev, hoverRating: r}))} showNumber={false} /></div>
                   <div className="mb-3"><label className="form-label small text-muted">Update Comment</label><textarea className="form-control" rows="3" value={editForm.comment} onChange={(e) => setEditForm(prev => ({...prev, comment: e.target.value}))} ></textarea></div>
                   <div className="d-flex gap-2"><button className="btn btn-sm btn-success" onClick={() => handleSaveEdit(review.id)} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button><button className="btn btn-outline-secondary" onClick={handleCancelEdit} disabled={isSaving}>Cancel</button></div>
                </div>
              ) : (
                <> <div className="mb-2"><StarRating rating={review.rating} showNumber={true} /></div> <p className="mb-3 comment-text">{review.comment}</p> </>
              )}

              {/* Action Buttons - Keep as is */}
              {!isEditing && (
                <div className="action-buttons">
                  <button className={`action-btn like-btn ${review.userLiked ? 'active' : ''}`} onClick={() => handleLike(review.id)}> <i className={`bi ${review.userLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i> <span>{review.likes}</span> </button>
                  <button className={`action-btn dislike-btn ${review.userDisliked ? 'active' : ''}`} onClick={() => handleDislike(review.id)}> <i className={`bi ${review.userDisliked ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'}`}></i> <span>{review.dislikes}</span> </button>
                  {loggedInUser && ( <button className="action-btn" onClick={() => setReplyInput({...replyInput, [review.id]: replyInput[review.id] || ""})}> <i className="bi bi-reply"></i><span>Reply</span> </button> )}
                  {canEdit(review.userId) && ( <button className="action-btn" onClick={() => handleStartEdit(review)} title="Edit review"> <i className="bi bi-pencil-square"></i> </button> )}
                  {canDelete(review.userId) && ( <button className="action-btn" onClick={() => handleDelete(review.id)} title="Delete review"> <i className="bi bi-trash"></i> </button> )}
                </div>
              )}

              {/* Reply Input - Keep as is */}
              {!isEditing && replyInput[review.id] !== undefined && (
                <div className="reply-input-container"> <div className="d-flex gap-2 align-items-center"> <img src={loggedInUser?.photo || DEFAULT_PROFILE_PIC} className="user-avatar small" alt="Me" onError={(e) => e.target.src = DEFAULT_PROFILE_PIC} /> <div className="input-group"> <input type="text" className="form-control" placeholder={`Reply as ${loggedInUser.name}...`} value={replyInput[review.id]} onChange={(e) => setReplyInput({...replyInput, [review.id]: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handlePostReply(review.id)} /> <button className="btn btn-outline-primary" onClick={() => handlePostReply(review.id)}><i className="bi bi-send"></i></button> </div> </div> </div>
              )}

              {/* Replies Section */}
              {!isEditing && review.replies.length > 0 && (
                <div className="replies-section">
                  <button className="toggle-replies-btn" onClick={() => toggleReplies(review.id)}>
                    {review.showReplies ? <><i className="bi bi-chevron-up me-1"></i> Hide {review.replies.length} replies</> : <><i className="bi bi-chevron-down me-1"></i> Show {review.replies.length} replies</>}
                  </button>
                  
                  {review.showReplies && review.replies.map((reply) => {
                    const userHasFlaggedReply = hasUserFlagged(reply.flaggedBy);
                    
                    // --- CHECK IF REPLY HIDDEN ---
                    const isReplyHidden = hiddenContentIds.includes(reply.id);

                    if (isReplyHidden) {
                        return (
                            <div key={reply.id} className="reply-card">
                                <div className="hidden-content-placeholder small">
                                    <span><i className="bi bi-eye-slash me-2"></i> Content hidden.</span>
                                    <button className="btn btn-link btn-sm text-muted p-0" onClick={() => setHiddenContentIds(prev => prev.filter(id => id !== reply.id))}>Undo</button>
                                </div>
                            </div>
                        );
                    }

                    return (
                      <div key={reply.id} className="reply-card">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center">
                            <img src={reply.photo || DEFAULT_PROFILE_PIC} alt={reply.name} className="user-avatar small" onError={(e) => e.target.src = DEFAULT_PROFILE_PIC} />
                            <span className="user-badge"> {reply.name} {loggedInUser && reply.userId === loggedInUser.id && <span className="badge bg-primary ms-2">You</span>} </span>
                            <span className="time-badge ms-2">• {reply.time}</span>
                            {reply.flagged && <span className="badge bg-danger ms-2"><i className="bi bi-flag-fill me-1"></i> Reported</span>}
                          </div>
                          <div className="reply-actions">
                            {loggedInUser && reply.userId !== loggedInUser.id && (
                              <button className={`action-btn ${userHasFlaggedReply ? 'user-flagged' : ''}`} onClick={(e) => handleFlagClick(e, review.id, reply.id, reply.name, 'reply')}>
                                <i className={`bi ${userHasFlaggedReply ? 'bi-flag-fill text-danger' : reply.flagged ? 'bi-flag-fill text-warning' : 'bi-flag'}`}></i>
                              </button>
                            )}
                            {canDelete(reply.userId) && ( <button className="action-btn" onClick={() => handleDelete(review.id, reply.id)} title="Delete reply"> <i className="bi bi-trash"></i> </button> )}
                          </div>
                        </div>
                        <p className="mb-2 reply-text">{reply.comment}</p>
                        <div className="action-buttons">
                          <button className={`action-btn like-btn ${reply.userLiked ? 'active' : ''}`} onClick={() => handleLike(review.id, reply.id)}> <i className={`bi ${reply.userLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i><span>{reply.likes}</span> </button>
                          <button className={`action-btn dislike-btn ${reply.userDisliked ? 'active' : ''}`} onClick={() => handleDislike(review.id, reply.id)}> <i className={`bi ${reply.userDisliked ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'}`}></i><span>{reply.dislikes}</span> </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {reviews.length > MAX_VISIBLE_REVIEWS && (
        <button className="btn btn-outline-secondary show-more-btn" onClick={() => setShowAllReviews(!showAllReviews)}>
          {showAllReviews ? <><i className="bi bi-chevron-up me-2"></i> Show Less Reviews</> : <><i className="bi bi-chevron-down me-2"></i> Show More Reviews ({reviews.length - MAX_VISIBLE_REVIEWS} more)</>}
        </button>
      )}
    </div>
  );
};

export default CommentSection;