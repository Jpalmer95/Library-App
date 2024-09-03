import pytest
from server import app, db
from sqlalchemy import text

# Define a fixture to set up the database before running tests
@pytest.fixture(scope='module')
def setup_database():
    """
    Create all tables in the database before running tests.
    Drop all tables after running tests.
    """
    # Create all tables in the database
    with app.app_context():
        db.create_all()
    # Yield control to the test functions
    yield
    # Drop all tables in the database after running tests
    with app.app_context():
        db.drop_all()

# Define a fixture to create a test client for the app
@pytest.fixture
def client(setup_database):
    """
    Create a test client for the app.
    """
    # Create a test client for the app
    with app.test_client() as client:
        # Yield the test client to the test functions
        yield client

# Test the GET /books endpoint
def test_get_books(client):
    """
    Test the GET /books endpoint.
    """
    # Create a test book in the database
    with app.app_context():
        test_book = {
            "title": "Sample Book",
            "author": "Sample Author",
            "year_published": 2023,
            "genre": "Sample Genre"
        }
        # Insert the test book into the database
        db.session.execute(
            text("INSERT INTO books (title, author, year_published, genre) VALUES (:title, :author, :year_published, :genre)"),
            test_book
        )
        # Commit the changes to the database
        db.session.commit()

        # Send a GET request to the /books endpoint
        response = client.get('/books')
        # Check if the response status code is 200
        assert response.status_code == 200
        # Get the response data as JSON
        response_json = response.json
        # Check if the response data is not empty
        assert len(response_json) > 0
        # Check if the response data contains the test book
        assert response_json[0]['title'] == test_book['title']
        assert response_json[0]['year_published'] == test_book['year_published']

# Test the POST /books endpoint
def test_post_book(client):
    """
    Test the POST /books endpoint.
    """
    # Create a new book to post to the endpoint
    new_book = {
        "title": "Test Book",
        "author": "Test Author",
        "year_published": 2024,
        "genre": "Test Genre"
    }
    # Send a POST request to the /books endpoint with the new book data
    response = client.post('/books', json=new_book)
    # Check if the response status code is 201
    assert response.status_code == 201
    # Get the response data as JSON
    response_json = response.json
    # Check if the response data contains the new book
    assert 'year_published' in response_json
    assert response_json['title'] == new_book['title']
    assert response_json['author'] == new_book['author']
    assert response_json['year_published'] == new_book['year_published']
    assert response_json['genre'] == new_book['genre']

# Test the PUT /books/<id> endpoint
def test_put_book(client):
    """
    Test the PUT /books/<id> endpoint.
    """
    # Create a new book to post to the endpoint
    new_book = {
        "title": "Test Book",
        "author": "Test Author",
        "year_published": 2024,
        "genre": "Test Genre"
    }
    # Send a POST request to the /books endpoint with the new book data
    post_response = client.post('/books', json=new_book)
    # Get the ID of the new book
    book_id = post_response.json['id']

    # Create an updated book to put to the endpoint
    updated_book = {
        "title": "Updated Book",
        "author": "Updated Author",
        "year_published": 2025,
        "genre": "Updated Genre"
    }
    # Send a PUT request to the /books/<id> endpoint with the updated book data
    response = client.put(f'/books/{book_id}', json=updated_book)
    # Check if the response status code is 200
    assert response.status_code == 200
    # Get the response data as JSON
    response_json = response.json
    # Check if the response data contains the updated book
    assert 'year_published' in response_json
    assert response_json['title'] == updated_book['title']
    assert response_json['author'] == updated_book['author']
    assert response_json['year_published'] == updated_book['year_published']
    assert response_json['genre'] == updated_book['genre']

# Test the DELETE /books/<id> endpoint
def test_delete_book(client):
    """
    Test the DELETE /books/<id> endpoint.
    """
    # Create a new book to post to the endpoint
    new_book = {
        "title": "Test Book",
        "author": "Test Author",
        "year_published": 2024,
        "genre": "Test Genre"
    }
     # Send a POST request to the /books endpoint with the new book data
    post_response = client.post('/books', json=new_book)
    # Get the ID of the new book
    book_id = post_response.json['id']

    # Send a DELETE request to the /books/<id> endpoint
    response = client.delete(f'/books/{book_id}')
    # Check if the response status code is 204
    assert response.status_code == 204

    # Verify that the book is deleted
    # Send a GET request to the /books endpoint
    get_response = client.get('/books')
    # Check if the response status code is 200
    assert get_response.status_code == 200
    # Get the response data as JSON
    books = get_response.json
    # Check if the deleted book is not in the response data
    assert not any(book['id'] == book_id for book in books)