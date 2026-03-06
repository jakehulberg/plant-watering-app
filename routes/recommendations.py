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
        try:
            plants = Plant.query.all()
        except Exception as e:
            return jsonify({'error': f'Database error: {str(e)}'}), 500

        weather = get_weather()
        recommendations = generate_recommendations(plants, weather)

        response = {
            'recommendations': recommendations,
            'weather_available': weather is not None,
        }
        return jsonify(response)

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
