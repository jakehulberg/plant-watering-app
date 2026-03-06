"""Service for generating watering recommendations based on weather and plant data."""
from datetime import datetime
from models import Plant
from services.weather_service import get_weather


# Plant profiles with watering thresholds
PLANT_PROFILES = {
    "Cactus": {"water_threshold": 7, "temp_threshold": 38, "humidity_threshold": 15},
    "Succulent": {"water_threshold": 6, "temp_threshold": 35, "humidity_threshold": 20},
    "Grass": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 40},
    "Zinnia": {"water_threshold": 3, "temp_threshold": 28, "humidity_threshold": 35},
    "Purple Passionfruit": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 40},
    "Pink Jasmine": {"water_threshold": 3, "temp_threshold": 28, "humidity_threshold": 35},
    "Tomato": {"water_threshold": 2, "temp_threshold": 29, "humidity_threshold": 45},
    "Basil": {"water_threshold": 1, "temp_threshold": 28, "humidity_threshold": 50},
    "Corn": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 45},
    "Beans": {"water_threshold": 2, "temp_threshold": 28, "humidity_threshold": 40},
    "Peppers": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 45},
    "Lettuce": {"water_threshold": 1, "temp_threshold": 26, "humidity_threshold": 50},
    "Rose Bush": {"water_threshold": 3, "temp_threshold": 30, "humidity_threshold": 40},
    "General": {"water_threshold": 3, "temp_threshold": 30, "humidity_threshold": 35}
}


def get_plant_type(plant_name):
    """Match plant name to its profile type."""
    for key in PLANT_PROFILES:
        if key.lower() in plant_name.lower():
            return key
    return "General"


def compute_time_factor(days_since_watered, water_threshold):
    time_ratio = days_since_watered / water_threshold
    return time_ratio ** 1.5


def compute_temp_bonus(temp, temp_threshold):
    if temp > temp_threshold:
        temp_excess = (temp - temp_threshold) / temp_threshold
        return min(temp_excess * 1.5, 0.3)
    return 0.0


def compute_humidity_bonus(humidity, humidity_threshold):
    if humidity < humidity_threshold:
        humidity_deficit = (humidity_threshold - humidity) / humidity_threshold
        return min(humidity_deficit, 0.2)
    return 0.0


def compute_rain_reduction(rain_forecast, time_factor, urgency_before_rain):
    rain_factor = min(rain_forecast / 10.0, 1.0)
    if time_factor >= 1.5:
        return rain_factor * 0.2
    elif time_factor >= 1.0:
        return rain_factor * 0.4
    else:
        return rain_factor * urgency_before_rain * 0.6


def urgency_to_action(urgency, rain_forecast):
    if urgency >= 1.2:
        return "Water urgently"
    elif urgency >= 0.8:
        return "Water soon"
    elif urgency >= 0.5:
        return "Water if convenient"
    elif rain_forecast > 0.3:
        return "Delayed by rain"
    else:
        return "No watering needed"


def generate_recommendations(plants, weather):
    """
    Generate watering recommendations for all plants using urgency scoring.

    Args:
        plants: List of Plant objects
        weather: Weather data dictionary, or None if unavailable

    Returns:
        list: List of recommendation dictionaries sorted by urgency descending
    """
    has_weather = weather is not None
    temp = 0
    humidity = 100
    rain_forecast = 0

    if has_weather:
        try:
            temp = weather['temperature_c']
            humidity = weather['humidity']
            rain_forecast = weather['rain_forecast']
        except KeyError as e:
            print(f"Missing weather data: {str(e)}")
            has_weather = False

    recommendations = []

    for plant in plants:
        try:
            last_watered = datetime.strptime(plant.last_watered, "%Y-%m-%d %H:%M:%S")
            days_since_watered = (datetime.now() - last_watered).total_seconds() / 86400
            plant_type = get_plant_type(plant.name)
            profile = PLANT_PROFILES[plant_type]

            water_threshold = profile["water_threshold"]
            temp_threshold = profile["temp_threshold"]
            humidity_threshold = profile["humidity_threshold"]

            time_factor = compute_time_factor(days_since_watered, water_threshold)
            temp_bonus = compute_temp_bonus(temp, temp_threshold) if has_weather else 0.0
            humidity_bonus = compute_humidity_bonus(humidity, humidity_threshold) if has_weather else 0.0

            urgency_before_rain = time_factor + temp_bonus + humidity_bonus
            rain_reduction = compute_rain_reduction(rain_forecast, time_factor, urgency_before_rain) if has_weather else 0.0

            urgency = max(urgency_before_rain - rain_reduction, 0.0)
            action = urgency_to_action(urgency, rain_forecast)

            rec = {
                'plant': plant.name,
                'action': action,
                'urgency': round(urgency, 2),
                'factors': {
                    'time': round(time_factor, 2),
                    'temp': round(temp_bonus, 2),
                    'humidity': round(humidity_bonus, 2),
                    'rain': round(-rain_reduction, 2),
                },
                'details': {
                    'days_since_watered': round(days_since_watered, 1),
                    'water_threshold': water_threshold,
                    'plant_type': plant_type,
                },
            }

            if not has_weather:
                rec['weather_available'] = False

            recommendations.append(rec)

        except ValueError as e:
            recommendations.append({
                'plant': plant.name,
                'action': f'Error: Invalid date format ({plant.last_watered})',
                'urgency': 0,
                'factors': {'time': 0, 'temp': 0, 'humidity': 0, 'rain': 0},
                'details': {},
            })
        except Exception as e:
            recommendations.append({
                'plant': plant.name,
                'action': f'Error: {str(e)}',
                'urgency': 0,
                'factors': {'time': 0, 'temp': 0, 'humidity': 0, 'rain': 0},
                'details': {},
            })

    recommendations.sort(key=lambda r: r['urgency'], reverse=True)
    return recommendations
