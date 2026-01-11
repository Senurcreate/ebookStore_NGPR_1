import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const AddBookModal = ({ show, onClose, onSave, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Default Empty State
  const defaultState = {
    title: '', author: '', publisher: '', publication_date: '', description: '',
    genre: '', language: 'English', isbn: '', price: 0, trending: false,
    coverImage: '', cloudinaryUrl: '', type: 'ebook', pages: '',
    audioLength: '', narratorsInput: '', audioSampleCloudinaryUrl: '', audioQuality: 'Standard'
  };

  const [formData, setFormData] = useState(defaultState);

  // Effect: Populate form when opening in Edit Mode
  useEffect(() => {
    if (show && initialData) {
        // Format incoming data to match form state
        setFormData({
            ...defaultState,
            ...initialData,
            publication_date: initialData.publication_date ? new Date(initialData.publication_date).toISOString().split('T')[0] : '',
            // Convert narrators array back to comma string for input
            narratorsInput: initialData.narrators ? initialData.narrators.map(n => n.name).join(', ') : '',
            price: initialData.price || 0,
            pages: initialData.pages || ''
        });
    } else if (show && !initialData) {
        setFormData(defaultState); // Reset for Add Mode
    }
    setError('');
  }, [show, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        pages: formData.type === 'ebook' ? Number(formData.pages) : undefined,
      };

      if (formData.type === 'audiobook' && formData.narratorsInput) {
        payload.narrators = formData.narratorsInput.split(',').map(name => ({ name: name.trim() }));
      }

      // Cleanup
      if (formData.type === 'ebook') {
        delete payload.audioLength; delete payload.narrators; delete payload.audioSampleCloudinaryUrl; delete payload.audioQuality;
      } else {
        delete payload.pages;
      }
      delete payload.narratorsInput; 

      delete payload._id;

      let res;
      if (initialData) {
        // --- EDIT MODE (PUT) ---
        res = await axiosInstance.put(`/books/${initialData._id}`, payload);
      } else {
        // --- ADD MODE (POST) ---
        res = await axiosInstance.post('/books/create-book', payload);
      }
      
      if (res.data.success) {
        // Pass back the saved book and a flag indicating if it was an edit
        onSave(res.data.book || res.data.data, !!initialData); 
        onClose(); 
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            
            <div className="modal-header bg-white border-bottom-0">
              <h5 className="modal-title fw-bold">{initialData ? 'Edit Book' : 'Add New Book'}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              
              <form onSubmit={handleSubmit} id="bookForm">
                {/* --- Row 1 --- */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Title</label>
                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Author</label>
                    <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} required />
                  </div>
                </div>

                {/* --- Row 2 --- */}
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Type</label>
                    <select className="form-select" name="type" value={formData.type} onChange={handleChange} disabled={!!initialData}>
                      <option value="ebook">E-Book</option>
                      <option value="audiobook">Audiobook</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">ISBN</label>
                    <input type="text" className="form-control" name="isbn" value={formData.isbn} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Price ($)</label>
                    <input type="number" step="0.01" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
                  </div>
                </div>

                {/* --- Conditional --- */}
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  {formData.type === 'ebook' ? (
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-muted">Pages</label>
                        <input type="number" className="form-control" name="pages" value={formData.pages} onChange={handleChange} required />
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Duration</label>
                        <input type="text" className="form-control" name="audioLength" value={formData.audioLength} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Quality</label>
                        <select className="form-select" name="audioQuality" value={formData.audioQuality} onChange={handleChange}>
                          <option value="Standard">Standard</option>
                          <option value="High">High</option>
                          <option value="Lossless">Lossless</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Narrators</label>
                        <input type="text" className="form-control" name="narratorsInput" value={formData.narratorsInput} onChange={handleChange} required />
                      </div>
                    </div>
                  )}
                </div>

                {/* --- URLs --- */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Cover Image URL</label>
                  <input type="url" className="form-control" name="coverImage" value={formData.coverImage} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">File URL</label>
                  <input type="url" className="form-control" name="cloudinaryUrl" value={formData.cloudinaryUrl} onChange={handleChange} required />
                </div>

                {/* --- Publishing --- */}
                <div className="row g-3 mb-3">
                   <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Publisher</label>
                    <input type="text" className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Date</label>
                    <input type="date" className="form-control" name="publication_date" value={formData.publication_date} onChange={handleChange} required />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Genre</label>
                    <input type="text" className="form-control" name="genre" value={formData.genre} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Language</label>
                      <input type="text" className="form-control" name="language" value={formData.language} onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Description</label>
                  <textarea className="form-control" rows="3" name="description" value={formData.description} onChange={handleChange} required></textarea>
                </div>

                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id="trendingCheck" name="trending" checked={formData.trending} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="trendingCheck">Mark as Trending</label>
                </div>
              </form>
            </div>

            <div className="modal-footer border-top-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-light" onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" form="bookForm" className="btn btn-dark px-4" disabled={loading}>
                {loading ? 'Saving...' : (initialData ? 'Update Book' : 'Create Book')}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AddBookModal;