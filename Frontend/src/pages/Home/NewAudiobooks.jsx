import React, { useEffect, useState } from "react";
import AudioBookCarousel from "../../components/AudioBookCarousel";
import { fetchNewAudiobooks } from "../../services/book.service";

const NewAudiobooks = () => {
  const [audiobooks, setAudiobooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAudiobooks = async () => {
      try {
        // 1. Fetch data from backend
        const response = await fetchNewAudiobooks();

        // 2. The backend returns { success: true, data: [...] }
        if (response.success && Array.isArray(response.data)) {
          
          // 3. Map backend fields to Frontend Component props
          const formattedBooks = response.data.map((book) => ({
            id: book._id,           
            title: book.title,
            author: book.author,
            price: book.price,
            rating: book.ratingStats?.average || 0, 
            type: book.type,
            image: book.image//book.coverImage || book.cloudinaryUrl 
          }));

          setAudiobooks(formattedBooks);
        }
      } catch (error) {
        console.error("Failed to load audiobooks:", error);
      } finally {
        setLoading(false);
      }
    };

    getAudiobooks();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading Audiobooks...</div>;
  }

  // Only show carousel if we have books
  if (audiobooks.length === 0) return null;

  return <AudioBookCarousel title="New Audiobooks" audiobooks={audiobooks} />;
};

export default NewAudiobooks;



{/*import React, { useEffect, useState } from "react";
import AudioBookCarousel from "../../components/AudioBookCarousel";
import { fetchNewAudiobooks } from "../../services/book.service";

const NewAudiobooks = () => {
  // Optional: filter only audiobooks
  const audiobooks = booksData.map(book => ({
    id: book._id,
    title: book.title,
    author: book.author,
    price: book.price,
    rating: book.rating, 
    type: book.type, 
    image: book.coverImage
  }));

  return <AudioBookCarousel title="New Audiobooks" audiobooks={audiobooks} />;
};

export default NewAudiobooks; */}