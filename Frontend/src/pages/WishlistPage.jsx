import React, { useState } from "react";
import WishlistGrid from "../components/WishlistGrid";
import PaginationSection from "../components/PaginationSection";
import booksData from "../data/books.json";

const ITEMS_PER_PAGE = 4;

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(booksData);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(wishlist.length / ITEMS_PER_PAGE);

  const paginatedBooks = wishlist.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = (id) => {
    const updated = wishlist.filter((b) => b.id !== id);
    setWishlist(updated);

    if ((currentPage - 1) * ITEMS_PER_PAGE >= updated.length) {
      setCurrentPage((p) => Math.max(p - 1, 1));
    }
  };

  return (
    <div className="wishlist-page container">
      <div className="wishlist-header">
        <h4>
          <i className="bi bi-heart-fill text-danger"></i> My Wishlist
        </h4>
        <p>{wishlist.length} books saved for later</p>
      </div>

      <WishlistGrid books={paginatedBooks} onDelete={handleDelete} />

      {totalPages > 1 && (
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
