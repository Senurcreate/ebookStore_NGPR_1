import React from "react";
import "../../styles/main.scss";

const BookDetails = ({ bookType = "ebook", bookData }) => {
  const defaultBookData = {
    title: "The Midnight Library",
    author: "Matt Haig",
    publisher: "Canongate Books",
    publicationDate: "August 13, 2020",
    edition: "First Edition",
    genre: "Contemporary Fiction, Fantasy",
    language: "English",
    isbn: "978-1786892737",

    // Audiobook
    narrator: "Carey Mulligan",
    duration: "8 hours 50 minutes",

    // Ebook
    fileSize: "2.5 MB",
    ebookFormat: "EPUB"
  };

  const data = bookData || defaultBookData;

  // Common fields
  const leftFields = [
    { label: "Title", value: data.title },
    { label: "Author", value: data.author },
    { label: "Publisher", value: data.publisher },
    { label: "Publication Date", value: data.publicationDate },
  ];

  const rightFields = [
    { label: "Edition", value: data.edition },
    { label: "Genre", value: data.genre },
    { label: "Language", value: data.language },
    { label: "ISBN", value: data.isbn },
  ];

  // Type-specific dynamic fields
  const audiobookFields = {
    left: [{ label: "Narrator", value: data.narrator }],
    right: [{ label: "Duration", value: data.duration }],
  };

  const ebookFields = {
    left: [{ label: "File Size", value: data.fileSize }],
    right: [{ label: "Format", value: data.ebookFormat }],
  };

  const typeFields = {
    audiobook: audiobookFields,
    ebook: ebookFields,
  };

  const selectedType = typeFields[bookType] || { left: [], right: [] };

  // Helper to render a field
  const renderField = (label, value) => (
    <div className="mb-3" key={label}>
      <label className="form-label fw-bold">{label}</label>
      <p className="form-control-plaintext border-bottom pb-2">{value}</p>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0 smaller">Book Details</h5>
        </div>

        <div className="card-body">
          <div className="row">

            {/* LEFT COLUMN */}
            <div className="col-md-6">
              {leftFields.map(f => renderField(f.label, f.value))}
              {selectedType.left.map(f => renderField(f.label, f.value))}
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-md-6">
              {rightFields.map(f => renderField(f.label, f.value))}
              {selectedType.right.map(f => renderField(f.label, f.value))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
