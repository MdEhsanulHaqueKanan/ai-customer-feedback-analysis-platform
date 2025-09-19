import os

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_secret_key_for_development')
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    """Development-specific configuration."""
    DEBUG = True