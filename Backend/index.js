const express = require('express');
const app = express();
const cors = require("cors")
const port = 3000
const helmet = require('helmet');
const morgan = require('morgan');

const mongoose = require('mongoose');
require('dotenv').config()

/* Load test auth routes
try {
  const testAuthRoutes = require('./routes/test-auth.routes');
  app.use("/api/test-auth", testAuthRoutes);
  console.log('✅ Test auth routes loaded');
} catch (error) {
  console.log('⚠️  Test auth routes not loaded:', error.message);
}*/

// Initialize Firebase Admin
require('./src/config/firebase.config');



//middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // HTTP request logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Bookstore API',
    version: '1.0.0',
     database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'

  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});



// Defining all routes first
const bookRoutes = require('./src/books/book.route')
const downloadRoutes = require('.src/downloads/download.route')
const adminRoutes = require('./src/admin/admin.route')
const purchaseRoutes = require('./src/purchases/purchase.route')

app.use("/api/books", bookRoutes)
app.use("/api/downloads" , downloadRoutes)
app.use("/api/admin" , adminRoutes)
app.use("/api/purchases" , purchaseRoutes)


// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


// Connect to database and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB successfully');
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`✅ Server is running on http://localhost:${port}`);
      console.log(`API Base URL: http://localhost:${port}/api`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Books API: http://localhost:${port}/api/books`);
      console.log(`Health Check: http://localhost:${port}/health`);
      console.log(`Test API: http://localhost:${port}/api/test`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    
    // Try alternative connection string if needed
    if (error.message.includes('options')) {
      console.log('Trying alternative connection without options...');
      try {
        // Try simpler connection
        await mongoose.connect(process.env.DB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB with alternative options');
        
        app.listen(port, () => {
          console.log(`🚀 Server is running on http://localhost:${port}`);
        });
      } catch (secondError) {
        console.error('❌ Still failed to connect:', secondError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
}


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});



// Start the server
startServer();