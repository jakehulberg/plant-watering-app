"""Page routes for rendering HTML templates."""
from flask import Blueprint, render_template
from models import Plant
from services.weather_service import get_weather
from services.recommendation_service import generate_recommendations

pages_bp = Blueprint('pages', __name__)


@pages_bp.route('/')
def home():
    """Route serving index.html."""
    return render_template('index.html')


@pages_bp.route('/weather-page')
def weather_page():
    """Route for weather page."""
    try:
        weather = get_weather()
        try:
            plants = Plant.query.all()
            recommendations = generate_recommendations(plants, weather) if weather else []
        except Exception as e:
            print(f"Error getting recommendations: {str(e)}")
            recommendations = []
        return render_template('weather.html', weather=weather, recommendations=recommendations)
    except Exception as e:
        return f"Error loading weather page: {str(e)}", 500


@pages_bp.route('/database')
def view_database():
    """Route for database display page."""
    try:
        plants = Plant.query.all()
        return render_template('database.html', plants=plants)
    except Exception as e:
        return f"Error loading database: {str(e)}", 500
