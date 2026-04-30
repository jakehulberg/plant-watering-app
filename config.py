"""Application configuration."""
import os
from dotenv import load_dotenv

load_dotenv()


def _optional_float(value):
    """Return a float for configured numeric values, or None when unset."""
    if value in (None, ""):
        return None
    return float(value)


class Config:
    """Base configuration class."""
    # Database configuration - use PostgreSQL if DATABASE_URL is set, otherwise SQLite
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///plants.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Open-Meteo weather configuration. Open-Meteo does not require an API key.
    WEATHER_LOCATION = os.getenv("WEATHER_LOCATION", "New Caney, Texas, US")
    WEATHER_LATITUDE = _optional_float(os.getenv("WEATHER_LATITUDE"))
    WEATHER_LONGITUDE = _optional_float(os.getenv("WEATHER_LONGITUDE"))

    # Server configuration. Override HOST=0.0.0.0 explicitly for LAN/Pi serving.
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 5001))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
