import os
import re
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Create a new Flask app
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# Load environment variables from .env file
load_dotenv()

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///books.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Create a new SQLAlchemy instance
db = SQLAlchemy(app)

# Define the Book model
class Book(db.Model):
    """
    Represents a book in the database.
    """
    # Unique identifier for each book
    id = db.Column(db.Integer, primary_key=True)
    # Title of the book
    title = db.Column(db.String(100), nullable=False)
    # Author of the book
    author = db.Column(db.String(100), nullable=False)
    # Year the book was published
    year = db.Column(db.Integer)
    # Genre of the book
    genre = db.Column(db.String(50))

    # Define a unique constraint on the title and author columns
    __table_args__ = (
        db.UniqueConstraint('title', 'author', name='unique_book'),
    )

    # Method to convert the book to a dictionary
    def to_dict(self):
        """
        Returns a dictionary representation of the book.
        """
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'year': self.year,
            'genre': self.genre
        }

# Function to add sample books if the database is empty
def add_sample_books():
    # Define a list of sample books
    sample_books = [
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
    ]
    
    # Iterate over the sample books and add them to the database
    for book_data in sample_books:
        # Check if the book already exists in the database
        existing_book = Book.query.filter_by(title=book_data['title'], author=book_data['author']).first()
        if not existing_book:
            # Create a new book instance
            new_book = Book(
                title=book_data['title'],
                author=book_data['author'],
                year=book_data.get('year'),
                genre=book_data.get('genre')
            )
            # Add the book to the database session
            db.session.add(new_book)
    
    # Commit the changes to the database
    db.session.commit()

# Hugging Face API settings
HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-70B-Instruct"
HF_API_TOKEN = os.getenv('HUGGING_FACE_API_TOKEN')


# Function to get a response from the Hugging Face API
def query_huggingface_api(payload):
    # Define the API headers
    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}"
    }
    # Make a POST request to the API
    response = requests.post(HF_API_URL, headers=headers, json=payload)
    # Check if the response was successful
    if response.status_code == 200:
        # Return the response data
        return response.json()
    else:
        # Raise an exception if the response was not successful
        raise Exception(f"Error from Hugging Face API: {response.status_code}, {response.text}")


# Chatbot endpoint
@app.route('/chat', methods=['POST'])
def chat():
    """
    Handles chatbot requests.
    """
    # Get the request data
    data = request.get_json()
    # Get the user message and selected book from the request data
    user_message = data.get('message', '')
    selected_book = data.get('book', None)

    # If book details are provided, append them; otherwise, just use user message
    book_info = ""
    if selected_book:
        book_info = f"Book details: Title: {selected_book['title']}, Author: {selected_book['author']}, Published: {selected_book['year']}, Genre: {selected_book['genre']}. "

    try:
        # Prepare the payload with either book details and user query or just the query
        payload = {
        "inputs": f"{user_message}{book_info}",
        "parameters": {
            "max_new_tokens": 200  # Adjust the length as needed
        }
}

        # Query the Hugging Face API
        api_response = query_huggingface_api(payload)
        response_text = api_response[0]['generated_text']  # Adjust this according to the actual API response structure

        # Return the response
        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Book Functionalities

# Add book to the database (POST request)
@app.route('/books', methods=['POST'])
def add_book():
    data = request.json
    if not data or 'title' not in data or 'author' not in data:
        return jsonify({"error": "Title and author are required"}), 400

    new_book = Book(title=data['title'], author=data['author'], year=data.get('year'), genre=data.get('genre'))
    db.session.add(new_book)
    db.session.commit()
    return jsonify(new_book.to_dict()), 201

# Get all books (GET request)
@app.route('/books', methods=['GET'])
def get_books():
    all_books = Book.query.all()
    return jsonify([book.to_dict() for book in all_books])

# Get a single book by ID (GET request)
@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get(book_id)
    if book is None:
        return jsonify({"error": "Book not found"}), 404
    return jsonify(book.to_dict())

# Edit a book by ID (PUT request)
@app.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    data = request.get_json()
    if 'title' in data:
        book.title = data['title']
    if 'author' in data:
        book.author = data['author']
    if 'year' in data:
        book.year = data['year']
    if 'genre' in data:
        book.genre = data['genre']

    db.session.commit()
    return jsonify(book.to_dict()), 200

# Delete a book by ID (DELETE request)
@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    db.session.delete(book)
    db.session.commit()
    return '', 204  # No content, successful delete

# Run the app in debug mode
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables are created
        add_sample_books()  # Add sample books if the database is empty
    app.run(debug=True)
