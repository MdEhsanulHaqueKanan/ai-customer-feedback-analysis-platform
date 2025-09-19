from flask import Flask
from config import DevelopmentConfig
from flask_cors import CORS # Step 1: Import CORS

def create_app(config_class=DevelopmentConfig):
    """Creates and infigures an instance of the Flask application."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app) # Step 2: Initialize CORS with the app

    # We will register our API routes here
    with app.app_context():
        from . import routes

    return app