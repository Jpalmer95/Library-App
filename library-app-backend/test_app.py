import pytest
from server import app, db
from sqlalchemy import text

@pytest.fixture(scope='module')
def setup_database():
    with app.app_context():
        db.create_all()
    yield
    with app.app_context():
        db.drop_all()

@pytest.fixture
def client(setup_database):
    with app.test_client() as client:
        yield client

def test_get_books(client):
    """Test the GET /books endpoint."""
    with app.app_context():
        test_book = {
            "title": "Sample Book",
            "author": "Sample Author",
            "year_published": 2023,
            "genre": "Sample Genre"
        }
        db.session.execute(
            text("INSERT INTO books (title, author, year_published, genre) VALUES (:title, :author, :year_published, :genre)"),
            test_book
        )
        db.session.commit()

        response = client.get('/books')
        assert response.status_code == 200
        response_json = response.json
        assert len(response_json) > 0
        assert response_json[0]['title'] == test_book['title']
        assert response_json[0]['year_published'] == test_book['year_published']

def test_post_book(client):
    """Test the POST /books endpoint."""
    new_book = {
        "title": "Test Book",
        "author": "Test Author",
        "year_published": 2024,
        "genre": "Test Genre"
    }
    response = client.post('/books', json=new_book)
    assert response.status_code == 201
    response_json = response.json
    assert 'year_published' in response_json
    assert response_json['title'] == new_book['title']
    assert response_json['author'] == new_book['author']
    assert response_json['year_published'] == new_book['year_published']
    assert response_json['genre'] == new_book['genre']

def test_put_book(client):
    """Test the PUT /books/<id> endpoint."""
    new_book = {
        "title": "Test Book",
        "author": "Test Author",
        "year_published": 2024,
        "genre": "Test Genre"
    }
    post_response = client.post('/books', json=new_book)
    book_id = post_response.json['id']

    updated_book = {
        "title": "Updated Book",
        "author": "Updated Author",
        "year_published": 2025,
        "genre": "Updated Genre"
    }

    response = client.put(f'/books/{book_id}', json=updated_book)
    assert response.status_code == 200
    response_json = response.json
    assert 'year_published' in response_json
    assert response_json['title'] == updated_book['title']
    assert response_json['author'] == updated_book['author']
    assert response_json['year_published'] == updated_book['year_published']
    assert response_json['genre'] == updated_book['genre']

def test_delete_book(client):
    """Test the DELETE /books/<id> endpoint."""
    new_book = {
        "title": "Test Book",
        "author": "Test Author",
        "year_published": 2024,
        "genre": "Test Genre"
    }
    post_response = client.post('/books', json=new_book)
    book_id = post_response.json['id']
    
    response = client.delete(f'/books/{book_id}')
    assert response.status_code == 204
    
    # Verify the book is deleted
    get_response = client.get('/books')
    assert get_response.status_code == 200
    books = get_response.json
    assert not any(book['id'] == book_id for book in books)
