import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../redux/features/cart/cartSlice'; 
import { fetchBookById } from '../../services/book.service'; 
import { fetchMyPurchases } from '../../services/purchase.service';

const BookPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  
  // --- ZOOM STATE ---
  const [zoomLevel, setZoomLevel] = useState(1); 

  const isInCart = book ? cartItems.some((item) => {
        const cartItemId = String(item.id || item._id);
        const currentBookId = String(book.id || book._id);
        return cartItemId === currentBookId;
    }) : false;

  // ---  FETCH BOOK ---
  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const response = await fetchBookById(id);
        
        if (response.success) {
          // Optional: Redirect if it accidentally loads an audiobook
          if (response.book.type === 'audiobook') {
             console.warn("Audiobooks should use the Audio Player UI");
          }
          setBook(response.book);
        } else {
          setError('Could not load book data');
        }
      } catch (err) {
        console.error("Preview Error:", err);
        setError('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadBook();
  }, [id, navigate]);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const response = await fetchMyPurchases();
        const hasBought = response.some(p => 
            (typeof p.book === 'object' ? p.book._id === id : p.book === id)
        );
        
        setIsPurchased(hasBought);
      } catch (err) {
        setIsPurchased(false);
      }
    };

    if (id) {
        checkOwnership();
    }
  }, [id]);

  const handleCartAction = () => {
    if (!currentUser) {
      navigate('/login', { 
        state: { message: "Please log in to add this book to your cart." } 
      });
      return;
    }

    if (!book) return;
    const safeId = book.id || book._id;

    if (isInCart) {
        dispatch(removeFromCart(safeId));
    } else {
        dispatch(addToCart({
            id: safeId, 
            title: book.title,
            author: book.author,
            price: book.price,
            image: book.image || book.coverImage, 
            type: book.type
        }));
    }
  };
  // --- HELPERS ---
  const getPreviewUrl = (originalUrl) => {
    if (!originalUrl) return '';
    // If raw file, return as is
    if (originalUrl.includes('/raw/')) return originalUrl;
    // If standard Cloudinary Image PDF, inject page limit
    if (originalUrl.includes('/image/upload/')) return originalUrl.replace('/upload/', '/upload/pg_1-20/');
    return originalUrl;
  };

  const getDownloadUrl = (originalUrl) => {
    if (!originalUrl) return '#';
    if (originalUrl.includes('/upload/')) return originalUrl.replace('/upload/', '/upload/fl_attachment/');
    return originalUrl;
  };

  // ---  ZOOM HANDLERS ---
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  // ---  LOADING/ERROR UI ---
  if (loading) return <div style={styles.centerContainer}><div className="spinner-border text-primary"></div></div>;
  if (error || !book) return (
    <div style={styles.centerContainer}>
      <div className="text-danger mb-3">{error || 'Book not found'}</div>
      <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const previewUrl = getPreviewUrl(book.downloadUrl);
  const downloadUrl = getDownloadUrl(book.downloadUrl);
  const isFreeOrOwned = book.price === 0 || book.accessInfo?.canDownload || isPurchased;

  return (
    <div className="d-flex flex-column min-vh-100 position-relative" style={styles.pageBackground}>
      
      {/* --- HEADER --- */}
      <header className="bg-white border-bottom py-2 px-4 d-flex align-items-center justify-content-between sticky-top shadow-sm" style={styles.header}>
        {/*<button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-secondary d-flex align-items-center gap-2 p-0">
          <i className="bi bi-x-lg" style={{ fontSize: '1.1rem' }}></i>
          <span className="fw-medium">Close Preview</span>
        </button>*/}

        <div className="d-none d-md-flex align-items-center gap-3">
            <span className="text-muted fs-5">📖</span>
            <span className="fw-semibold text-dark text-truncate" style={{maxWidth: '300px'}}>
                {book.title}
            </span>
        </div>

        {isFreeOrOwned ? (
             <a href={downloadUrl} className="btn btn-success d-flex align-items-center gap-2 px-4">
               <i className="bi bi-download"></i> Download
             </a>
        ) : (
            <button 
                className={`btn d-flex align-items-center gap-2 px-4 ${isInCart ? 'btn-success' : 'btn-primary'}`}
                onClick={handleCartAction}
            >
               <i className={`bi ${isInCart ? 'bi-check-lg' : 'bi-cart'}`}></i> 
               {isInCart ? "In Cart" : "Add to Cart"}
            </button>
        )}
      </header>

      
      

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow-1 d-flex flex-column align-items-center pt-4 pb-5 overflow-auto">
        
        {/* Toolbar */}
        <div className="bg-white shadow-sm border rounded p-1 d-flex align-items-center mb-3 gap-3 sticky-top" style={styles.toolbar}>
          <div className="d-flex align-items-center gap-2 px-2">
            <button className="btn btn-sm text-secondary" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <i className="bi bi-dash-lg"></i>
            </button>
            <span className="small fw-bold text-secondary mx-2" style={{minWidth: '40px', textAlign: 'center'}}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button className="btn btn-sm text-secondary" onClick={handleZoomIn} disabled={zoomLevel >= 2.0}>
              <i className="bi bi-plus-lg"></i>
            </button>
            <div className="vr text-muted mx-2"></div>
            <button className="btn btn-sm text-secondary" onClick={handleZoomReset} title="Reset Zoom">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>

        {/* Viewer Container with Dynamic Zoom */}
        <div className="bg-white shadow-lg mb-5 text-dark overflow-hidden position-relative" 
             style={{ 
               ...styles.viewerContainer, 
               transform: `scale(${zoomLevel})` 
             }}>
          
          <iframe 
              src={`${previewUrl}#view=FitH&toolbar=0&navpanes=0`} 
              className="w-100 h-100"
              style={styles.iframe}
              title="Book Preview"
          >
              <div className="text-center p-5">
                  <p>Your browser cannot display this PDF directly.</p>
                  <a href={downloadUrl} className="btn btn-primary">Download PDF</a>
              </div>
          </iframe>
        </div>
      </main>
      
      {/* --- FOOTER BANNER --- */}
      {!isFreeOrOwned && (
        <div className="fixed-bottom p-3 d-flex justify-content-center w-100" style={styles.footerPointerEvents}>
            <div className="card shadow p-3 d-flex flex-row align-items-center justify-content-between gap-3 w-100" 
                style={styles.footerCard}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width:'40px', height:'40px'}}>
                        <i className="bi bi-info-lg"></i>
                    </div>
                    <div>
                        <h6 className="fw-bold text-dark mb-0">Preview Mode</h6>
                        <small className="text-muted">Purchase to unlock full access and download.</small>
                    </div>
                </div>
                
            </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES OBJECT ---
const styles = {
  pageBackground: {
    backgroundColor: '#F3F5F7',
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  header: {
    height: '64px',
    zIndex: 1020,
  },
  toolbar: {
    top: '10px',
    zIndex: 1010,
  },
  viewerContainer: {
    maxWidth: '800px',
    width: '100%',
    minHeight: '800px',
    borderRadius: '8px',
    transformOrigin: 'top center',
    transition: 'transform 0.2s ease-out',
  },
  iframe: {
    minHeight: '800px',
    border: 'none',
  },
  footerPointerEvents: {
    pointerEvents: 'none',
  },
  footerCard: {
    maxWidth: '700px',
    backgroundColor: '#EDF9FC',
    borderColor: '#BDEAF4',
    pointerEvents: 'auto',
  },
};

export default BookPreview;