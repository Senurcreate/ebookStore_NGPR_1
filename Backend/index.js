const express = require('express')
const app = express();
const cors = require("cors")
const port = 3000

const mongoose = require('mongoose');
require('dotenv').config()

//middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))

// Defining all routes first
const bookRoutes = require('./src/books/book.route')
app.use("/api/books", bookRoutes)

// Connect to database and start server
async function startServer() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB successfully');
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit if database connection fails
  }
}

// Start the server
startServer();
