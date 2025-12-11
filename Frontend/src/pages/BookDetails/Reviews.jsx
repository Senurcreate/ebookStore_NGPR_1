// CommentSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import "../../styles/main.scss";

const CommentSection = () => {
  // Simulate logged-in user
  const [currentUser] = useState({
    id: 1001,
    name: "Alex Johnson",
    isAdmin: false
  });

  const [reviews, setReviews] = useState([
    {
      id: 1,
      userId: 1002,
      name: "Sarah Johnson",
      time: "2 days ago",
      rating: 4,
      comment: "This book completely changed my perspective on life. The concept of the infinite library is beautifully executed and the writing is captivating. Highly recommend!",
      likes: 24,
      dislikes: 2,
      replies: [
        {
          id: 101,
          userId: 1003,
          name: "Mike Chen",
          time: "1 day ago",
          comment: "I completely agree! The philosophical questions it raises are profound.",
          likes: 8,
          dislikes: 0,
          userLiked: false,
          userDisliked: false,
          flagged: false,
          flaggedBy: []
        }
      ],
      showReplies: true,
      userLiked: false,
      userDisliked: false,
      flagged: false,
      flaggedBy: []
    },
    {
      id: 2,
      userId: 1004,
      name: "Emma Watson",
      time: "5 days ago",
      rating: 3.5,
      comment: "A wonderful exploration of regret and second chances. Some parts felt a bit slow, but overall a great read that made me think deeply about my own choices.",
      likes: 15,
      dislikes: 1,
      replies: [],
      showReplies: false,
      userLiked: false,
      userDisliked: false,
      flagged: false,
      flaggedBy: []
    },
    {
      id: 3,
      userId: 1005,
      name: "James Rodriguez",
      time: "1 week ago",
      rating: 5,
      comment: "Matt Haig has done it again! This book is a masterpiece. The way he weaves philosophy with storytelling is incredible. A must-read for anyone going through a difficult time.",
      likes: 32,
      dislikes: 0,
      replies: [],
      showReplies: false,
      userLiked: false,
      userDisliked: false,
      flagged: false,
      flaggedBy: []
    }
  ]);

  const [newReview, setNewReview] = useState({
    comment: "",
    rating: 0,
    hoverRating: 0
  });

  const [replyInput, setReplyInput] = useState({});
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  // State for flag popup
  const [flagPopup, setFlagPopup] = useState({
    show: false,
    reviewId: null,
    replyId: null,
    userName: '',
    type: '',
    position: { top: 0, left: 0, arrowPosition: 'left' }
  });

  const flagButtonRefs = useRef({});
  const popupRef = useRef(null);
  const MAX_VISIBLE_REVIEWS = 2;

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Check if the click is on a flag button
        const isFlagButton = event.target.closest('.flag-btn') || 
                            event.target.closest('.action-btn')?.querySelector('.bi-flag');
        
        if (!isFlagButton) {
          setFlagPopup(prev => ({ ...prev, show: false }));
        }
      }
    };

    if (flagPopup.show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [flagPopup.show]);

  // Close popup on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (flagPopup.show) {
        setFlagPopup(prev => ({ ...prev, show: false }));
      }
    };

    if (flagPopup.show) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [flagPopup.show]);

  // Star Rating Component - Updated to show numeric rating
  const StarRating = ({ rating, editable = false, onRatingChange, hoverRating = 0, onHoverChange, showNumber = true }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (editable) {
        const currentRating = hoverRating || rating;
        stars.push(
          <i 
            key={i}
            className={`bi ${i <= currentRating ? 'bi-star-fill' : 'bi-star'} star ${editable ? 'editable' : ''}`}
            onMouseEnter={() => onHoverChange && onHoverChange(i)}
            onMouseLeave={() => onHoverChange && onHoverChange(0)}
            onClick={() => onRatingChange(i)}
          ></i>
        );
      } else {
        if (i <= fullStars) {
          stars.push(<i key={i} className="bi bi-star-fill star"></i>);
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars.push(<i key={i} className="bi bi-star-half star"></i>);
        } else {
          stars.push(<i key={i} className="bi bi-star star"></i>);
        }
      }
    }
    
    return (
      <div className="star-rating-container d-flex align-items-center">
        <div className="star-rating">{stars}</div>
        {showNumber && rating > 0 && (
          <span className="rating-number ms-2">{rating.toFixed(1)}</span>
        )}
      </div>
    );
  };

  // Handle posting new review
  const handlePostReview = () => {
    if (!newReview.comment.trim() || newReview.rating === 0) {
      alert("Please write a review and provide a rating");
      return;
    }

    setIsPosting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newReviewObj = {
        id: reviews.length + 1,
        userId: currentUser.id,
        name: currentUser.name,
        time: "Just now",
        rating: newReview.rating,
        comment: newReview.comment,
        likes: 0,
        dislikes: 0,
        replies: [],
        showReplies: false,
        userLiked: false,
        userDisliked: false,
        flagged: false,
        flaggedBy: []
      };

      setReviews([newReviewObj, ...reviews]);
      setNewReview({
        comment: "",
        rating: 0,
        hoverRating: 0
      });
      setIsPosting(false);
    }, 500);
  };

  // Handle replying to a review
  const handlePostReply = (reviewId) => {
    const replyText = replyInput[reviewId];
    if (!replyText?.trim()) return;

    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        const newReply = {
          id: review.replies.length + 1,
          userId: currentUser.id,
          name: currentUser.name,
          time: "Just now",
          comment: replyText,
          likes: 0,
          dislikes: 0,
          userLiked: false,
          userDisliked: false,
          flagged: false,
          flaggedBy: []
        };
        return {
          ...review,
          replies: [...review.replies, newReply],
          showReplies: true
        };
      }
      return review;
    }));

    setReplyInput({ ...replyInput, [reviewId]: "" });
  };

  // Handle like/dislike actions
  const handleLike = (reviewId, replyId = null) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        if (replyId !== null) {
          // Like a reply
          return {
            ...review,
            replies: review.replies.map(reply => {
              if (reply.id === replyId) {
                const alreadyLiked = reply.userLiked;
                return {
                  ...reply,
                  likes: alreadyLiked ? reply.likes - 1 : reply.likes + 1,
                  dislikes: reply.userDisliked ? reply.dislikes - 1 : reply.dislikes,
                  userLiked: !alreadyLiked,
                  userDisliked: false
                };
              }
              return reply;
            })
          };
        } else {
          // Like the main review
          const alreadyLiked = review.userLiked;
          return {
            ...review,
            likes: alreadyLiked ? review.likes - 1 : review.likes + 1,
            dislikes: review.userDisliked ? review.dislikes - 1 : review.dislikes,
            userLiked: !alreadyLiked,
            userDisliked: false
          };
        }
      }
      return review;
    }));
  };

  const handleDislike = (reviewId, replyId = null) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        if (replyId !== null) {
          // Dislike a reply
          return {
            ...review,
            replies: review.replies.map(reply => {
              if (reply.id === replyId) {
                const alreadyDisliked = reply.userDisliked;
                return {
                  ...reply,
                  dislikes: alreadyDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
                  likes: reply.userLiked ? reply.likes - 1 : reply.likes,
                  userDisliked: !alreadyDisliked,
                  userLiked: false
                };
              }
              return reply;
            })
          };
        } else {
          // Dislike the main review
          const alreadyDisliked = review.userDisliked;
          return {
            ...review,
            dislikes: alreadyDisliked ? review.dislikes - 1 : review.dislikes + 1,
            likes: review.userLiked ? review.likes - 1 : review.likes,
            userDisliked: !alreadyDisliked,
            userLiked: false
          };
        }
      }
      return review;
    }));
  };

  // Handle flag button click - show popup
  const handleFlagClick = (event, reviewId, replyId = null, userName, type) => {
    event.stopPropagation();
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Calculate position relative to viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 280;
    const popupHeight = 180;
    
    // Position to the right of the button
    let left = rect.right + 8;
    let top = rect.top;
    
    // Adjust if popup would go off screen to the right
    if (left + popupWidth > viewportWidth - 10) {
      left = rect.left - popupWidth - 8; // Position to the left instead
    }
    
    // Adjust if popup would go off screen vertically
    if (top < 10) {
      top = 10;
    } else if (top + popupHeight > viewportHeight - 10) {
      top = viewportHeight - popupHeight - 10;
    }
    
    // Adjust arrow position based on where popup is relative to button
    const arrowPosition = left < rect.left ? 'right' : 'left';
    
    setFlagPopup({
      show: true,
      reviewId,
      replyId,
      userName,
      type: type || (replyId ? 'reply' : 'review'),
      position: { top, left, arrowPosition }
    });
  };

  // Confirm flag action
  const confirmFlag = () => {
    const { reviewId, replyId, userName } = flagPopup;
    
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        if (replyId !== null) {
          // Flag a reply
          return {
            ...review,
            replies: review.replies.map(reply => {
              if (reply.id === replyId) {
                if (!reply.flaggedBy.includes(currentUser.id)) {
                  return { 
                    ...reply, 
                    flagged: true,
                    flaggedBy: [...reply.flaggedBy, currentUser.id]
                  };
                }
                return reply;
              }
              return reply;
            })
          };
        } else {
          // Flag the main review
          if (!review.flaggedBy.includes(currentUser.id)) {
            return { 
              ...review, 
              flagged: true,
              flaggedBy: [...review.flaggedBy, currentUser.id]
            };
          }
          return review;
        }
      }
      return review;
    }));

    // Close popup first
    setFlagPopup({ ...flagPopup, show: false });
    
    // Show success message
    setTimeout(() => {
      alert(`Thank you! You have reported content by ${userName}. Our moderators will review it.`);
    }, 100);
  };

  // Cancel flag action
  const cancelFlag = () => {
    setFlagPopup({ ...flagPopup, show: false });
  };

  // Handle deleting own content
  const handleDelete = (reviewId, replyId = null) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this content?");
    if (!confirmDelete) return;

    if (replyId !== null) {
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            replies: review.replies.filter(reply => reply.id !== replyId)
          };
        }
        return review;
      }));
    } else {
      setReviews(reviews.filter(review => review.id !== reviewId));
    }
  };

  // Toggle replies visibility
  const toggleReplies = (reviewId) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return { ...review, showReplies: !review.showReplies };
      }
      return review;
    }));
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, MAX_VISIBLE_REVIEWS);

  // Check if user can delete content (only own content)
  const canDelete = (userId) => {
    return userId === currentUser.id || currentUser.isAdmin;
  };

  // Check if user has flagged the content
  const hasUserFlagged = (flaggedBy) => {
    return flaggedBy.includes(currentUser.id);
  };

  return (
    <div className="container mt-5 mb-5 pt-5 pb-5 comment-section">
      {/* Flag Popup */}
      {flagPopup.show && (
        <div 
          ref={popupRef}
          className="flag-popup"
          style={{
            top: `${flagPopup.position.top}px`,
            left: `${flagPopup.position.left}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popup-header">
            <i className="bi bi-flag-fill text-danger me-2"></i>
            <span>Report {flagPopup.type}</span>
            <button 
              type="button" 
              className="popup-close"
              onClick={cancelFlag}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
          <div className="popup-body">
            <p className="mb-2">
              Report this {flagPopup.type} by <strong>{flagPopup.userName}</strong>?
            </p>
            <p className="text-muted small mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Moderators will review this content.
            </p>
          </div>
          <div className="popup-footer">
            <button 
              type="button" 
              className="btn  btn-outline-secondary"
              onClick={cancelFlag}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-danger"
              onClick={confirmFlag}
            >
              <i className="bi bi-flag-fill me-1"></i>
              Report
            </button>
          </div>
          {/* Arrow pointing to flag button 
          <div className={`popup-arrow ${flagPopup.position.arrowPosition || 'lleft'}`}></div>*/}
        </div>
      )}

      <h5 className="mb-4">Reader Reviews ({reviews.length})</h5>

      {/* Current User Info */}
      <div className="alert alert-info d-flex align-items-center mb-4">
        <i className="bi bi-person-circle me-2"></i>
        <div>
          <strong>Logged in as:</strong> {currentUser.name}
          {currentUser.isAdmin && <span className="badge bg-danger ms-2">Admin</span>}
        </div>
      </div>

      {/* Write Review Section */}
      <div className="review-card mb-4">
        <h5>Write a Review</h5>
        <div className="mb-3">
          <label className="form-label">Your Rating</label>
          <StarRating
            rating={newReview.rating}
            editable={true}
            hoverRating={newReview.hoverRating}
            onRatingChange={(rating) => setNewReview({...newReview, rating})}
            onHoverChange={(rating) => setNewReview({...newReview, hoverRating: rating})}
            showNumber={false} // Don't show number for editable rating
          />
        </div>
        <div className="mb-3">
          <label htmlFor="comment" className="form-label">
            Share your thoughts about this book as <strong>{currentUser.name}</strong>...
          </label>
          <textarea
            className="form-control"
            id="comment"
            rows="3"
            placeholder="Write your review here..."
            value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          ></textarea>
        </div>
        <button 
          className="btn btn-primary post-review-btn"
          onClick={handlePostReview}
          disabled={isPosting}
        >
          {isPosting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Posting...
            </>
          ) : (
            <>
              <i className="bi bi-send me-2"></i>
              Post Review
            </>
          )}
        </button>
      </div>

      {/* Reviews List */}
      {visibleReviews.map((review) => {
        const userHasFlaggedReview = hasUserFlagged(review.flaggedBy);
        
        return (
          <div key={review.id} className={`review-card ${review.flagged ? 'flagged' : ''}`}>
            {/* Review Header */}
            <div className="review-header">
              <div className="d-flex align-items-center">
                <span className="user-badge">
                  {review.name}
                  {review.userId === currentUser.id && (
                    <span className="badge bg-primary ms-2">You</span>
                  )}
                </span>
                <span className="time-badge ms-2">• {review.time}</span>
                {review.flagged && (
                  <span className="badge bg-danger ms-2">
                    <i className="bi bi-flag-fill me-1"></i>
                    Reported
                  </span>
                )}
              </div>
              <div className="review-actions">
                {/* Flag button - always visible for others' content */}
                {review.userId !== currentUser.id && (
                  <button 
                    className={`action-btn flag-btn ${userHasFlaggedReview ? 'user-flagged' : ''}`}
                    onClick={(e) => handleFlagClick(e, review.id, null, review.name, 'review')}
                    title={userHasFlaggedReview ? "You have reported this review" : "Report this review"}
                  >
                    <i className={`bi ${userHasFlaggedReview ? 'bi-flag-fill text-danger' : review.flagged ? 'bi-flag-fill text-warning' : 'bi-flag'}`}></i>
                  </button>
                )}
                
                {/* Delete button - only for own content or admin */}
                {canDelete(review.userId) && (
                  <button 
                    className="action-btn"
                    onClick={() => handleDelete(review.id)}
                    title="Delete review"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Rating with Number */}
            <div className="mb-2">
              <StarRating rating={review.rating} showNumber={true} />
            </div>

            {/* Comment */}
            <p className="mb-3 comment-text">{review.comment}</p>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className={`action-btn like-btn ${review.userLiked ? 'active' : ''}`}
                onClick={() => handleLike(review.id)}
              >
                <i className={`bi ${review.userLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i>
                <span>{review.likes}</span>
              </button>
              
              <button 
                className={`action-btn dislike-btn ${review.userDisliked ? 'active' : ''}`}
                onClick={() => handleDislike(review.id)}
              >
                <i className={`bi ${review.userDisliked ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'}`}></i>
                <span>{review.dislikes}</span>
              </button>
              
              <button 
                className="action-btn"
                onClick={() => setReplyInput({...replyInput, [review.id]: replyInput[review.id] || ""})}
              >
                <i className="bi bi-reply"></i>
                <span>Reply</span>
              </button>
            </div>

            {/* Reply Input */}
            {replyInput[review.id] !== undefined && (
              <div className="reply-input-container">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Reply as ${currentUser.name}...`}
                    value={replyInput[review.id]}
                    onChange={(e) => setReplyInput({...replyInput, [review.id]: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handlePostReply(review.id)}
                  />
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => handlePostReply(review.id)}
                  >
                    <i className="bi bi-send"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Replies Section */}
            {review.replies.length > 0 && (
              <div className="replies-section">
                <button 
                  className="toggle-replies-btn"
                  onClick={() => toggleReplies(review.id)}
                >
                  {review.showReplies ? (
                    <>
                      <i className="bi bi-chevron-up me-1"></i>
                      Hide {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-chevron-down me-1"></i>
                      Show {review.replies.length} {review.replies.length === 1 ? 'reply' : 'replies'}
                    </>
                  )}
                </button>
                
                {review.showReplies && review.replies.map((reply) => {
                  const userHasFlaggedReply = hasUserFlagged(reply.flaggedBy);
                  
                  return (
                    <div key={reply.id} className="reply-card">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center">
                          <span className="user-badge">
                            {reply.name}
                            {reply.userId === currentUser.id && (
                              <span className="badge bg-primary ms-2">You</span>
                            )}
                          </span>
                          <span className="time-badge ms-2">• {reply.time}</span>
                          {reply.flagged && (
                            <span className="badge bg-danger ms-2">
                              <i className="bi bi-flag-fill me-1"></i>
                              Reported
                            </span>
                          )}
                        </div>
                        <div className="reply-actions">
                          {/* Flag button - only for others' replies */}
                          {reply.userId !== currentUser.id && (
                            <button 
                              className={`action-btn ${userHasFlaggedReply ? 'user-flagged' : ''}`}
                              onClick={(e) => handleFlagClick(e, review.id, reply.id, reply.name, 'reply')}
                              title={userHasFlaggedReply ? "You have reported this reply" : "Report this reply"}
                            >
                              <i className={`bi ${userHasFlaggedReply ? 'bi-flag-fill text-danger' : reply.flagged ? 'bi-flag-fill text-warning' : 'bi-flag'}`}></i>
                            </button>
                          )}
                          
                          {/* Delete button - only for own replies or admin */}
                          {canDelete(reply.userId) && (
                            <button 
                              className="action-btn"
                              onClick={() => handleDelete(review.id, reply.id)}
                              title="Delete reply"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mb-2 reply-text">{reply.comment}</p>
                      <div className="action-buttons">
                        <button 
                          className={`action-btn like-btn ${reply.userLiked ? 'active' : ''}`}
                          onClick={() => handleLike(review.id, reply.id)}
                        >
                          <i className={`bi ${reply.userLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'}`}></i>
                          <span>{reply.likes}</span>
                        </button>
                        <button 
                          className={`action-btn dislike-btn ${reply.userDisliked ? 'active' : ''}`}
                          onClick={() => handleDislike(review.id, reply.id)}
                        >
                          <i className={`bi ${reply.userDisliked ? 'bi-hand-thumbs-down-fill' : 'bi-hand-thumbs-down'}`}></i>
                          <span>{reply.dislikes}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Show More/Less Button */}
      {reviews.length > MAX_VISIBLE_REVIEWS && (
        <button 
          className="btn btn-outline-secondary show-more-btn"
          onClick={() => setShowAllReviews(!showAllReviews)}
        >
          {showAllReviews ? (
            <>
              <i className="bi bi-chevron-up me-2"></i>
              Show Less Reviews
            </>
          ) : (
            <>
              <i className="bi bi-chevron-down me-2"></i>
              Show More Reviews ({reviews.length - MAX_VISIBLE_REVIEWS} more)
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CommentSection;