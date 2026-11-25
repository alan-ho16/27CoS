# Inferno Dungeon Crawler (Full-Stack Web Game)

A full-stack 2D dungeon crawler featuring secure user authentication, persistent player progression, and a weighted-probability loot box system.

## Tech Stack

- **Backend:** Python, Flask, SQLAlchemy, PostgreSQL
- **Authentication & Security:** Flask-JWT-Extended, Flask-Bcrypt
- **Testing:** Pytest
- **Frontend:** React, Axios _(In Progress)_

---

## Project Setup & Installation

### 1. Database Setup

1. Ensure PostgreSQL (v15+) is installed and running locally.
2. Create the database (`inferno_db`) and admin user (`inferno_admin`), then grant schema privileges:
   ```sql
   GRANT ALL ON SCHEMA public TO inferno_admin;
   ```

### 2. Backend Setup

1. Navigate to the `backend` directory and activate your virtual environment:
   ```bash
   source venv/bin/activate
   ```
2. Install required dependencies:
   ```bash
   pip install flask flask-sqlalchemy psycopg-binary flask-bcrypt flask-jwt-extended python-dotenv pytest pytest-env
   ```
3. Configure your `.env` file with your `DATABASE_URL` and `JWT_SECRET_KEY`.
4. Initialize the database tables and seed the test loot items:
   ```bash
   python setup_db.py
   python seed_items.py
   ```
5. Start the Flask development server:
   ```bash
   python app.py
   ```

### 3. Running Unit Tests

Execute the isolated Pytest suite (runs against an in-memory SQLite database):

```bash
pytest test_app.py -v
```

---

## External Libraries & Dependencies

The following third-party libraries and tools were used to build and test this application:

### Backend & Database

- **Flask** (`flask`): Micro web framework used to structure the REST API routes (`/api/auth/register`, `/api/auth/login`, `/api/lootbox/open`).
- **Flask-SQLAlchemy / SQLAlchemy** (`flask-sqlalchemy`): Object-Relational Mapper (ORM) used to define database models (`User`, `Item`) and execute queries in Python.
- **Psycopg 3** (`psycopg-binary`): PostgreSQL database adapter enabling SQLAlchemy to communicate with the local PostgreSQL server.
- **Flask-Bcrypt** (`flask-bcrypt`): Password-hashing utility used to salt and hash user passwords before database storage and verify credentials upon login.
- **Flask-JWT-Extended** (`flask-jwt-extended`): Authentication extension used to generate JSON Web Tokens (JWT) on login and protect game routes via `@jwt_required()`.
- **Python-Dotenv** (`python-dotenv`): Utility for loading sensitive environment variables (database credentials and JWT secret keys) from a `.env` file.

### Testing

- **Pytest** (`pytest`): Testing framework used to write and execute automated unit tests for user password hashing, registration, and login flows.
- **Pytest-Env** (`pytest-env`): Pytest plugin used to configure environment variables within the isolated test runner.

### Frontend _(Planned / Upcoming)_

- **React**: Component-based UI library for building the login screen and 2D dungeon interface.
- **Axios**: Promise-based HTTP client for sending authenticated requests (with `Bearer` tokens) to the Flask API.

---

## Tutorials, Documentation & References

- **Flask & SQLAlchemy Documentation:** Referenced for application factory patterns, declarative model mapping (`Mapped` / `mapped_column`), and session management ([Flask-SQLAlchemy Docs](https://flask-sqlalchemy.palletsprojects.com/)).
- **Flask-JWT-Extended Documentation:** Referenced for configuring access tokens and protecting API endpoints ([Flask-JWT-Extended Docs](https://flask-jwt-extended.readthedocs.io/)).
- **PostgreSQL 15 Schema Permissions:** Referenced PostgreSQL release notes regarding explicit `GRANT ALL ON SCHEMA public` requirements for non-superuser roles ([PostgreSQL Docs](https://www.postgresql.org/docs/)).
- **Python `random.choices()` Documentation:** Used Python's standard library weighted sampling algorithm to implement rarity-based loot box drop rates ([Python Random Docs](https://docs.python.org/3/library/random.html#random.choices)).
- **Pytest & Flask Testing Guide:** Referenced official Flask testing patterns for configuring an isolated `app.test_client()` with an in-memory SQLite database ([Flask Testing Docs](https://flask.palletsprojects.com/en/latest/testing/)).
