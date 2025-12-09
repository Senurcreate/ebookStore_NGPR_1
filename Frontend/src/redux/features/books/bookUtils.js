// Format book data for display
export const formatBookData = (book) => {
  if (!book) return null;

  return {
    ...book,
    formattedPrice: book.price === 0 ? 'Free' : `$${book.price.toFixed(2)}`,
    formattedPublicationDate: book.publication_date 
      ? new Date(book.publication_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown date',
    isPremium: book.price > 0,
    narratorsList: book.narrators?.map(n => n.name).join(', ') || '',
    typeDisplay: book.type === 'audiobook' ? '🎵 Audiobook' : '📖 Ebook',
  };
};

// Validate book form data
export const validateBookForm = (formData, bookType) => {
  const errors = {};

  // Common required fields
  if (!formData.title?.trim()) errors.title = 'Title is required';
  if (!formData.author?.trim()) errors.author = 'Author is required';
  if (!formData.publisher?.trim()) errors.publisher = 'Publisher is required';
  if (!formData.publication_date) errors.publication_date = 'Publication date is required';
  if (!formData.description?.trim()) errors.description = 'Description is required';
  if (!formData.genre?.trim()) errors.genre = 'Genre is required';
  if (!formData.isbn?.trim()) errors.isbn = 'ISBN is required';
  if (!formData.coverImage?.trim()) errors.coverImage = 'Cover image is required';
  if (!formData.driveUrl?.trim()) errors.driveUrl = 'Drive URL is required';
  
  // Price validation
  const price = parseFloat(formData.price);
  if (isNaN(price) || price < 0) {
    errors.price = 'Price must be a valid number >= 0';
  }

  // Type-specific validation
  if (bookType === 'ebook') {
    const pages = parseInt(formData.pages);
    if (isNaN(pages) || pages <= 0) {
      errors.pages = 'Pages must be a positive integer';
    }
  } else if (bookType === 'audiobook') {
    if (!formData.audioLength?.trim()) {
      errors.audioLength = 'Audio length is required';
    } else if (!/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{2}$/.test(formData.audioLength)) {
      errors.audioLength = 'Format must be HH:MM:SS or MM:SS';
    }

    if (!formData.narrators || !Array.isArray(formData.narrators) || formData.narrators.length === 0) {
      errors.narrators = 'At least one narrator is required';
    } else {
      formData.narrators.forEach((narrator, index) => {
        if (!narrator.name?.trim()) {
          errors[`narrators.${index}`] = 'Narrator name is required';
        }
      });
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Prepare form data for submission
export const prepareBookData = (formData) => {
  const data = { ...formData };
  
  // Convert dates
  if (data.publication_date) {
    data.publication_date = new Date(data.publication_date).toISOString();
  }

  // Convert numbers
  if (data.price !== undefined) {
    data.price = parseFloat(data.price);
  }
  
  if (data.pages !== undefined) {
    data.pages = parseInt(data.pages);
  }
  
  if (data.preview?.pages !== undefined) {
    data.preview = {
      ...data.preview,
      pages: parseInt(data.preview.pages),
    };
  }
  
  if (data.preview?.sampleMinutes !== undefined) {
    data.preview = {
      ...data.preview,
      sampleMinutes: parseInt(data.preview.sampleMinutes),
    };
  }

  // Convert narrators if present
  if (data.narrators && Array.isArray(data.narrators)) {
    data.narrators = data.narrators.map(n => ({
      name: n.name.trim(),
    }));
  }

  return data;
};

// Filter books by various criteria
export const filterBooks = (books, filters) => {
  return books.filter(book => {
    // Search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableFields = [
        book.title,
        book.author,
        book.description,
        book.genre,
        book.narratorsList,
      ].join(' ').toLowerCase();
      
      if (!searchableFields.includes(searchLower)) {
        return false;
      }
    }

    // Type filter
    if (filters.type && book.type !== filters.type) {
      return false;
    }

    // Price filter
    if (filters.price === 'free' && book.price !== 0) {
      return false;
    }
    if (filters.price === 'premium' && book.price === 0) {
      return false;
    }

    // Genre filter
    if (filters.genre && book.genre !== filters.genre) {
      return false;
    }

    // Trending filter
    if (filters.trending && !book.trending) {
      return false;
    }

    return true;
  });
};

// Sort books
export const sortBooks = (books, sortBy, sortOrder = 'desc') => {
  return [...books].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'author':
        aValue = a.author.toLowerCase();
        bValue = b.author.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'rating':
        aValue = a.ratingStats?.average || 0;
        bValue = b.ratingStats?.average || 0;
        break;
      case 'publication_date':
        aValue = new Date(a.publication_date);
        bValue = new Date(b.publication_date);
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};