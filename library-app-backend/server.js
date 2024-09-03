// Load environment variables from the .env file
require('dotenv').config();

// Import necessary libraries and modules
const express = require('express');
const { Sequelize, DataTypes, UniqueConstraintError } = require('sequelize');
const cors = require('cors');
const axios = require('axios');

// Initialize the app and enable CORS
const app = express();
app.use(cors());
app.use(express.json());

// Database configuration with Sequelize
const sequelize = new Sequelize({
    // Use SQLite as the database dialect
    dialect: 'sqlite',
    // Store the database in a file called books.db
    storage: './books.db',
    // Disable logging to reduce noise in the console
    logging: false
});

// Define the Book model
const Book = sequelize.define('Book', {
    // Define the columns of the Book table
    id: {
        // Unique identifier for each book
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        // Title of the book
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        // Author of the book
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        // Year the book was published
        type: DataTypes.INTEGER
    },
    genre: {
        // Genre of the book
        type: DataTypes.STRING
    }
}, {
    // Define a unique constraint on the title and author columns
    uniqueKeys: {
        unique_book: {
            fields: ['title', 'author']
        }
    }
});

// Function to add sample books if the database is empty
const addSampleBooks = async () => {
    // Define a list of sample books
    const sampleBooks = [
        {"title": "The Hitchhiker's Guide to the Galaxy", "author": "Douglas Adams", "year": 1979, "genre": "Sci-Fi"},
        {"title": "To Kill a Mockingbird", "author": "Harper Lee", "year": 1960, "genre": "Fiction"},
        {"title": "1984", "author": "George Orwell", "year": 1949, "genre": "Dystopian"},
        {"title": "The Martian", "author": "Andy Weir", "year": 2011, "genre": "Sci-Fi"},
        {"title": "Hail Mary", "author": "Andy Weir", "year": 2021, "genre": "Sci-Fi"},
        {"title": "Hyperion", "author": "Dan Simmons", "year": 1989, "genre": "Fiction"},
        {"title": "Three Body Problem", "author": "Cixin Liu", "year": 2008, "genre": "Sci-Fi"},
        {"title": "Dune", "author": "Frank Herbert", "year": 1965, "genre": "Sci-Fi"},
        {"title": "Atlas Shrugged", "author": "Ayn Rand", "year": 1957, "genre": "Sci-Fi"},
        {"title": "Harry Potter and the Sorcerer’s Stone", "author": " J.K. Rowling", "year": 1997, "genre": "Fantasy"},
        {"title": "Accelerando", "author": "Charles Stross", "year": 2005, "genre": "Sci-Fi"},
        {"title": "The Giver", "author": "Lois Lowry", "year": 1993, "genre": "Fiction"},
        {"title": "The Hunger Games", "author": " Suzanne Collins", "year": 2008, "genre": "Fiction"},
        {"title": "The Hobbit", "author": "J.R.R. Tolkien", "year": 1937, "genre": "Fantasy"},
        {"title": "Green Eggs and Ham", "author": "Dr. Seuss", "year": 1960, "genre": "Childrens"}
    ];

    // Iterate over the sample books and add them to the database
    for (let bookData of sampleBooks) {
        // Use findOrCreate to create a new book if it doesn't already exist
        const [book, created] = await Book.findOrCreate({
            where: { title: bookData.title, author: bookData.author },
            defaults: bookData
        });
    }
};

// Hugging Face API settings
const HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-70B-Instruct";
const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN;

// Function to get a response from the Hugging Face API
const queryHuggingFaceAPI = async (payload) => {
    try {
        // Make a POST request to the Hugging Face API with the payload
        const response = await axios.post(HF_API_URL, payload, {
            headers: { Authorization: `Bearer ${HF_API_TOKEN}` }
        });
        // Return the response data
        return response.data;
    } catch (error) {
        // Log any errors that occur
        console.error(`Error from Hugging Face API: ${error.message}`, error.response.data);
        // Throw a new error with a more informative message
        throw new Error(`Error from Hugging Face API: ${error.response.status}, ${error.response.data}`);
    }
};

// Chatbot endpoint
app.post('/chat', async (req, res) => {
    // Get the message and book from the request body
    const { message, book } = req.body;
    // Initialize the book info string
    let bookInfo = '';

    // If a book is provided, add its details to the book info string
    if (book) {
        bookInfo = `Book details: Title: ${book.title}, Author: ${book.author}, Published: ${book.year}, Genre: ${book.genre}. `;
    }

    try {
        // Create a payload for the Hugging Face API
        const payload = {
            inputs: `${message} ${bookInfo}`
        };
        
        // Query the Hugging Face API with the payload
        const apiResponse = await queryHuggingFaceAPI(payload);
        
        // Extract the response text from the API response
        const responseText = apiResponse && Array.isArray(apiResponse) && apiResponse[0] && apiResponse[0].generated_text 
                             ? apiResponse[0].generated_text 
                             : "No response generated or API response structure changed";
        // Return the response text as JSON
        res.json({ response: responseText });
    } catch (error) {
        // Log any errors that occur
        console.error("Chatbot error:", error.message, error.response?.data);
        // Return a 500 error with a more informative message
        res.status(500).json({ error: error.message });
    }
});

// Book functionalities

// Add book to the database
app.post('/books', async (req, res) => {
    const { title, author, year, genre } = req.body;

    // Check if the title and author are provided
    if (!title || !author) {
        return res.status(400).json({ error: "Title and author are required" });
    }

    try {
        // Create a new book in the database
        const newBook = await Book.create({ title, author, year, genre });
        // Return the new book as JSON
        res.status(201).json(newBook);
    } catch (error) {
        // Check if the error is a unique constraint error
        if (error instanceof UniqueConstraintError) {
            // Return a 400 error if the book already exists
            res.status(400).json({ error: "Book already exists" });
        } else {
            // Return a 500 error with a more informative message
            res.status(500).json({ error: error.message });
        }
    }
});

// Get all books from the database
app.get('/books', async (req, res) => {
    const books = await Book.findAll();
    res.json(books);
});

// Get a single book by ID
app.get('/books/:id', async (req, res) => {
    // Find the book by ID in the database
    const book = await Book.findByPk(req.params.id);
    // Return a 404 error if the book is not found
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    // Return the book as JSON
    res.json(book);
});

// Edit a book by ID
app.put('/books/:id', async (req, res) => {
    // Find the book by ID in the database
    const book = await Book.findByPk(req.params.id);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    // Get the updated book details from the request body
    const { title, author, year, genre } = req.body;
    // Update the book details
    book.title = title || book.title;
    book.author = author || book.author;
    book.year = year || book.year;
    book.genre = genre || book.genre;

    await book.save();
    res.json(book);
});

// Delete a book by ID
app.delete('/books/:id', async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    await book.destroy();
    res.status(204).end();  // No content
});

// Sync database and add sample books if empty
const startServer = async () => {
    await sequelize.sync();
    await addSampleBooks();

    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
};

startServer();
