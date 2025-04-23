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
    moisture_level = db.Column(db.Integer, nullable=True)

#API route for getting plant list
@app.route('/api/plants', methods=['GET'])
def api_get_plants():
    plants = Plant.query.all()
    return jsonify([
        {
            'id': plant.id,
            'name': plant.name,
            'last_watered': plant.last_watered,
            'moisture_level': plant.moisture_level
        } for plant in plants
    ])

#API route for posting to plant list
@app.route('/api/plants', methods=['POST'])
def api_add_plant():
    data = request.get_json()

    # Basic validation
    if not data or 'name' not in data or 'moisture_level' not in data:
        return jsonify({'error': 'Missing name or moisture level'}), 400

    new_plant = Plant(
        name=data['name'],
        last_watered=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        moisture_level=int(data['moisture_level'])
    )

    db.session.add(new_plant)
    db.session.commit()

    return jsonify({'message': 'Plant added!'}), 201

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

# Route for Database display
@app.route('/database')
def view_database():
    plants = Plant.query.all()
    return render_template('database.html', plants=plants)

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

def c_to_f(c):
    return round((c * 9/5) + 32, 1)

def get_weather():
    current_url = f"http://api.openweathermap.org/data/2.5/weather?q={LOCATION}&appid={API_KEY}&units=metric"
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={LOCATION}&appid={API_KEY}&units=metric"

    current_response = requests.get(current_url)
    forecast_response = requests.get(forecast_url)

    if current_response.status_code == 200 and forecast_response.status_code == 200:
        current_data = current_response.json()
        forecast_data = forecast_response.json()

        temp_c = current_data['main']['temp']
        humidity = current_data['main']['humidity']
        rain_last_hour = current_data.get('rain', {}).get('1h', 0)

        rain_forecast = 0
        for entry in forecast_data['list'][:8]:
            rain_forecast += entry.get('rain', {}).get('3h', 0)

        return {
            'temperature_c': temp_c,
            'temperature_f': c_to_f(temp_c),
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
    # Pull plant data and current weather
    plants = Plant.query.all()
    weather = get_weather()

    if not weather:
        return jsonify({'error': 'Weather data unavailable'}), 500

    # Extract weather metrics
    temp = weather['temperature_c']              # Max temp (next 24h)
    humidity = weather['humidity']             # Min humidity (next 24h)
    rain_forecast = weather['rain_forecast']   # Total mm of rain expected in next 24h

    print(f"Weather: Temp={temp}°C, Humidity={humidity}%, Rain={rain_forecast}mm")

    # All plant profiles with moisture thresholds
    plant_profiles = {
        "Cactus": {"water_threshold": 7, "temp_threshold": 38, "humidity_threshold": 15, "moisture_threshold": 2},
        "Succulent": {"water_threshold": 6, "temp_threshold": 35, "humidity_threshold": 20, "moisture_threshold": 3},
        "Grass": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 40, "moisture_threshold": 5},
        "Zinnia": {"water_threshold": 3, "temp_threshold": 28, "humidity_threshold": 35, "moisture_threshold": 4},
        "Purple Passionfruit": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 40, "moisture_threshold": 4},
        "Pink Jasmine": {"water_threshold": 3, "temp_threshold": 28, "humidity_threshold": 35, "moisture_threshold": 4},
        "Tomato": {"water_threshold": 2, "temp_threshold": 29, "humidity_threshold": 45, "moisture_threshold": 5},
        "Basil": {"water_threshold": 1, "temp_threshold": 28, "humidity_threshold": 50, "moisture_threshold": 6},
        "Corn": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 45, "moisture_threshold": 6},
        "Beans": {"water_threshold": 2, "temp_threshold": 28, "humidity_threshold": 40, "moisture_threshold": 5},
        "Peppers": {"water_threshold": 2, "temp_threshold": 30, "humidity_threshold": 45, "moisture_threshold": 5},
        "Lettuce": {"water_threshold": 1, "temp_threshold": 26, "humidity_threshold": 50, "moisture_threshold": 7},
        "General": {"water_threshold": 3, "temp_threshold": 30, "humidity_threshold": 35, "moisture_threshold": 4}
    }

    recommendations = []

    for plant in plants:
        # Step 1: Get basic info
        last_watered = datetime.strptime(plant.last_watered, "%Y-%m-%d %H:%M:%S")
        days_since_watered = (datetime.now() - last_watered).days
        moisture_level = plant.moisture_level  # This can be None if not recorded
        plant_type = "General"

        # Match the plant to its profile
        for key in plant_profiles:
            if key.lower() in plant.name.lower():
                plant_type = key
                break

        profile = plant_profiles[plant_type]
        water_threshold = profile["water_threshold"]
        temp_threshold = profile["temp_threshold"]
        humidity_threshold = profile["humidity_threshold"]
        moisture_threshold = profile["moisture_threshold"]

        print(f"\n🌿 {plant.name} ({plant_type})")
        print(f"  Days Since Watered: {days_since_watered}")
        print(f"  Moisture Level: {moisture_level}")
        print(f"  Profile Thresholds: W={water_threshold}, T={temp_threshold}, H={humidity_threshold}, M={moisture_threshold}")

        # 🔹 PRIORITY 1: Skip watering if rain is expected and soil isn't dangerously dry
        if rain_forecast > 5:
            if moisture_level is None or moisture_level >= (moisture_threshold - 1):
                recommendations.append({'plant': plant.name, 'action': 'No watering needed (rain expected)'})
                print("  ✅ Skipping — Rain expected soon and soil is not too dry.")
                continue

        # 🔹 PRIORITY 2: Use moisture sensor data if available
        if moisture_level is not None:
            if moisture_level < moisture_threshold:
                recommendations.append({'plant': plant.name, 'action': 'Water needed (dry soil)'})
                print("  💧 Watering — Soil is too dry.")
            else:
                recommendations.append({'plant': plant.name, 'action': 'No watering needed (moist soil)'})
                print("  ✅ Skipping — Soil is moist enough.")
            continue

        # 🔹 PRIORITY 3: Fallback on weather & last watering date
        if days_since_watered > water_threshold or temp > temp_threshold or humidity < humidity_threshold:
            recommendations.append({'plant': plant.name, 'action': 'Water needed (weather-based)'})
            print("  🌤️ Watering — Weather or time suggests it's needed.")
        else:
            recommendations.append({'plant': plant.name, 'action': 'No watering needed'})
            print("  ✅ Skipping — Conditions don’t justify watering.")

    return jsonify(recommendations)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

##This line added from MAC April 15, 2025 - plan to add a separate page to get some more info on the DB / waterings / weather"
