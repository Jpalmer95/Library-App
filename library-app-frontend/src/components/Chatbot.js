import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
    // Initialize state variables for the chatbot
    const [message, setMessage] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [inputError, setInputError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);
    const chatContainerRef = useRef(null);

    // Use effect to fetch books when the component mounts
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                // Send a GET request to the server to retrieve the list of books
                const response = await axios.get('http://localhost:5000/books');
                setBooks(response.data);
            } catch (error) {
                // Log any errors that occur during the fetch process
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, []);

    // Define the handleSubmit function to handle user input submission
    const handleSubmit = async (e) => {
        // Prevent default form submission behavior
        e.preventDefault();
        // Clear any previous errors
        setError(null);
        setInputError(null);

        // Validate the user's input message
        if (!validateMessage(message)) return;
        // Add the user's message to the conversation history
        setMessages(prevMessages => [{ text: message, user: true }, ...prevMessages]);

        // Process the user's query
        await processQuery(message);
        // Clear the input field after processing the query
        setMessage('');
    };

    // Define the validateMessage function to validate user input
    const validateMessage = (msg) => {
        // Check if the input message is empty
        if (!msg.trim()) {
            // Set an input validation error
            setInputError('Message cannot be empty');
            return false;
        }
        return true;
    };

    // Define the processQuery function to process user queries
    const processQuery = async (query) => {
        // Create a payload object with the user's query
        const payload = { message: query };

        // Add the selected book to the payload if it exists
        if (selectedBook) {
            payload.book = selectedBook;
        }

        // Set the loading state to true
        setLoading(true);

        try {
            // Send a POST request to the server to process the user's query
            const response = await axios.post('http://localhost:5000/chat', payload, { timeout: 22000 });
            // Check if the response contains a chatbot response
            if (response.data && response.data.response) {
                // Add the chatbot's response to the conversation history
                const chatbotResponse = response.data.response.trim();
                setMessages(prevMessages => [{ text: chatbotResponse, user: false }, ...prevMessages]);
            }
            // Clear any previous errors
            setError(null);
        } catch (error) {
            // Handle any errors that occur during the query processing
            handleError(error);
        } finally {
            // Set the loading state to false
            setLoading(false);
        }
    };

    const handleError = (error) => {
        // Check if the error is a server error
        if (error.response) {
            // Set an error message with the server error status and message
            setError(`Server Error: ${error.response.status} - ${error.response.data.message || 'An error occurred'}`);
        } else if (error.request) {
            // Set an error message indicating no response from the server
            setError('No response from server. Please try again.');
        } else {
            // Set a generic error message for other types of errors
            setError('An unexpected error occurred. Please try again.');
        }
    };

    const handleBookSelect = (event) => {
        // Get the selected book ID from the event target value
        const selectedId = event.target.value;
        // Find the selected book in the list of books
        const book = books.find(book => book.id === parseInt(selectedId));
        // Update the selected book state
        setSelectedBook(book);
    };

    // Use effect to scroll the chat container to the bottom when the conversation history changes
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    

    return (
        <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            {/* Render the chatbot header */}
            <div style={{ backgroundColor: '#003366', borderRadius: '5px 5px 0 0' }}>
                <h2 style={{ color: 'white', margin: 0, textAlign: 'center' }}>Library Chatbot</h2>
            </div>
            {/* Render the chatbot image */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img 
            src={`${process.env.PUBLIC_URL}JARVIS the Librarian.jpg`} 
            alt="JARVIS the robot librarian searching on a futuristic terminal for the best book recommendations" 
            width="50%" 
            height="auto"
        />
    </div>
            {/* Render the book selection dropdown */}
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

            {/* Render the chat container */}
            <div
                className="chat-container"
                style={{
                    maxHeight: '40vh',  // Increase maxHeight as needed
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

                {/* Render the conversation history */}
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
            {/* Render the user input form field */}
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
