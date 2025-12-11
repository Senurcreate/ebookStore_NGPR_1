import React, { useState, useRef, useEffect } from 'react';
import "../../styles/main.scss";
import bCover from '../../assets/bCover.jpg'
import { useDispatch, useSelector} from "react-redux";
import { addToCart, removeFromCart } from "../../redux/features/cart/cartSlice";

const BookHeaderSection = () => {
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

    // Get cart items from Redux store
      const cartItems = useSelector((state) => state.cart.cartItems);
      
      
    
      // Check if current book is in cart
      const isInCart = cartItems.some(item => item.id === book.id);
    
    const handleCartAction = () => {
      if (isInCart) {
        dispatch(removeFromCart(book.id));
        
      } else {
        dispatch(addToCart(book));
        
      }
    };

    
    const sampleAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    
    const book = {
        type: "ebook", // Change to "audiobook" to test audiobook version
        title: "The Midnight Library",
        author: "Matt Haig",
        rating: 4.5,
        price: 50000, // Change to >0 for premium version
        currency: "Rs",
        description: `Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?`,
        category: "Fiction",
        duration: "12 hours 10 minutes",
        format: "pdf",
        narrator: "Carey Mulligan",
        audioUrl: sampleAudioUrl
    };

    const isPremium = book.price > 0;
    const isEbook = book.type === "ebook";

    // Format time from seconds to MM:SS
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Handle play/pause
    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                cancelAnimationFrame(animationRef.current);
            } else {
                audioRef.current.play();
                animationRef.current = requestAnimationFrame(whilePlaying);
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Handle progress while playing
    const whilePlaying = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (progressRef.current) {
                const progressPercentage = (audioRef.current.currentTime / duration) * 100;
                progressRef.current.style.width = `${progressPercentage}%`;
            }
            animationRef.current = requestAnimationFrame(whilePlaying);
        }
    };

    // Handle progress bar click
    const handleProgressClick = (e) => {
        if (audioRef.current && progressRef.current && e.currentTarget) {
            const progressBar = e.currentTarget;
            const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
            const progressBarWidth = progressBar.clientWidth;
            const newTime = (clickPosition / progressBarWidth) * duration;
            
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
            progressRef.current.style.width = `${(newTime / duration) * 100}%`;
        }
    };

    // Handle volume change
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
        
        // Update the slider background
        const slider = e.target;
        const percent = newVolume * 100;
        slider.style.background = `linear-gradient(to right, #4a6bdf 0%, #4a6bdf ${percent}%, #e9ecef ${percent}%, #e9ecef 100%)`;
    };

    // Toggle mute
    const toggleMute = () => {
        if (audioRef.current) {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            audioRef.current.muted = newMutedState;
            if (newMutedState) {
                setVolume(0);
            } else {
                setVolume(1);
                audioRef.current.volume = 1;
            }
        }
    };

    // Handle audio loaded
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    // Handle audio end
    const handleAudioEnd = () => {
        setIsPlaying(false);
        cancelAnimationFrame(animationRef.current);
        setCurrentTime(0);
        if (progressRef.current) {
            progressRef.current.style.width = '0%';
        }
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
    };

    // Render ebook version
    if (isEbook) {
        return (
            <div className='body justify-content-center'>
                {isPremium ? (
                    /* Premium Ebook Card */
                    <div className="book-container container mt-3">
                        {/* Breadcrumb Navigation */}
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/" className="text-decoration-none">Home</a>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href="/fiction" className="text-decoration-none">Fiction</a>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    {book.title}
                                </li>
                            </ol>
                        </nav>

                        <div className="row">
                            {/* Book Cover Section - Left Side */}
                            <div className="col-md-4 ">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body text-center ">
                                        {/* Book cover placeholder */}
                                        <div>
                                            <img src={bCover} alt="book cover" className='book-cover-img'/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Book Details Section - Right Side */}
                            <div className="col-md-8">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-body p-3">
                                        {/* Title and Author - Smaller */}
                                        <div className="mb-5">
                                            <h2 className="book-title-right">{book.title}</h2>
                                            <h4 className="book-author-right text-mb-3">{book.author}</h4>
                                        </div>

                                        {/* Rating and Interactive Wishlist */}
                                        <div className="mb-5">
                                            <span className="rating-badge me-2">
                                                <i className="bi bi-star-fill text-warning small"></i>
                                                <span className="ms-1 fw-bold small">{book.rating}</span>
                                                <span className="text-muted ms-1 small">Ratings</span>
                                            </span>
                                            <button 
                                                className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                                                onClick={toggleWishlist}
                                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                            >
                                                <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} wishlist-icon`}></i>
                                                <span className="wishlist-text ms-1">
                                                    {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                                                </span>
                                            </button>
                                        </div>

                                        {/* Description - Smaller */}
                                        <div className="mb-5">
                                            <h5 className="mb-2 fw-bold book-description-heading ">Description</h5>
                                            <p className="book-description text-justify">{book.description}</p>
                                            <p className="book-description text-justify">{book.description}</p>
                                        </div>

                                        {/* Price and Actions - Smaller */}
                                        <div className=" pt-1 mt-1 mb-1 pb-1">
                                            <div>
                                                <span className="h5 fw-bold text-secondary">{book.currency} {book.price.toLocaleString()}</span>
                                            </div>
                                        </div>   

                                        <div className="d-flex justify-content-between pt-1 mt-1 mb-1 pb-1">
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-primary px-3 small-btn">
                                                    <i className="bi bi-cart-plus me-1"></i> Add to Cart
                                                </button>
                                                <button className="btn btn-outline-primary px-3 small-btn">
                                                    <i className="bi bi-eye me-1"></i> Preview
                                                </button>
                                                <button className="btn btn-secondary px-3 small-btn" disabled>
                                                    <i className="bi bi-download me-1"></i> Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Free Ebook Card */
                    <div className="book-container  container mt-3">
                        {/* Breadcrumb Navigation */}
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/" className="text-decoration-none">Home</a>
                                </li>
                                <li className="breadcrumb-item">
                                    <a href="/fiction" className="text-decoration-none">Fiction</a>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    {book.title}
                                </li>
                            </ol>
                        </nav>

                        <div className="row">
                            {/* Book Cover Section - Left Side */}
                            <div className="col-md-4 ">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body text-center ">
                                        {/* Book cover placeholder */}
                                        <div>
                                            <img src={bCover} alt="book cover" className='book-cover-img'/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Book Details Section - Right Side */}
                            <div className="col-md-8">
                                <div className="card shadow-sm border-0 h-100">
                                    <div className="card-body p-3">
                                        {/* Title and Author - Smaller */}
                                        <div className="mb-5">
                                            <h2 className="book-title-right">{book.title}</h2>
                                            <h4 className="book-author-right text-mb-3">{book.author}</h4>
                                        </div>

                                        {/* Rating and Interactive Wishlist */}
                                        <div className="mb-5">
                                            <span className="rating-badge me-2">
                                                <i className="bi bi-star-fill text-warning small"></i>
                                                <span className="ms-1 fw-bold small">{book.rating}</span>
                                                <span className="text-muted ms-1 small">Ratings</span>
                                            </span>
                                            <button 
                                                className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                                                onClick={toggleWishlist}
                                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                            >
                                                <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} wishlist-icon`}></i>
                                                <span className="wishlist-text ms-1">
                                                    {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                                                </span>
                                            </button>
                                        </div>

                                        {/* Description - Smaller */}
                                        <div className="mb-5">
                                            <h5 className="mb-2 fw-bold book-description-heading ">Description</h5>
                                            <p className="book-description text-justify">{book.description}</p>
                                            <p className="book-description text-justify">{book.description}</p>
                                        </div>

                                        <div className="d-flex justify-content-between pt-2 mt-3 mb-1 pb-1">
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-outline-primary px-3 small-btn">
                                                    <i className="bi bi-eye me-1"></i> Preview
                                                </button>
                                                <button className="btn btn-primary px-3 small-btn">
                                                    <i className="bi bi-download me-1"></i> Download
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render audiobook version
    return (
        <div className='body justify-content-center'>
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={book.audioUrl}
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnd}
            />
            
            {isPremium ? (
                /* Premium Audiobook Card */
                <div className="book-container container mt-3">
                    {/* Breadcrumb Navigation */}
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/" className="text-decoration-none">Home</a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/audiobooks" className="text-decoration-none">Audiobooks</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {book.title}
                            </li>
                        </ol>
                    </nav>

                    <div className="row">
                        {/* Audiobook Info Section - Left Side */}
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center p-4">
                                    {/* Audiobook badge */}
                                    <div className="mb-4 position-relative">
                                        <div className="position-relative">
                                            <img src={bCover} alt="audiobook cover" className='abook-cover-img'/>
                                            
                                            <div className="position-absolute" style={{ top: '10px', left: '10px', zIndex: 1 }}>
                                                <span className="badge bg-info text-white px-3 py-2 shadow-sm">
                                                    <i className="bi bi-headphones me-1"></i> Audiobook
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Listen to Sample section */}
                                    <div className="mt-4">
                                        {/* Audio player controls */}
                                        <div className="audio-player-container mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <h6 className="fw-bold mb-0">Listen to Sample</h6>
                                                </div>
                                                <div>
                                                    <small className="text-muted">3:00 preview</small>
                                                </div>
                                            </div>
                                            
                                            {/* Progress bar */}
                                            <div 
                                                className="progress-container mb-2" 
                                                onClick={handleProgressClick}
                                                style={{ cursor: 'pointer', position: 'relative' }}
                                            >
                                                <div className="progress" style={{height: '6px', backgroundColor: '#e9ecef'}}>
                                                    <div 
                                                        ref={progressRef}
                                                        className="progress-bar bg-primary" 
                                                        role="progressbar" 
                                                        style={{width: '0%', transition: 'none'}}
                                                        aria-valuenow={currentTime}
                                                        aria-valuemin="0"
                                                        aria-valuemax={duration}
                                                    ></div>
                                                </div>
                                                <div className="d-flex justify-content-between mt-1">
                                                    <small className="text-muted">{formatTime(currentTime)}</small>
                                                    <small className="text-muted">{formatTime(duration)}</small>
                                                </div>
                                            </div>
                                            
                                            {/* Play/Pause and volume controls */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm me-2"
                                                        onClick={togglePlayPause}
                                                        aria-label={isPlaying ? "Pause sample" : "Play sample"}
                                                    >
                                                        <i className={`bi ${isPlaying ? 'bi-pause' : 'bi-play'}`}></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-secondary btn-sm me-3"
                                                        onClick={toggleMute}
                                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                                    >
                                                        <i className={`bi ${isMuted ? 'bi-volume-mute' : 'bi-volume-up'}`}></i>
                                                    </button>
                                                    <div className="volume-control" style={{ width: '80px' }}>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.01"
                                                            value={volume}
                                                            onChange={handleVolumeChange}
                                                            className="form-range volume-slider"
                                                            style={{ height: '5px', background: `linear-gradient(to right, #4a6bdf 0%, #4a6bdf ${volume * 100}%, #e9ecef ${volume * 100}%, #e9ecef 100%)`}}
                                                            aria-label="Volume control"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                        if (audioRef.current) {
                                                            audioRef.current.currentTime = 0;
                                                            setCurrentTime(0);
                                                            if (progressRef.current) {
                                                                progressRef.current.style.width = '0%';
                                                            }
                                                        }
                                                    }}
                                                    aria-label="Reset audio"
                                                >
                                                    <i className="bi bi-arrow-clockwise"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                                        <button 
                                            className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                                            onClick={toggleWishlist}
                                            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                        >
                                            <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} wishlist-icon`}></i>
                                            <span className="wishlist-text ms-1">
                                                {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex gap-3 mb-3">
                                            <span className="text-secondary">
                                                <i className="bi bi-clock me-1"></i>
                                                {book.duration}
                                            </span>
                                            <span className="text-secondary">
                                                <i className="bi bi-file-earmark-text me-1"></i>
                                                {book.format}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h5 className="mb-2 fw-bold book-description-heading">Description</h5>
                                        <p className="book-description text-justify">{book.description}</p>
                                        <p className="book-description text-justify">{book.description}</p>
                                    </div>

                                    {/* Price and Actions - Smaller */}
                                    <div className="pt-1 mt-1 mb-1 pb-1">
                                        <div>
                                            <span className="h5 fw-bold text-secondary">{book.currency} {book.price.toLocaleString()}</span>
                                        </div>
                                    </div>   

                                    <div className="d-flex justify-content-between pt-1 mt-1 mb-1 pb-1">
                                        <div className="d-flex gap-2">
                                            <button className={`btn btn-primary px-3 small-btn ${isInCart ? 'btn-success' : 'btn-outline-primary'}`}
                                                onClick={handleCartAction}
                                                style={{ 
                                                    transition: 'all 0.3s',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}>
                                                <i className={`bi ${isInCart ? 'bi-check-lg' : 'bi-cart-plus me-1'}`}></i> Add to Cart
                                            </button>
                                            <button className="btn btn-secondary px-3 small-btn" disabled>
                                                <i className="bi bi-download me-1"></i> Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Free Audiobook Card */
                <div className="book-container container mt-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <a href="/" className="text-decoration-none">Home</a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/audiobooks" className="text-decoration-none">Audiobooks</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                {book.title}
                            </li>
                        </ol>
                    </nav>

                    <div className="row">
                        {/* Audiobook Info Section - Left Side */}
                        <div className="col-md-4">
                            <div className="card shadow-sm border-0">
                                <div className="card-body text-center p-4">
                                    <div className="mb-4 position-relative">
                                        <div className="position-relative">
                                            <img src={bCover} alt="audiobook cover" className='abook-cover-img'/>
                                            
                                            <div className="position-absolute" style={{ top: '10px', left: '10px', zIndex: 1 }}>
                                                <span className="badge bg-info text-white px-3 py-2 shadow-sm">
                                                    <i className="bi bi-headphones me-1"></i> Audiobook
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="audio-player-container mb-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <h6 className="fw-bold mb-0">Listen to Sample</h6>
                                                </div>
                                                <div>
                                                    <small className="text-muted">3:00 preview</small>
                                                </div>
                                            </div>
                                            
                                            <div 
                                                className="progress-container mb-2" 
                                                onClick={handleProgressClick}
                                                style={{ cursor: 'pointer', position: 'relative' }}
                                            >
                                                <div className="progress" style={{height: '6px', backgroundColor: '#e9ecef'}}>
                                                    <div 
                                                        ref={progressRef}
                                                        className="progress-bar bg-primary" 
                                                        role="progressbar" 
                                                        style={{width: '0%', transition: 'none'}}
                                                        aria-valuenow={currentTime}
                                                        aria-valuemin="0"
                                                        aria-valuemax={duration}
                                                    ></div>
                                                </div>
                                                <div className="d-flex justify-content-between mt-1">
                                                    <small className="text-muted">{formatTime(currentTime)}</small>
                                                    <small className="text-muted">{formatTime(duration)}</small>
                                                </div>
                                            </div>
                                            
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <button 
                                                        className="btn btn-outline-primary btn-sm me-2"
                                                        onClick={togglePlayPause}
                                                        aria-label={isPlaying ? "Pause sample" : "Play sample"}
                                                    >
                                                        <i className={`bi ${isPlaying ? 'bi-pause' : 'bi-play'}`}></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-outline-secondary btn-sm me-3"
                                                        onClick={toggleMute}
                                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                                    >
                                                        <i className={`bi ${isMuted ? 'bi-volume-mute' : 'bi-volume-up'}`}></i>
                                                    </button>
                                                    <div className="volume-control" style={{ width: '80px' }}>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="1"
                                                            step="0.01"
                                                            value={volume}
                                                            onChange={handleVolumeChange}
                                                            className="form-range volume-slider"
                                                            style={{ height: '5px', background: `linear-gradient(to right, #4a6bdf 0%, #4a6bdf ${volume * 100}%, #e9ecef ${volume * 100}%, #e9ecef 100%)`}}
                                                            aria-label="Volume control"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                        if (audioRef.current) {
                                                            audioRef.current.currentTime = 0;
                                                            setCurrentTime(0);
                                                            if (progressRef.current) {
                                                                progressRef.current.style.width = '0%';
                                                            }
                                                        }
                                                    }}
                                                    aria-label="Reset audio"
                                                >
                                                    <i className="bi bi-arrow-clockwise"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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

                                    <div className="mb-5">
                                        <span className="rating-badge me-2">
                                            <i className="bi bi-star-fill text-warning small"></i>
                                            <span className="ms-1 fw-bold small">{book.rating}</span>
                                            <span className="text-muted ms-1 small">Ratings</span>
                                        </span>
                                        <button 
                                            className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                                            onClick={toggleWishlist}
                                            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                        >
                                            <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} wishlist-icon`}></i>
                                            <span className="wishlist-text ms-1">
                                                {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex gap-3 mb-3">
                                            <span className="text-secondary">
                                                <i className="bi bi-clock me-1"></i>
                                                {book.duration}
                                            </span>
                                            <span className="text-secondary">
                                                <i className="bi bi-file-earmark-text me-1"></i>
                                                {book.format}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-5">
                                        <h5 className="mb-2 fw-bold book-description-heading">Description</h5>
                                        <p className="book-description text-justify">{book.description}</p>
                                        <p className="book-description text-justify">{book.description}</p>
                                    </div>

                                    <div className="d-flex justify-content-between pt-2 mt-3 mb-1 pb-1">
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-outline-primary px-3 small-btn">
                                                <i className="bi bi-eye me-1"></i> Preview
                                            </button>
                                            <button className="btn btn-primary px-3 small-btn">
                                                <i className="bi bi-download me-1"></i> Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookHeaderSection;


