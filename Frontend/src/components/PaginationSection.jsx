import React from "react";

const PaginationSection = ({ currentPage, totalPages, changePage }) => {
  return (
    <div className="d-flex justify-content-center mt-4">
      <ul className="pagination">

        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => changePage(currentPage - 1)}>
            <i className="bi bi-chevron-left"></i> Previous
          </button>
        </li>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <li
            key={num}
            className={`page-item ${currentPage === num ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => changePage(num)}>
              {num}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => changePage(currentPage + 1)}>
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </li>

      </ul>
    </div>
  );
};

export default PaginationSection;
