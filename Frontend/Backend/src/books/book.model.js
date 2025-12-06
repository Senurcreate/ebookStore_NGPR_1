const mongoose =  require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    publisher: {
        type: String,
        required: true,
    },
    publication_date: {
        type: Date,
        required: true,
    },
    description:  {
        type: String,
        required: true,
    },
    genre:  {
        type: String,
        required: true,
    },
    language:  {
        type: String,
        required: true,
    },
    isbn:  {
        type: String,
        required: true,
    },
    trending: {
        type: Boolean,
        required: true,
    },
    coverImage: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["ebook", "audiobook"], // only allows these values
        default: "ebook" // optional default
    },
    fileUrl: {
        type: String, // link to Google Drive 
        required: true
    },
    pages: {
        type: Number,
        required: true
    },
    price: { 
        type: Number, 
        default: 0 
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
  }, {
    timestamps: true,
  });

  const Book = mongoose.model('Book', bookSchema);

  module.exports = Book;