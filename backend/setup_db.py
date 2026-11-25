from app import app, db

with app.app_context():
    app.config['SQLALCHEMY_ECHO'] = True
    print("Creating database tables...")
    db.create_all()
    print("Finished creating tables!")
