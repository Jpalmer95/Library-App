import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import Chatbot from './components/Chatbot';
import './global.css'; // Import global styles

function App() {
  const [selectedBook, setSelectedBook] = useState(null); // State for selected book
  const [showChatbot, setShowChatbot] = useState(true); // State to toggle initial chatbot visibility

  return (
    <Router>
      <div>
        {/* Skip to Main Content and Chatbot Buttons */}
        <a href="#main-content" className="skip-link">Skip to Main Content</a>
        <a href="#chatbot" className="skip-link">Skip to Chatbot</a>

        <header>
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/add">Add Book</Link></li>
            </ul>
          </nav>
        </header>

        <main id="main-content">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/add" element={<AddBook />} />
              <Route path="/edit/:id" element={<EditBook />} />
            </Routes>
          </div>
          
          {/* Toggle Chatbot Button */}
          <button
            style={{ position: 'fixed', bottom: '10px', right: '22px', zIndex: 101 }}
            onClick={() => setShowChatbot(prevState => !prevState)}
          >
            {showChatbot ? 'Hide Chatbot' : 'Show Chatbot'}
          </button>

          {/* Conditionally render the Chatbot component based on Show/Hide Chatbot button */}
          {showChatbot && (
            <div id="chatbot" className="chatbot-window" style={{ position: 'fixed', bottom: '48px', right: '20px', zIndex: 100 }}>
              <Chatbot selectedBook={selectedBook} />
            </div>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
