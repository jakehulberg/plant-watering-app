"""Recommendation-related routes."""
from flask import Blueprint, jsonify
from models import Plant
from services.weather_service import get_weather
from services.recommendation_service import generate_recommendations

recommendations_bp = Blueprint('recommendations', __name__)


@recommendations_bp.route('/recommendation', methods=['GET'])
def watering_recommendation():
    """API route to get watering recommendations for all plants."""
    try:
        # Pull plant data and current weather
        try:
            plants = Plant.query.all()
        except Exception as e:
            return jsonify({'error': f'Database error: {str(e)}'}), 500

        weather = get_weather()
        if not weather:
            return jsonify({'error': 'Weather data unavailable'}), 500

        recommendations = generate_recommendations(plants, weather)
        return jsonify(recommendations)

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
