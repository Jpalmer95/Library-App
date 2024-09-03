import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBook = () => {
    // Initialize state variables for form fields and errors
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [year, setYear] = useState('');
    const [genre, setGenre] = useState('');
    const [errors, setErrors] = useState({});
    
    // Get the navigate function from react-router-dom
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear previous errors
        setErrors({});

        // Validate form inputs
        const validationErrors = validateBook({ title, author, year, genre });

        // If there are no validation errors, submit the form data to the server
        if (Object.keys(validationErrors).length === 0) {
            try {
                // Send a POST request to the server with the form data
                const response = await axios.post('http://localhost:5000/books', {
                    title, author, year, genre
                });
                // Log the response data to the console
                console.log('Book added:', response.data);
                // Display a success message to the user
                alert('Book added successfully');
                // Navigate to the root route
                navigate('/');
                // Reset form fields for additional book entry
                setTitle('');
                setAuthor('');
                setYear('');
                setGenre('');
            } catch (error) {
                // Log any errors to the console
                console.error('Error adding book:', error);
                alert('Failed to add book. Please try again.');
            }
        } else {
            // Set the validation errors in state
            setErrors(validationErrors);
        }
    };

    // Define the validateBook function to validate form inputs
    const validateBook = (book) => {
        // Initialize an object to store error messages
        const errors = {};
        // Validate each form field
        if (!book.title) errors.title = "Title is required";
        if (!book.author) errors.author = "Author is required";
        if (!book.year) errors.year = "Year is required";
        else if (isNaN(book.year) || book.year.length !== 4) errors.year = "Year must be a 4-digit number";
        if (!book.genre) errors.genre = "Genre is required";
        return errors;
    };


    return (
        <div>
            <h1>Add a Book To Your Collection</h1>
            <form onSubmit={handleSubmit}>
                
                <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        className={errors.title ? 'error-input' : ''}
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>
                
                <div className={`form-group ${errors.author ? 'has-error' : ''}`}>
                    <label htmlFor="author">Author</label>
                    <input
                        id="author"
                        type="text"
                        className={errors.author ? 'error-input' : ''}
                        placeholder="Author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                    />
                    {errors.author && <span className="error-message">{errors.author}</span>}
                </div>
                
                <div className={`form-group ${errors.year ? 'has-error' : ''}`}>
                    <label htmlFor="year">Year</label>
                    <input
                        id="year"
                        type="text"
                        className={errors.year ? 'error-input' : ''}
                        placeholder="Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    />
                    {errors.year && <span className="error-message">{errors.year}</span>}
                </div>

                <div className={`form-group ${errors.genre ? 'has-error' : ''}`}>
                    <label htmlFor="genre">Genre</label>
                    <input
                        id="genre"
                        type="text"
                        className={errors.genre ? 'error-input' : ''}
                        placeholder="Genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    />
                    {errors.genre && <span className="error-message">{errors.genre}</span>}
                </div>

                <button type="submit">Add Book</button>
            </form>
        </div>
    );
};

export default AddBook;
