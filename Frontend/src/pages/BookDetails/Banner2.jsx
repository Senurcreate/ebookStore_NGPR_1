import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // 1. Import useParams
import "../../styles/main.scss";

// 2. Import your service
import { fetchBookById } from "../../services/book.service";

const BookDetails = () => {
  // 3. Get ID from URL
  const { id } = useParams();

  // 4. State to hold the book data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 5. Fetch Data
  useEffect(() => {
    const loadBookData = async () => {
      try {
        setLoading(true);
        const response = await fetchBookById(id);

        if (response.success && response.book) {
          const rawBook = response.book;
          const formattedInfo = response.book.formattedInfo || {};

          // 6. Map Backend Data to UI Structure
          // We transform the API response into the format this component expects
          setData({
            title: rawBook.title,
            author: rawBook.author,
            publisher: rawBook.publisher,
            // Format the date nicely
            publicationDate: new Date(rawBook.publication_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            edition: "Standard", // Default value (field not in current schema)
            genre: rawBook.genre,
            language: rawBook.language,
            isbn: rawBook.isbn,
            type: rawBook.type, // 'ebook' or 'audiobook'

            // Audiobook specific mapping
            narrator: formattedInfo.narratorsList || "Unknown",
            duration: formattedInfo.audioLength || "Unknown",

            // Ebook specific mapping
            fileSize: formattedInfo.fileSize || "Unknown", // Backend sends "2.5 MB"
            ebookFormat: rawBook.fileFormat || "PDF"
          });
        }
      } catch (err) {
        setError("Failed to load details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBookData();
    }
  }, [id]);

  // 7. Loading/Error States (Simple text to not break layout)
  if (loading) return <div className="container mt-5 text-center"><p>Loading details...</p></div>;
  if (!data) return null;

  // Determine book type from fetched data
  const bookType = data.type === "audiobook" ? "audiobook" : "ebook";

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
    <div className="container mt-4 mb-5 pt-5 pb-5">
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