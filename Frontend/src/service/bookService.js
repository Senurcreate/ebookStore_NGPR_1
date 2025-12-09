import axios from 'axios';

// Test multiple possible backend URLs
const BACKEND_URLS = [
  'http://localhost:5000/api',
  'http://127.0.0.1:5000/api',
  'http://localhost:3001/api',
  'http://localhost:8000/api'
];

let API_URL = BACKEND_URLS[0];
let backendConnected = false;

// Test backend connection
const testBackendConnection = async () => {
  for (const url of BACKEND_URLS) {
    try {
      console.log(`Testing connection to: ${url}`);
      const response = await axios.get(`${url}/books?limit=1`, { 
        timeout: 2000 
      });
      
      if (response.status === 200) {
        API_URL = url;
        backendConnected = true;
        console.log(`✅ Backend connected at: ${url}`);
        return true;
      }
    } catch (error) {
      console.log(`❌ ${url} failed: ${error.message}`);
    }
  }
  
  console.log('❌ No backend found. Using mock data.');
  backendConnected = false;
  return false;
};

// Format books to match your BookCard component
function formatBooks(books) {
  if (!books || !Array.isArray(books)) return [];
  
  return books.map(book => ({
    // Your BookCard uses 'id' and 'image' fields
    id: book._id || book.id,  // Map _id to id
    _id: book._id || book.id,
    title: book.title || '',
    author: book.author || '',
    price: book.price || 0,
    // Your BookCard expects 'rating' (not ratingStats.average)
    rating: book.ratingStats?.average || book.rating || 0,
    ratingStats: book.ratingStats || { average: book.rating || 0, count: 0 },
    type: book.type || 'ebook',
    // CRITICAL: Map coverImage to image (your BookCard uses 'image' prop)
    image: book.coverImage || book.image || '',
    // Also keep coverImage for compatibility
    coverImage: book.coverImage || book.image || '',
    trending: book.trending || false,
    // Include other fields if needed
    genre: book.genre || '',
    description: book.description || ''
  }));
}

const bookService = {
  initialize: async () => {
    await testBackendConnection();
  },

  // Get best sellers
  getBestSellers: async (limit = 10) => {
    try {
      if (!backendConnected) {
        console.log('Using mock data for best sellers');
        // Return formatted mock data
        return formatBooks(getMockBooks().filter(book => book.trending).slice(0, limit));
      }
      
      const response = await axios.get(`${API_URL}/books`, {
        params: { 
          trending: 'true', 
          type: 'ebook', 
          limit: limit 
        },
        timeout: 5000
      });
      
      // Log the actual response to see what's coming
      console.log('Backend response:', response.data);
      
      const books = response.data?.data || response.data || response?.books || [];
      console.log(`✅ Fetched ${books.length} books from backend`);
      
      return formatBooks(books);
      
    } catch (error) {
      console.log('❌ Backend error, using mock data:', error.message);
      backendConnected = false;
      return formatBooks(getMockBooks().filter(book => book.trending).slice(0, limit));
    }
  },

  // Get new releases
  getNewReleases: async (limit = 10) => {
    try {
      if (!backendConnected) {
        console.log('Using mock data for new releases');
        const mockBooks = getMockBooks();
        return formatBooks([...mockBooks].reverse().slice(0, limit));
      }
      
      const response = await axios.get(`${API_URL}/books`, {
        params: { 
          type: 'ebook', 
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: limit 
        },
        timeout: 5000
      });
      
      const books = response.data?.data || response.data || response?.books || [];
      return formatBooks(books);
      
    } catch (error) {
      console.log('❌ Backend error, using mock data for new releases');
      backendConnected = false;
      const mockBooks = getMockBooks();
      return formatBooks([...mockBooks].reverse().slice(0, limit));
    }
  },

  // Get all books
  getAllBooks: async (params = {}) => {
    try {
      if (!backendConnected) {
        console.log('Using mock data for all books');
        return formatBooks(getMockBooks());
      }
      
      const response = await axios.get(`${API_URL}/books`, {
        params: params,
        timeout: 5000
      });
      
      const books = response.data?.data || response.data || response?.books || [];
      return formatBooks(books);
      
    } catch (error) {
      console.log('❌ Backend error, using mock data');
      backendConnected = false;
      return formatBooks(getMockBooks());
    }
  },

  // Check connection status
  getConnectionStatus: () => ({
    connected: backendConnected,
    url: API_URL
  })
};

// Mock data function
function getMockBooks() {
  return [
    {
      _id: "1",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 299,
      ratingStats: { average: 4.5, count: 125 },
      rating: 4.5,
      type: "ebook",
      coverImage: "https://m.media-amazon.com/images/I/71FTb9X6wsL._AC_UF1000,1000_QL80_.jpg",
      genre: "Fiction",
      trending: true,
      pages: 180,
      createdAt: new Date()
    },
    {
      _id: "2",
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      price: 249,
      ratingStats: { average: 4.8, count: 210 },
      rating: 4.8,
      type: "ebook",
      coverImage: "https://m.media-amazon.com/images/I/71FxgtFKcQL._AC_UF1000,1000_QL80_.jpg",
      genre: "Fiction",
      trending: true,
      pages: 281,
      createdAt: new Date()
    },
    {
      _id: "3",
      title: "1984",
      author: "George Orwell",
      price: 199,
      ratingStats: { average: 4.7, count: 189 },
      rating: 4.7,
      type: "ebook",
      coverImage: "https://m.media-amazon.com/images/I/71kxa1-0mfL._AC_UF1000,1000_QL80_.jpg",
      genre: "Dystopian",
      trending: false,
      pages: 328,
      createdAt: new Date()
    }
  ];
}

// Initialize connection
bookService.initialize();

export default bookService;