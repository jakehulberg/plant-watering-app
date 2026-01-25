"""Application configuration."""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration class."""
    # Database configuration - use PostgreSQL if DATABASE_URL is set, otherwise SQLite
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///plants.db'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Weather API configuration
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
    WEATHER_LOCATION = os.getenv("WEATHER_LOCATION", "New Caney,US")
    
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 5001))
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
