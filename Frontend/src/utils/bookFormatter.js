// This function takes a raw book from the database and converts it 
export const formatBookData = (book) => {
    return {
        id: book._id, // MongoDB uses _id, Frontend uses id
        title: book.title,
        author: book.author,
        price: book.price,
        // Handle the nested rating object safely
        rating: book.ratingStats?.average || 0, 
        // Handle the nested nested cover image
        image: book.coverImage || book.cloudinaryUrl || "https://img.freepik.com/free-vector/realistic-book-template-front-side_23-2147504375.jpg?t=st=1765781181~exp=1765784781~hmac=018dd9400eacd6dbe930b7a0a16f2dc85d1fc9fce0967270dd0bcba17c7a1e1e&w=1060",
        type: book.type,
        // Additional fields you might need later
        downloadUrl: book.fileInfo?.downloadUrl,
        format: book.fileFormat
    };
};