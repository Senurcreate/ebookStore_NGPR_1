import React, { useState, useEffect } from "react";
import WishlistGrid from "../components/WishlistGrid";
import PaginationSection from "../components/PaginationSection";
import { useAuth } from '../context/AuthContext'; 
import { fetchWishlist, removeByBookId } from "../services/wishlist.service";

const ITEMS_PER_PAGE = 12;

const WishlistPage = () => {
  // Call the hook to get the user
  const { currentUser } = useAuth(); 

  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Add state for total items (to fix the scope error)
  const [totalItems, setTotalItems] = useState(0); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("ebook");

  const formatWishlistData = (item) => {
    const book = item.book;
    // Check if book exists to prevent errors if book was deleted from DB but remains in wishlist
    if (!book) return null; 

    return {
      id: book._id,
      title: book.title,
      author: book.author,
      image: book.coverImage || book.cloudinaryUrl || "https://via.placeholder.com/150",
      price: book.price,
      rating: book.ratingStats?.average || 0,
      type: book.type
    };
  };

  const loadWishlist = async () => {
    // 4. Don't fetch if no user
    if (!currentUser) return; 

    setLoading(true);
    try {
      const response = await fetchWishlist(currentPage, ITEMS_PER_PAGE);

      if (response.data) {
        // Filter out nulls in case of corrupted data
        const formattedBooks = response.data.map(formatWishlistData).filter(item => item !== null);
        setWishlist(formattedBooks);

        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems); // Store total items in state
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  // Add currentUser to dependency array
  // This ensures data refreshes if user logs in/out
  useEffect(() => {
    if (currentUser) {
        loadWishlist();
    } else {
        // Clear data if user logs out
        setWishlist([]);
        setTotalItems(0);
        setLoading(false);
    }
    window.scrollTo(0, 0);
  }, [currentPage, currentUser]); 

  const handleDelete = async (bookId) => {
    const originalList = [...wishlist];
    setWishlist(wishlist.filter((b) => b.id !== bookId));

    // Optimistically update count
    setTotalItems(prev => prev - 1);

    try {
      await removeByBookId(bookId);

      if (wishlist.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        loadWishlist();
      }
    } catch (err) {
      alert("Failed to remove book.");
      setWishlist(originalList); 
      setTotalItems(prev => prev + 1); // Revert count
    }
  };

  // Show login message if not authenticated
  if (!loading && !currentUser) {
      return (
          <div className="container py-5 text-center">
              <h4>Please log in to view your wishlist.</h4>
          </div>
      );
  }

  // 2. Filter logic for the current page of items
  const ebooks = wishlist.filter(item => item.type === 'ebook');
  const audiobooks = wishlist.filter(item => item.type === 'audiobook');
  
  // Decide what to show based on active tab
  const displayedItems = activeTab === 'ebook' ? ebooks : audiobooks;


  return (
    <div className="wishlist-page container">
      <div className="wishlist-header">
        <h4>
          <i className="bi bi-heart-fill text-danger"></i> My Wishlist
        </h4>
        {!loading && <p>{totalItems} books saved for later</p>}
      </div>

      {/* 3. TABS UI */}
      <ul className="nav nav-underline mb-4 border-bottom">
        <li className="nav-item">
            <button 
                className={`nav-link border-0 px-4 ${activeTab === 'ebook' ? 'active fw-bold text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('ebook')}
                style={{ background: 'none' }}
            >
                eBooks ({ebooks.length})
            </button>
        </li>
        <li className="nav-item">
            <button 
                className={`nav-link border-0 px-4 ${activeTab === 'audiobook' ? 'active fw-bold text-primary' : 'text-muted'}`}
                onClick={() => setActiveTab('audiobook')}
                style={{ background: 'none' }}
            >
                Audiobooks ({audiobooks.length})
            </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : error ? (
        <div className="text-center py-5 text-danger">{error}</div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-5">
            <h5>Your wishlist is empty.</h5>
        </div>
      ) : (
        <WishlistGrid 
            books={displayedItems} 
            onDelete={handleDelete} 
            viewType={activeTab} 
        />
      )}

      {!loading && !error && totalPages > 1 && (
        <PaginationSection
          currentPage={currentPage}
          totalPages={totalPages}
          changePage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default WishlistPage;