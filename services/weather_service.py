"""Weather service for fetching weather data from OpenWeatherMap API."""
import requests
import os
from config import Config


def c_to_f(c):
    """Convert Celsius to Fahrenheit."""
    return round((c * 9/5) + 32, 1)


def get_weather():
    """
    Fetch current weather and forecast from OpenWeatherMap API.
    
    Returns:
        dict: Weather data with temperature, humidity, and rain forecast
        None: If weather data cannot be fetched
    """
    try:
        api_key = Config.OPENWEATHER_API_KEY
        location = Config.WEATHER_LOCATION
        
        if not api_key:
            print("Warning: OPENWEATHER_API_KEY not set")
            return None

        current_url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={location}&appid={api_key}&units=metric"

        try:
            current_response = requests.get(current_url, timeout=10)
            forecast_response = requests.get(forecast_url, timeout=10)
        except requests.exceptions.RequestException as e:
            print(f"Weather API request error: {str(e)}")
            return None

        if current_response.status_code == 200 and forecast_response.status_code == 200:
            try:
                current_data = current_response.json()
                forecast_data = forecast_response.json()

                temp_c = current_data['main']['temp']
                humidity = current_data['main']['humidity']
                rain_last_hour = current_data.get('rain', {}).get('1h', 0)

                rain_forecast = 0
                for entry in forecast_data.get('list', [])[:8]:
                    rain_forecast += entry.get('rain', {}).get('3h', 0)

                return {
                    'temperature_c': temp_c,
                    'temperature_f': c_to_f(temp_c),
                    'humidity': humidity,
                    'rain_last_hour': rain_last_hour,
                    'rain_forecast': rain_forecast
                }
            except (KeyError, ValueError) as e:
                print(f"Weather data parsing error: {str(e)}")
                return None
        else:
            print(f"Weather API returned status codes: {current_response.status_code}, {forecast_response.status_code}")
            return None

    except Exception as e:
        print(f"Unexpected error in get_weather: {str(e)}")
        return None
