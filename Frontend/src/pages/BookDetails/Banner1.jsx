import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../../styles/main.scss";
import bCover from '../../assets/bCover.jpg';
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../redux/features/cart/cartSlice";

// Import Services & Auth
import { fetchBookById } from "../../services/book.service";
import { downloadBookFile } from "../../services/purchase.service";
import { formatBookData } from "../../utils/bookFormatter";
import { useAuth } from "../../context/AuthContext"; 

const BookHeaderSection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Get logged-in user
    
    // State
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);

    // Audio/UI states
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const animationRef = useRef(null);

    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.cartItems);

    useEffect(() => {
        const loadBookDetails = async () => {
            try {
                setLoading(true);
                const response = await fetchBookById(id);
                
                if (response.success || response.book) {
                    const rawBook = response.book || response.data;
                    
                    // Access info from backend (Controller logic we updated earlier)
                    const canDownload = rawBook.accessInfo?.canDownload || false;
                    const previewLink = rawBook.previewUrl || rawBook.cloudinaryUrl;

                    const formatted = {
                        ...formatBookData(rawBook),
                        description: rawBook.description,
                        currency: "Rs",
                        duration: rawBook.audioLength || "00:00",
                        format: rawBook.type === 'ebook' ? 'PDF' : 'MP3',
                        narrator: rawBook.narrators?.[0]?.name || "Unknown",
                        audioUrl: rawBook.cloudinaryUrl,
                        previewUrl: previewLink, 
                        canDownload: canDownload
                    };
                    setBook(formatted);
                }
            } catch (err) {
                console.error(err);
                setError("Could not load book details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadBookDetails();
        }
    }, [id, currentUser]); 

    // --- HANDLERS ---

    const handleDownload = async () => {
        try {
            setDownloading(true);
            // This calls the backend download endpoint
            const result = await downloadBookFile(id);
            
            if (result.success && result.data.downloadUrl) {
                // Open secure download link
                window.open(result.data.downloadUrl, '_blank');
            }
        } catch (err) {
            // Backend sends 401 if guest tries to download premium
            if (err.requiresLogin || err.status === 401) {
                alert("You need to login to access this.");
                navigate('/login');
            } else {
                alert(err.message || "Download failed. Please try again.");
            }
        } finally {
            setDownloading(false);
        }
    };

    const handlePreview = () => {
        if (book.previewUrl) {
            window.open(book.previewUrl, '_blank');
        } else {
            alert("No preview available for this book.");
        }
    };

    const handleCartAction = () => {
        if (isInCart) {
            dispatch(removeFromCart(book.id));
        } else {
            dispatch(addToCart(book));
        }
    };

    // --- BUTTON RENDER LOGIC ---
    const renderActionButtons = () => {
        const isPremium = book.price > 0;

        // 1. Free Book (Guest or User) -> "Download Free"
        if (!isPremium) {
            return (
                <button 
                    className="btn btn-primary px-3 small-btn" 
                    onClick={handleDownload}
                    disabled={downloading}
                >
                    <i className="bi bi-download me-1"></i> {downloading ? 'Downloading...' : 'Download Free'}
                </button>
            );
        }

        // 2. Premium Book & Guest (Not Logged In) -> "Login to Buy"
        if (isPremium && !currentUser) {
            return (
                <button className="btn btn-primary px-3 small-btn" onClick={() => navigate('/login')}>
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login to Buy
                </button>
            );
        }

        // 3. Premium Book & User & Owned -> "Download"
        // (book.canDownload is calculated by the backend based on purchase history)
        if (isPremium && currentUser && book.canDownload) {
            return (
                <button 
                    className="btn btn-success px-3 small-btn" 
                    onClick={handleDownload}
                    disabled={downloading}
                >
                    <i className="bi bi-download me-1"></i> {downloading ? 'Processing...' : 'Download'}
                </button>
            );
        }

        // 4. Premium Book & User & Not Owned -> "Add to Cart"
        return (
            <div className="d-flex gap-2">
                <button 
                    className={`btn px-3 small-btn ${isInCart ? 'btn-success' : 'btn-outline-primary'}`}
                    onClick={handleCartAction}
                    style={{ transition:'all 0.3s', position: 'relative', overflow: 'hidden' }}
                >
                    <i className={`bi ${isInCart ? 'bi-check-lg' : 'bi-cart-plus me-1'}`}></i> 
                    {isInCart ? "In Cart" : "Add to Cart"}
                </button>
            </div>
        );
    };

    // --- AUDIO FUNCTIONS (Standard) ---
    const togglePlayPause = () => { if (audioRef.current) { if (isPlaying) { audioRef.current.pause(); cancelAnimationFrame(animationRef.current); } else { audioRef.current.play(); animationRef.current = requestAnimationFrame(whilePlaying); } setIsPlaying(!isPlaying); } };
    const whilePlaying = () => { if (audioRef.current) { setCurrentTime(audioRef.current.currentTime); if (progressRef.current) { const progressPercentage = (audioRef.current.currentTime / audioRef.current.duration) * 100; progressRef.current.style.width = `${progressPercentage}%`; } animationRef.current = requestAnimationFrame(whilePlaying); } };
    const handleProgressClick = (e) => { if (audioRef.current && progressRef.current && e.currentTarget) { const progressBar = e.currentTarget; const clickPosition = e.clientX - progressBar.getBoundingClientRect().left; const progressBarWidth = progressBar.clientWidth; const currentDuration = audioRef.current.duration || duration; const newTime = (clickPosition / progressBarWidth) * currentDuration; audioRef.current.currentTime = newTime; setCurrentTime(newTime); progressRef.current.style.width = `${(newTime / currentDuration) * 100}%`; } };
    const handleVolumeChange = (e) => { const newVolume = parseFloat(e.target.value); setVolume(newVolume); if (audioRef.current) { audioRef.current.volume = newVolume; setIsMuted(newVolume === 0); } const slider = e.target; const percent = newVolume * 100; slider.style.background = `linear-gradient(to right, #4a6bdf 0%, #4a6bdf ${percent}%, #e9ecef ${percent}%, #e9ecef 100%)`; };
    const toggleMute = () => { if (audioRef.current) { const newMutedState = !isMuted; setIsMuted(newMutedState); audioRef.current.muted = newMutedState; if (newMutedState) { setVolume(0); } else { setVolume(1); audioRef.current.volume = 1; } } };
    const handleLoadedMetadata = () => { if (audioRef.current) { setDuration(audioRef.current.duration); } };
    const handleAudioEnd = () => { setIsPlaying(false); cancelAnimationFrame(animationRef.current); setCurrentTime(0); if (progressRef.current) { progressRef.current.style.width = '0%'; } };
    const toggleWishlist = () => { setIsWishlisted(!isWishlisted); };
    const formatTime = (time) => { if (!time || isNaN(time)) return "00:00"; const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; };

    if (loading) return <div className="container py-5 text-center">Loading...</div>;
    if (error) return <div className="container py-5 text-center text-danger">{error}</div>;
    if (!book) return <div className="container py-5 text-center">Book not found.</div>;

    const isEbook = book.type === "ebook";

    // --- RENDER ---
    return (
        <div className='body justify-content-center'>
            {/* Audio Element (Hidden for eBooks, used for Audiobooks) */}
            <audio ref={audioRef} src={book.audioUrl} preload="metadata" onLoadedMetadata={handleLoadedMetadata} onEnded={handleAudioEnd} />

            <div className="book-container container mt-3">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><a href="/" className="text-decoration-none">Home</a></li>
                        <li className="breadcrumb-item"><a href={isEbook ? "/fiction" : "/audiobooks"} className="text-decoration-none">{isEbook ? "Book" : "Audiobook"}</a></li>
                        <li className="breadcrumb-item active" aria-current="page">{book.title}</li>
                    </ol>
                </nav>

                <div className="row">
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0">
                            <div className="card-body text-center p-4">
                                <div className={!isEbook ? "mb-4 position-relative" : ""}>
                                    <div className="position-relative">
                                        <img src={book.image || bCover} alt="cover" className={isEbook ? 'book-cover-img' : 'abook-cover-img'} />
                                        {!isEbook && (
                                            <div className="position-absolute" style={{ top: '10px', left: '10px', zIndex: 1 }}>
                                                <span className="badge bg-info text-white px-3 py-2 shadow-sm">
                                                    <i className="bi bi-headphones me-1"></i> Audiobook
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Audio Player Controls (Only for Audiobooks) */}
                                {!isEbook && (
                                    <div className="mt-4">
                                        <div className="audio-player-container mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="fw-bold mb-0">Listen to Sample</h6>
                                                <small className="text-muted">{formatTime(duration)}</small>
                                            </div>
                                            <div className="progress-container mb-2" onClick={handleProgressClick} style={{ cursor: 'pointer', position: 'relative' }}>
                                                <div className="progress" style={{ height: '6px', backgroundColor: '#e9ecef' }}>
                                                    <div ref={progressRef} className="progress-bar bg-primary" role="progressbar" style={{ width: '0%', transition: 'none' }}></div>
                                                </div>
                                                <div className="d-flex justify-content-between mt-1">
                                                    <small className="text-muted">{formatTime(currentTime)}</small>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <button className="btn btn-outline-primary btn-sm me-2" onClick={togglePlayPause}><i className={`bi ${isPlaying ? 'bi-pause' : 'bi-play'}`}></i></button>
                                                    <button className="btn btn-outline-secondary btn-sm me-3" onClick={toggleMute}><i className={`bi ${isMuted ? 'bi-volume-mute' : 'bi-volume-up'}`}></i></button>
                                                    <div className="volume-control" style={{ width: '80px' }}>
                                                        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="form-range volume-slider" style={{ height: '5px', background: `linear-gradient(to right, #4a6bdf 0%, #4a6bdf ${volume * 100}%, #e9ecef ${volume * 100}%, #e9ecef 100%)` }} />
                                                    </div>
                                                </div>
                                                <button className="btn btn-outline-secondary btn-sm" onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setCurrentTime(0); if (progressRef.current) progressRef.current.style.width = '0%'; } }}><i className="bi bi-arrow-clockwise"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body p-3">
                                <div className="mb-5">
                                    <h2 className="book-title-right">{book.title}</h2>
                                    <h4 className="book-author-right text-mb-3">{book.author}</h4>
                                </div>

                                <div className="mb-4">
                                    <span className="rating-badge me-2">
                                        <i className="bi bi-star-fill text-warning small"></i>
                                        <span className="ms-1 fw-bold small">{book.rating}</span>
                                        <span className="text-muted ms-1 small">Ratings</span>
                                    </span>
                                    <button className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`} onClick={toggleWishlist}>
                                        <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} wishlist-icon`}></i>
                                        <span className="wishlist-text ms-1">{isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex gap-3 mb-3">
                                        <span className="text-secondary"><i className="bi bi-clock me-1"></i> {book.duration}</span>
                                        <span className="text-secondary"><i className="bi bi-file-earmark-text me-1"></i> {book.format}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h5 className="mb-2 fw-bold book-description-heading">Description</h5>
                                    <p className="book-description text-justify">{book.description}</p>
                                </div>

                                <div className="pt-1 mt-1 mb-1 pb-1">
                                    <div>
                                        <span className="h5 fw-bold text-secondary">{book.currency} {book.price.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between pt-2 mt-3 mb-1 pb-1">
                                    <div className="d-flex gap-2 w-100">
                                        {/* INJECTED LOGIC FOR BUTTONS */}
                                        {renderActionButtons()}
                                        
                                        {/* PREVIEW BUTTON */}
                                        <button className="btn btn-outline-primary px-3 small-btn" onClick={handlePreview}>
                                            <i className="bi bi-eye me-1"></i> Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookHeaderSection;