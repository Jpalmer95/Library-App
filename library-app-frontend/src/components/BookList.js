import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import '../global.css'; // Import global styles
const BookList = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const result = await axios.get('http://localhost:5000/books');
            if (Array.isArray(result.data)) {
                setBooks(result.data);
            } else {
                console.error('API did not return an array:', result.data);
                setBooks([]); // or handle error state
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks([]); // or handle error state
        }
    };

    const deleteBook = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete ${title}?`)) {
            try {
                await axios.delete(`http://localhost:5000/books/${id}`);
                setBooks(prevBooks => prevBooks.filter(book => book.id !== id));
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }
    };

    return (
        <div>
            <h1>Library Books</h1>
            <button onClick={() => window.location.href = "/add"}>Add New Book</button>
            <div className="book-grid">
                {books.length > 0 ? (
                    books.map(book => (
                        <div key={book.id} className="book-tile">
                            {book.image_filename && (
                                <img 
                                    src={`http://localhost:5000/uploads/${book.image_filename}`} 
                                    alt={book.title} 
                                    className="book-image"
                                />
                            )}
                            <h2>{book.title}</h2>
                            <p>Author: {book.author}</p>
                            <p>Year: {book.year}</p>
                            <p>Genre: {book.genre}</p>
                            
                            <div className="edit-delete-buttons">
                                <div className="edit-delete-buttons-center-spacing">
                                <button aria-describedby={`${book.title}`} onClick={() => window.location.href = `/edit/${book.id}`}>Edit</button>
                                </div>
                                <button aria-describedby={`${book.title}`} onClick={() => deleteBook(book.id, book.title)}>Delete</button>
                            </div>

                        </div>
                    ))
                ) : (
                    <p>No books available or loading...</p>
                )}
            </div>
        </div>
    );
};

// Future book image upload feature. Not implementing for now
const ImageUploader = ({ bookId }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            const formData = new FormData();
            formData.append('file', file);

            axios.post(`http://localhost:5000/books/${bookId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then(response => {
                console.log('File uploaded successfully:', response.data);
                // Refresh the book list or perform any other actions on success
                // You might want to trigger fetchBooks() here
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        }
    }, [bookId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
    });

    return (
        <div {...getRootProps()} className="image-uploader">
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the files here...</p>
            ) : (
                <p>Drag & drop an image, or click to select one</p>
            )}
        </div>
    );
};

export default BookList;
