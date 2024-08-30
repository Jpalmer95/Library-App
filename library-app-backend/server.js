// server.js
require('dotenv').config();
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
    dialect: 'sqlite',
    storage: './books.db',
    logging: false
});

// Define the Book model
const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER
    },
    genre: {
        type: DataTypes.STRING
    }
}, {
    uniqueKeys: {
        unique_book: {
            fields: ['title', 'author']
        }
    }
});

// Function to add sample books if the database is empty
const addSampleBooks = async () => {
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

    for (let bookData of sampleBooks) {
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
        const response = await axios.post(HF_API_URL, payload, {
            headers: { Authorization: `Bearer ${HF_API_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error from Hugging Face API: ${error.message}`, error.response.data);
        throw new Error(`Error from Hugging Face API: ${error.response.status}, ${error.response.data}`);
    }
};

// Chatbot endpoint
app.post('/chat', async (req, res) => {
    const { message, book } = req.body;
    let bookInfo = '';

    if (book) {
        bookInfo = `Book details: Title: ${book.title}, Author: ${book.author}, Published: ${book.year}, Genre: ${book.genre}. `;
    }

    try {
        const payload = {
            inputs: `${message} ${bookInfo}`
        };
        
        const apiResponse = await queryHuggingFaceAPI(payload);
        
        // More robust check for response structure
        const responseText = apiResponse && Array.isArray(apiResponse) && apiResponse[0] && apiResponse[0].generated_text 
                             ? apiResponse[0].generated_text 
                             : "No response generated or API response structure changed";
        res.json({ response: responseText });
    } catch (error) {
        console.error("Chatbot error:", error.message, error.response?.data);
        res.status(500).json({ error: error.message });
    }
});

// Book functionalities
// Add book to the database
app.post('/books', async (req, res) => {
    const { title, author, year, genre } = req.body;

    if (!title || !author) {
        return res.status(400).json({ error: "Title and author are required" });
    }

    try {
        const newBook = await Book.create({ title, author, year, genre });
        res.status(201).json(newBook);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            res.status(400).json({ error: "Book already exists" });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Get all books
app.get('/books', async (req, res) => {
    const books = await Book.findAll();
    res.json(books);
});

// Get a single book by ID
app.get('/books/:id', async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
});

// Edit a book by ID
app.put('/books/:id', async (req, res) => {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    const { title, author, year, genre } = req.body;

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
