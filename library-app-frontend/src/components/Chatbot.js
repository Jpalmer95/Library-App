import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [message, setMessage] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [inputError, setInputError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/books');
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setInputError(null);

        if (!validateMessage(message)) return;
        setMessages(prevMessages => [{ text: message, user: true }, ...prevMessages]);

        await processQuery(message);
        setMessage('');
    };

    const validateMessage = (msg) => {
        if (!msg.trim()) {
            setInputError('Message cannot be empty');
            return false;
        }
        return true;
    };

    const processQuery = async (query) => {
        const payload = { message: query };

        if (selectedBook) {
            payload.book = selectedBook;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/chat', payload, { timeout: 22000 });
            if (response.data && response.data.response) {
                const chatbotResponse = response.data.response.trim();
                setMessages(prevMessages => [{ text: chatbotResponse, user: false }, ...prevMessages]);
            }
            setError(null);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error) => {
        if (error.response) {
            setError(`Server Error: ${error.response.status} - ${error.response.data.message || 'An error occurred'}`);
        } else if (error.request) {
            setError('No response from server. Please try again.');
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    const handleBookSelect = (event) => {
        const selectedId = event.target.value;
        const book = books.find(book => book.id === parseInt(selectedId));
        setSelectedBook(book);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    

    return (
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <div style={{ backgroundColor: '#003366', borderRadius: '5px 5px 0 0' }}>
                <h2 style={{ color: 'white', margin: 0, textAlign: 'center' }}>Library Chatbot</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img 
            src={`${process.env.PUBLIC_URL}JARVIS the Librarian.jpg`} 
            alt="JARVIS the robot librarian searching on a futuristic terminal for the best book recommendations" 
            width="50%" 
            height="auto"
        />
    </div>
            <div className="book-selection" style={{ marginBottom: '5px' }}>
                <label for="select-a-book"><h2>Select a Book</h2></label>
                <p>Summarize, chat, or get recommendations based on any book in your library.</p>
                <select id="select-a-book" onChange={handleBookSelect} value={selectedBook ? selectedBook.id : ''}>
                    <option value="">Select a book (optional)</option>
                    {books.map((book) => (
                        <option key={book.id} value={book.id}>
                            {book.title} by {book.author}
                        </option>
                    ))}
                </select>
            </div>
            
            <div
                className="chat-container"
                style={{
                    maxHeight: '40vh',  // Increase maxHeight to be more appropriate
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    padding: '10px',
                    borderRadius: '5px',
                    flexGrow: 1  // This will help the chat container grow as needed within the chatbot window
                }}
                ref={chatContainerRef}
            >
                {loading && <p>Loading...</p>}
                {messages.length === 0 && !loading && (
                    <p>No messages yet. Start by selecting a book and asking a question or just ask a general question!</p>
                )}
                {messages.slice(0).reverse().map((msg, index) => (
                    <div key={index} style={{
                        textAlign: msg.user ? 'right' : 'left',
                        backgroundColor: msg.user ? '#e6f3ff' : '#f3f3f3',
                        padding: '10px',
                        borderRadius: '5px',
                        maxWidth: '95%',
                        margin: '10px 0',
                        wordBreak: 'break-word'  // Ensure long messages break correctly
                    }}>
                        {msg.text}
                    </div>
                ))}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <label for="chat-user-query">Chat:</label>
                <input id="chat-user-query"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me something..."
                    required
                    style={{ width: '100%', marginRight: '10px', border: inputError ? '1px solid red' : '1px solid #ccc' }}
                />
                {inputError && <span style={{ color: 'red', fontSize: '0.875rem' }}>{inputError}</span>}
                <button aria-describedby='chat-user-query' type="submit" disabled={loading}>Send</button>
            </form>
        </div>
    );
};

export default Chatbot;
