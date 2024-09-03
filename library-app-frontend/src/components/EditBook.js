import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditBook = () => {
    // Get the book ID from the URL parameters
    const { id } = useParams();

    // Initialize state variables for the book's fields and errors
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [year, setYear] = useState('');
    const [genre, setGenre] = useState('');
    const [errors, setErrors] = useState({});  // State to store error messages

    // Use effect to fetch the book data when the component mounts
    useEffect(() => {
        const fetchBook = async () => {
        try {
            // Send a GET request to the server to retrieve the book data
            const response = await axios.get(`http://localhost:5000/books/${id}`);
            const book = response.data;
            // Update the state variables with the book data
            setTitle(book.title);
            setAuthor(book.author);
            setYear(book.year);
            setGenre(book.genre);
        } catch (error) {
            // Log any errors that occur during the fetch process
            console.error('Error fetching book:', error);
        }
    };
        fetchBook();
    }, [id]); // Re-run the effect when the book ID changes

    // Define the handleSubmit function to handle form submission
    const handleSubmit = async (e) => {
        // Prevent default form submission behavior
        e.preventDefault();
        
        // Clear previous errors
        setErrors({});

        // Validate the book data
        if (validateBook()) {
            try {
                // Send a PUT request to the server to update the book data
                await axios.put(`http://localhost:5000/books/${id}`, {
                    title, author, year, genre
                });
                // Display a success message to the user
                alert('Book updated successfully');
                window.location.href = "/"; // Redirect to home or book list page
            } catch (error) {
                // Log any errors that occur during the update process
                console.error('Error updating book:', error);
                // Display an error message
                alert('Failed to update book. Please try again.');
            }
        }
    };

        // Define the validateBook function to validate the book data
    const validateBook = () => {
        // Initialize an object to store error messages
        const newErrors = {};
        // Check if the title is empty
        if (!title) newErrors.title = 'Title is required';
        // Check if the author is empty
        if (!author) newErrors.author = 'Author is required';
        // Check if the year is empty
        if (!year) newErrors.year = 'Year is required';
        // Check if the genre is empty
        if (!genre) newErrors.genre = 'Genre is required';
        // Check if the year is a valid 4-digit number
        if (isNaN(year) || year.length !== 4) newErrors.year = 'Year must be a 4-digit number';
        
        // Update the error state with the new error messages
        setErrors(newErrors);
        // Return true if there are no errors, false otherwise
        return Object.keys(newErrors).length === 0;
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1>Edit Book</h1>
            {/* Render the title input field */}
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="title">Title</label>
                <input 
                    type="text" 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className={errors.title ? 'error-input' : ''}
                />
                {/* Render an error message if the title is invalid */}
                {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Render the author input field */}
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="author">Author</label>
                <input 
                    type="text" 
                    id="author" 
                    value={author} 
                    onChange={e => setAuthor(e.target.value)} 
                    className={errors.author ? 'error-input' : ''}
                />
                {errors.author && <span className="error-message">{errors.author}</span>}
            </div>
            
            {/* Render the year input field */}
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="year">Year</label>
                <input 
                    type="text" 
                    id="year" 
                    value={year} 
                    onChange={e => setYear(e.target.value)} 
                    className={errors.year ? 'error-input' : ''}
                />
                {errors.year && <span className="error-message">{errors.year}</span>}
            </div>
            
            {/* Render the genre input field */}
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="genre">Genre</label>
                <input 
                    type="text" 
                    id="genre" 
                    value={genre} 
                    onChange={e => setGenre(e.target.value)} 
                    className={errors.genre ? 'error-input' : ''}
                />
                {errors.genre && <span className="error-message">{errors.genre}</span>}
            </div>
            
            <button type="submit">Update Book</button>
        </form>
    );
};

export default EditBook;
