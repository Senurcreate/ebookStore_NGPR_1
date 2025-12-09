import React, { useEffect, useState } from 'react';
import bookService from '../service/bookService';

const DebugBookData = () => {
  const [debugData, setDebugData] = useState([]);
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        // Test the API directly
        const response = await fetch('http://localhost:5000/api/books?limit=2');
        const data = await response.json();
        setRawData(data);
        
        // Also test through service
        const books = await bookService.getBestSellers(2);
        setDebugData(books);
        
      } catch (error) {
        console.error('Debug error:', error);
      }
    };

    fetchDebugData();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <h5 style={{ color: 'yellow' }}>Debug Info</h5>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h6>Raw API Response:</h6>
          <pre style={{ fontSize: '10px' }}>
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </div>
        
        <div style={{ flex: 1 }}>
          <h6>Formatted Books (after bookService):</h6>
          <pre style={{ fontSize: '10px' }}>
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
        
        <div style={{ flex: 1 }}>
          <h6>Image URLs in BookCard:</h6>
          {debugData.map((book, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <div><strong>Book {index + 1}:</strong> {book.title}</div>
              <div><small>image field: {book.image || '(empty)'}</small></div>
              <div><small>coverImage field: {book.coverImage || '(empty)'}</small></div>
              {book.image && (
                <img 
                  src={book.image} 
                  alt="preview" 
                  style={{ width: '50px', height: 'auto', marginTop: '5px' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugBookData;