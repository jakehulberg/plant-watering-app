import unittest
from unittest.mock import Mock, patch

from app import create_app
from database import db
from models import Plant
from services import weather_service


class PlantValidationTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config.update(
            TESTING=True,
            SQLALCHEMY_DATABASE_URI='sqlite:///:memory:',
            WTF_CSRF_ENABLED=False,
        )
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_api_rejects_blank_plant_names(self):
        response = self.client.post('/api/plants', json={'name': '   '})

        self.assertEqual(response.status_code, 400)
        self.assertIn('Plant name is required', response.get_json()['error'])

        with self.app.app_context():
            self.assertEqual(Plant.query.count(), 0)

    def test_api_rejects_overlong_plant_names(self):
        response = self.client.post('/api/plants', json={'name': 'x' * 101})

        self.assertEqual(response.status_code, 400)
        self.assertIn('100 characters or fewer', response.get_json()['error'])

        with self.app.app_context():
            self.assertEqual(Plant.query.count(), 0)


class OpenMeteoWeatherServiceTestCase(unittest.TestCase):
    @patch('services.weather_service.requests.get')
    def test_get_weather_uses_open_meteo_without_api_key(self, mock_get):
        geocode_response = Mock()
        geocode_response.status_code = 200
        geocode_response.raise_for_status.return_value = None
        geocode_response.json.return_value = {
            'results': [
                {'latitude': 30.155, 'longitude': -95.215, 'name': 'New Caney'}
            ]
        }

        forecast_response = Mock()
        forecast_response.status_code = 200
        forecast_response.raise_for_status.return_value = None
        forecast_response.json.return_value = {
            'current': {
                'temperature_2m': 25,
                'relative_humidity_2m': 60,
                'rain': 1.2,
            },
            'hourly': {
                'time': [f'2026-04-30T{hour:02d}:00' for hour in range(24)],
                'rain': [0.5] * 24,
            },
        }

        mock_get.side_effect = [geocode_response, forecast_response]

        weather = weather_service.get_weather()

        self.assertEqual(weather['temperature_c'], 25)
        self.assertEqual(weather['temperature_f'], 77.0)
        self.assertEqual(weather['humidity'], 60)
        self.assertEqual(weather['rain_last_hour'], 1.2)
        self.assertEqual(weather['rain_forecast'], 12.0)

        called_urls = [call.args[0] for call in mock_get.call_args_list]
        self.assertTrue(all('open-meteo.com' in url for url in called_urls))
        self.assertTrue(all('appid' not in call.kwargs.get('params', {}) for call in mock_get.call_args_list))


if __name__ == '__main__':
    unittest.main()
