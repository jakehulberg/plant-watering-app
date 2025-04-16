from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///plants.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Plant model
class Plant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_watered = db.Column(db.String(100), nullable=False)

#Route serving index.html
@app.route('/')
def home():
    return render_template('index.html')
# Route to get all plants
@app.route('/plants', methods=['GET'])
def get_plants():
    plants = Plant.query.all()
    return jsonify([{'id': p.id, 'name': p.name, 'last_watered': p.last_watered} for p in plants])

# Route to add a new plant
@app.route('/plants', methods=['POST'])
def add_plant():
    data = request.get_json()
    if not data or "name" not in data:  # Prevent missing name issues
        return jsonify({"error": "Missing plant name"}), 400

    new_plant = Plant(name=data['name'], last_watered=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    db.session.add(new_plant)
    db.session.commit()
    return jsonify({'message': 'Plant added!'}), 201

# Route for second page
@app.route('/weather-page')
def weather_page():
    weather = get_weather()
    recommendations = watering_recommendation().json if watering_recommendation().status_code == 200 else []
    return render_template('weather.html', weather=weather, recommendations=recommendations)

# Route to update watering time
@app.route('/plants/<int:plant_id>/water', methods=['PUT'])
def water_plant(plant_id):
    plant = Plant.query.get(plant_id)
    if not plant:
        return jsonify({'message': 'Plant not found'}), 404

    plant.last_watered = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.session.commit()
    return jsonify({'message': 'Plant watered!'})

# Initialize database
@app.before_request
def create_tables():
    db.create_all()


# Getting the weather
import requests

API_KEY = "6b66cef6f3ae647fd568e90199d8a4e0"  # Replace with your API key
LOCATION = "New Caney,US"

def get_weather():
    # Fetch current weather
    current_url = f"http://api.openweathermap.org/data/2.5/weather?q={LOCATION}&appid={API_KEY}&units=metric"
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={LOCATION}&appid={API_KEY}&units=metric"

    current_response = requests.get(current_url)
    forecast_response = requests.get(forecast_url)

    if current_response.status_code == 200 and forecast_response.status_code == 200:
        current_data = current_response.json()
        forecast_data = forecast_response.json()

        temp = current_data['main']['temp']
        humidity = current_data['main']['humidity']
        rain_last_hour = current_data.get('rain', {}).get('1h', 0)  # Last hour rain

        # Extract rain forecast for the next 12 hours
        rain_forecast = 0
        for entry in forecast_data['list'][:4]:  # Each entry is 3 hours ahead, so 4 entries = 12 hours
            rain_forecast += entry.get('rain', {}).get('3h', 0)

        return {
            'temperature': temp,
            'humidity': humidity,
            'rain_last_hour': rain_last_hour,
            'rain_forecast': rain_forecast
        }
    return None

@app.route('/weather', methods=['GET'])
def fetch_weather():
    weather = get_weather()
    if weather:
        return jsonify(weather)
    return jsonify({'error': 'Failed to fetch weather'}), 500



# Generate Watering Recommendations based off of weather and last watering time
from datetime import datetime

@app.route('/recommendation', methods=['GET'])
def watering_recommendation():
    plants = Plant.query.all()
    weather = get_weather()

    if not weather:
        return jsonify({'error': 'Weather data unavailable'}), 500

    # Extract weather data
    temp = weather['temperature']
    humidity = weather['humidity']
    rain_forecast = weather['rain_forecast']

    # Debugging: Print weather data
    print(f"Weather Data - Temp: {temp}°C, Humidity: {humidity}%, Rain Forecast: {rain_forecast}mm")

    # Define plant-specific watering needs
    plant_profiles = {
        "Cactus": {"water_threshold": 7, "temp_threshold": 38, "humidity_threshold": 15},
        "Succulent": {"water_threshold": 6, "temp_threshold": 35, "humidity_threshold": 20},
        "Grass": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 40},
        "Zinnia": {"water_threshold": 3, "temp_threshold": 28, "humidity_threshold": 35},
        "Purple Passionfruit": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 40},
        "Pink Jasmine": {"water_threshold": 3, "temp_threshold": 28, "humidity_threshold": 35},
        "Tomato": {"water_threshold": 2, "temp_threshold": 29, "humidity_threshold": 45},
        "Basil": {"water_threshold": 1, "temp_threshold": 28, "humidity_threshold": 50},
        "General": {"water_threshold": 3, "temp_threshold": 30, "humidity_threshold": 35}  # Default settings
    }

    recommendations = []
    for plant in plants:
        last_watered = datetime.strptime(plant.last_watered, "%Y-%m-%d %H:%M:%S")
        days_since_watered = (datetime.now() - last_watered).days

        # Determine which profile to use
        plant_type = "General"  # Default
        for profile in plant_profiles.keys():
            if profile.lower() in plant.name.lower():
                plant_type = profile
                break  # Use the first matching plant type

        profile = plant_profiles[plant_type]
        water_threshold = profile["water_threshold"]
        temp_threshold = profile["temp_threshold"]
        humidity_threshold = profile["humidity_threshold"]

        # Debugging: Print plant data
        print(f"Plant: {plant.name}, Last Watered: {days_since_watered} days ago, Type: {plant_type}")
        print(f"  - Thresholds -> Water: {water_threshold} days, Temp: {temp_threshold}°C, Humidity: {humidity_threshold}%")

        # Rain check FIRST: Skip watering if significant rain is coming
        if rain_forecast > 5:
            recommendations.append({'plant': plant.name, 'action': 'No watering needed (rain expected)'})
            continue  # Skip further checks

        # Primary watering condition: Days since last watering
        if days_since_watered > water_threshold:
            recommendations.append({'plant': plant.name, 'action': 'Water needed'})
        elif temp > temp_threshold or humidity < humidity_threshold:
            # Only check temp/humidity if plant is ALMOST due
            if days_since_watered == water_threshold:
                recommendations.append({'plant': plant.name, 'action': 'Water needed (hot/dry conditions)'})
            else:
                recommendations.append({'plant': plant.name, 'action': 'No watering needed'})
        else:
            recommendations.append({'plant': plant.name, 'action': 'No watering needed'})

    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

##This line added from MAC April 15, 2025 - plan to add a separate page to get some more info on the DB / waterings / weather"
