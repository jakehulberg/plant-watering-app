"""Weather-related routes."""
from flask import Blueprint, jsonify
from services.weather_service import get_weather

weather_bp = Blueprint('weather', __name__)


@weather_bp.route('/weather', methods=['GET'])
def fetch_weather():
    """API route to fetch current weather data."""
    try:
        weather = get_weather()
        if weather:
            return jsonify(weather)
        return jsonify({'error': 'Failed to fetch weather data'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
