"""Weather service for fetching weather data from Open-Meteo."""
import requests
from config import Config

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


def c_to_f(c):
    """Convert Celsius to Fahrenheit."""
    return round((c * 9 / 5) + 32, 1)


def _location_search_params(location):
    """Build Open-Meteo geocoding params from a friendly location string."""
    parts = [part.strip() for part in location.split(",") if part.strip()]
    params = {"name": parts[0] if parts else location, "count": 1, "language": "en", "format": "json"}
    if parts and len(parts[-1]) == 2:
        params["country_code"] = parts[-1].upper()
    return params


def _get_coordinates():
    """Return configured coordinates or geocode the configured weather location."""
    if Config.WEATHER_LATITUDE is not None and Config.WEATHER_LONGITUDE is not None:
        return Config.WEATHER_LATITUDE, Config.WEATHER_LONGITUDE

    location = Config.WEATHER_LOCATION.strip()
    if not location:
        print("Warning: WEATHER_LOCATION is not set")
        return None

    try:
        response = requests.get(
            GEOCODING_URL,
            params=_location_search_params(location),
            timeout=10,
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        if not results:
            print(f"Open-Meteo geocoding returned no results for {location!r}")
            return None

        result = results[0]
        return result["latitude"], result["longitude"]
    except (requests.exceptions.RequestException, KeyError, ValueError, TypeError) as e:
        print(f"Open-Meteo geocoding error: {str(e)}")
        return None


def get_weather():
    """
    Fetch current weather and 24-hour rain forecast from Open-Meteo.

    Returns:
        dict: Weather data with temperature, humidity, and rain forecast
        None: If weather data cannot be fetched
    """
    coordinates = _get_coordinates()
    if coordinates is None:
        return None

    latitude, longitude = coordinates

    try:
        response = requests.get(
            FORECAST_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m,relative_humidity_2m,rain",
                "hourly": "rain",
                "forecast_days": 2,
                "timezone": "auto",
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        current = data["current"]
        temp_c = current["temperature_2m"]
        humidity = current["relative_humidity_2m"]
        rain_last_hour = current.get("rain", 0) or 0

        hourly_rain = data.get("hourly", {}).get("rain", [])
        rain_forecast = round(sum((value or 0) for value in hourly_rain[:24]), 2)

        return {
            "temperature_c": temp_c,
            "temperature_f": c_to_f(temp_c),
            "humidity": humidity,
            "rain_last_hour": rain_last_hour,
            "rain_forecast": rain_forecast,
        }
    except (requests.exceptions.RequestException, KeyError, ValueError, TypeError) as e:
        print(f"Open-Meteo weather error: {str(e)}")
        return None
