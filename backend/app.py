"""Backend API for Inferno handling authentication and loot box mechanics."""

import os
import random
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

load_dotenv()


class Base(DeclarativeBase):
    """Base class for SQLAlchemy declarative models."""

    pass


# Initialize Flask and database configuration
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')

db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Initialize password hashing and JWT authentication extensions
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


class User(db.Model):
    """Represents a registered player account."""

    __tablename__ = 'users'

    user_id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)


class GameSession(db.Model):
    """Tracks a player's active progression through levels and rooms."""

    __tablename__ = 'game_sessions'

    session_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.user_id'))
    current_level: Mapped[int] = mapped_column(Integer, default=1)
    current_room: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Item(db.Model):
    """Represents an in-game item available in loot boxes."""

    __tablename__ = 'items'

    item_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rarity: Mapped[str] = mapped_column(String(50), nullable=False)

    # Higher values increase the probability of the item dropping
    drop_weight: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(String(255))


@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Register a new user account.

    Expects JSON body with `username` and `password`.
    Returns a JSON confirmation message (201) or an error payload (400).
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    # Prevent duplicate key errors when a username is already registered
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'error': 'Username already taken'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Authenticate an existing user and issue a JWT access token.

    Expects JSON body with `username` and `password`.
    Returns a JSON payload containing `access_token` (200) or an error (401).
    """
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.user_id))
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
        }), 200

    return jsonify({'error': 'Invalid username or password'}), 401


# Require a valid JWT before allowing a user to roll a loot box
@app.route('/api/lootbox/open', methods=['POST'])
@jwt_required()
def open_lootbox():
    """
    Select a random item using weighted drop probabilities.

    Returns a JSON payload with the won item's details (200) or an error
    if no items are configured in the database (404).
    """
    # Fetch all available loot items from the database
    all_items = Item.query.all()

    if not all_items:
        return jsonify({'error': 'No items exist in the database'}), 404

    # Extract drop weights and perform a weighted random selection
    weights = [item.drop_weight for item in all_items]

    # random.choices returns a list, so extract the single selected element
    won_item = random.choices(all_items, weights=weights, k=1)[0]

    # TODO: Persist won_item to the authenticated user's inventory.

    # Return the selected item payload to the client
    return jsonify({
        'message': 'Loot box opened!',
        'item': {
            'id': won_item.item_id,
            'name': won_item.name,
            'rarity': won_item.rarity,
            'description': won_item.description,
        },
    }), 200


@app.route('/')
def home():
    """Return a basic health-check message confirming the API is running."""
    return {'message': 'Inferno Backend Running and Connected to DB!'}


if __name__ == '__main__':
    app.run(debug=True, port=5000)
    