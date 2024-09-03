import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const EditBook = () => {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [year, setYear] = useState('');
    const [genre, setGenre] = useState('');
    const [errors, setErrors] = useState({});  // State to store error messages

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/books/${id}`);
                const book = response.data;
                setTitle(book.title);
                setAuthor(book.author);
                setYear(book.year);
                setGenre(book.genre);
            } catch (error) {
                console.error('Error fetching book:', error);
            }
        };
        fetchBook();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setErrors({});

        if (validateBook()) {
            try {
                await axios.put(`http://localhost:5000/books/${id}`, {
                    title, author, year, genre
                });
                alert('Book updated successfully');
                window.location.href = "/"; // Redirect to home or book list page
            } catch (error) {
                console.error('Error updating book:', error);
                alert('Failed to update book. Please try again.');
            }
        }
    };

    const validateBook = () => {
        const newErrors = {};
        if (!title) newErrors.title = 'Title is required';
        if (!author) newErrors.author = 'Author is required';
        if (!year) newErrors.year = 'Year is required';
        if (!genre) newErrors.genre = 'Genre is required';
        if (isNaN(year) || year.length !== 4) newErrors.year = 'Year must be a 4-digit number';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1>Edit Book</h1>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="title">Title</label>
                <input 
                    type="text" 
                    id="title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className={errors.title ? 'error-input' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

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
