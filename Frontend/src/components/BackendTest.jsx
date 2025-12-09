import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BackendTest = () => {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    axios.get('http://localhost:5000/api/books?limit=1')
      .then(() => setStatus('✅ Backend Connected'))
      .catch(() => setStatus('❌ Backend Not Connected - Using Mock Data'));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: status.includes('✅') ? '#d4edda' : '#f8d7da',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      {status}
    </div>
  );
};

export default BackendTest;