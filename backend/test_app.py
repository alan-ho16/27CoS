import pytest
from app import app, db, User, bcrypt

# --- SETUP FIXTURE ---
@pytest.fixture
def client():
    # Configure the app for testing
    app.config['TESTING'] = True
    # Use a temporary in-memory database just for tests
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

# --- TEST 1: Testing a Class/Model ---
def test_user_password_hashing(client):
    """Test that the User model correctly hashes passwords."""
    password = "supersecretpassword"
    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user = User(username="hash_test_user", password_hash=hashed)
    db.session.add(user)
    db.session.commit()
    
    saved_user = User.query.filter_by(username="hash_test_user").first()
    
    assert saved_user is not None
    assert saved_user.username == "hash_test_user"
    assert saved_user.password_hash != password  # Ensure it is hashed
    assert bcrypt.check_password_hash(saved_user.password_hash, password) is True

# --- TEST 2: Testing a Function/Endpoint (Register) ---
def test_register_endpoint(client):
    """Test the registration route successfully creates a user."""
    response = client.post('/api/auth/register', json={
        "username": "new_player",
        "password": "password123"
    })
    
    assert response.status_code == 201
    assert response.get_json()["message"] == "User registered successfully"
    
    # Verify the user actually made it into the test database
    user = User.query.filter_by(username="new_player").first()
    assert user is not None

# --- TEST 3: Testing a Function/Endpoint (Login) ---
def test_login_endpoint(client):
    """Test the login route returns a JWT token for valid credentials."""
    # First, register a user to log in with
    client.post('/api/auth/register', json={
        "username": "login_player",
        "password": "password123"
    })
    
    # Now attempt to log in
    response = client.post('/api/auth/login', json={
        "username": "login_player",
        "password": "password123"
    })
    
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Login successful"
    assert "access_token" in data  # Ensure the JWT was generated
