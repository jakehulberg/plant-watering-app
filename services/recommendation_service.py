"""Service for generating watering recommendations based on weather and plant data."""
from datetime import datetime
from models import Plant
from services.weather_service import get_weather


# Plant profiles with moisture thresholds
PLANT_PROFILES = {
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


def get_plant_type(plant_name):
    """Match plant name to its profile type."""
    for key in PLANT_PROFILES:
        if key.lower() in plant_name.lower():
            return key
    return "General"


def generate_recommendations(plants, weather):
    """
    Generate watering recommendations for all plants.
    
    Args:
        plants: List of Plant objects
        weather: Weather data dictionary
        
    Returns:
        list: List of recommendation dictionaries
    """
    if not weather:
        return []
    
    try:
        temp = weather['temperature_c']
        humidity = weather['humidity']
        rain_forecast = weather['rain_forecast']
    except KeyError as e:
        print(f"Missing weather data: {str(e)}")
        return []
    
    print(f"Weather: Temp={temp}°C, Humidity={humidity}%, Rain={rain_forecast}mm")
    
    recommendations = []
    
    for plant in plants:
        try:
            # Get basic info
            last_watered = datetime.strptime(plant.last_watered, "%Y-%m-%d %H:%M:%S")
            days_since_watered = (datetime.now() - last_watered).days
            moisture_level = plant.moisture_level
            plant_type = get_plant_type(plant.name)
            
            profile = PLANT_PROFILES[plant_type]
            water_threshold = profile["water_threshold"]
            temp_threshold = profile["temp_threshold"]
            humidity_threshold = profile["humidity_threshold"]
            moisture_threshold = profile["moisture_threshold"]
            
            print(f"\n🌿 {plant.name} ({plant_type})")
            print(f"  Days Since Watered: {days_since_watered}")
            print(f"  Moisture Level: {moisture_level}")
            print(f"  Profile Thresholds: W={water_threshold}, T={temp_threshold}, H={humidity_threshold}, M={moisture_threshold}")
            
            # PRIORITY 1: Skip watering if rain is expected and soil isn't dangerously dry
            if rain_forecast > 5:
                if moisture_level is None or moisture_level >= (moisture_threshold - 1):
                    recommendations.append({'plant': plant.name, 'action': 'No watering needed (rain expected)'})
                    print("  ✅ Skipping — Rain expected soon and soil is not too dry.")
                    continue
            
            # PRIORITY 2: Use moisture sensor data if available
            if moisture_level is not None:
                if moisture_level < moisture_threshold:
                    recommendations.append({'plant': plant.name, 'action': 'Water needed (dry soil)'})
                    print("  💧 Watering — Soil is too dry.")
                else:
                    recommendations.append({'plant': plant.name, 'action': 'No watering needed (moist soil)'})
                    print("  ✅ Skipping — Soil is moist enough.")
                continue
            
            # PRIORITY 3: Fallback on weather & last watering date
            if days_since_watered > water_threshold or temp > temp_threshold or humidity < humidity_threshold:
                recommendations.append({'plant': plant.name, 'action': 'Water needed (weather-based)'})
                print("  🌤️ Watering — Weather or time suggests it's needed.")
            else:
                recommendations.append({'plant': plant.name, 'action': 'No watering needed'})
                print("  ✅ Skipping — Conditions don't justify watering.")
        
        except ValueError as e:
            # Handle date parsing errors
            recommendations.append({
                'plant': plant.name,
                'action': f'Error: Invalid date format ({plant.last_watered})'
            })
            print(f"  ⚠️ Error processing {plant.name}: {str(e)}")
        except Exception as e:
            recommendations.append({
                'plant': plant.name,
                'action': f'Error: {str(e)}'
            })
            print(f"  ⚠️ Error processing {plant.name}: {str(e)}")
    
    return recommendations
