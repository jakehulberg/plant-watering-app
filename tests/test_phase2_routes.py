import unittest
from datetime import datetime, timedelta
from unittest.mock import patch

from app import create_app
from database import db
from models import Plant, WateringHistory


class Phase2RouteCoverageTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
            'WTF_CSRF_ENABLED': False,
        })
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_test_app_uses_isolated_in_memory_database(self):
        with self.app.app_context():
            self.assertEqual(str(db.engine.url), 'sqlite:///:memory:')

    def _create_plant(self, name='Basil', days_since_watered=2):
        last_watered = (datetime.now() - timedelta(days=days_since_watered)).strftime('%Y-%m-%d %H:%M:%S')
        plant = Plant(name=name, last_watered=last_watered)
        db.session.add(plant)
        db.session.commit()
        return plant

    def test_api_plant_crud_flow(self):
        create_response = self.client.post('/api/plants', json={'name': '  Tomato  '})
        self.assertEqual(create_response.status_code, 201)
        created = create_response.get_json()['plant']
        self.assertEqual(created['name'], 'Tomato')

        list_response = self.client.get('/api/plants')
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.get_json()), 1)

        update_response = self.client.patch(f"/api/plants/{created['id']}", json={'name': 'Cherry Tomato'})
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.get_json()['plant']['name'], 'Cherry Tomato')

        delete_response = self.client.delete(f"/api/plants/{created['id']}")
        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(delete_response.get_json()['message'], 'Plant deleted!')

        final_list_response = self.client.get('/api/plants')
        self.assertEqual(final_list_response.status_code, 200)
        self.assertEqual(final_list_response.get_json(), [])

    def test_water_plant_updates_timestamp_and_records_history(self):
        with self.app.app_context():
            plant = self._create_plant(name='Basil', days_since_watered=3)
            plant_id = plant.id
            original_last_watered = plant.last_watered

        response = self.client.put(f'/plants/{plant_id}/water')
        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body['message'], 'Plant watered!')
        self.assertEqual(body['plant']['id'], plant_id)
        self.assertNotEqual(body['plant']['last_watered'], original_last_watered)

        with self.app.app_context():
            refreshed = db.session.get(Plant, plant_id)
            history = WateringHistory.query.filter_by(plant_id=plant_id).all()
            self.assertEqual(refreshed.last_watered, body['plant']['last_watered'])
            self.assertEqual(len(history), 1)
            self.assertEqual(history[0].watered_at, refreshed.last_watered)

    def test_plant_history_returns_newest_entries_first(self):
        with self.app.app_context():
            plant = self._create_plant(name='Zinnia')
            plant_id = plant.id
            older = WateringHistory(plant_id=plant_id, watered_at='2026-04-28 08:00:00')
            newer = WateringHistory(plant_id=plant_id, watered_at='2026-04-29 08:00:00')
            db.session.add_all([older, newer])
            db.session.commit()

        response = self.client.get(f'/api/plants/{plant_id}/history')
        self.assertEqual(response.status_code, 200)
        history = response.get_json()
        self.assertEqual([entry['watered_at'] for entry in history], [
            '2026-04-29 08:00:00',
            '2026-04-28 08:00:00',
        ])

    @patch('routes.weather.get_weather')
    def test_weather_route_returns_normalized_weather_payload(self, mock_get_weather):
        mock_get_weather.return_value = {
            'temperature_c': 24,
            'temperature_f': 75.2,
            'humidity': 55,
            'rain_last_hour': 0,
            'rain_forecast': 1.5,
        }

        response = self.client.get('/weather')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), mock_get_weather.return_value)

    @patch('routes.weather.get_weather')
    def test_weather_route_reports_failure_when_service_returns_none(self, mock_get_weather):
        mock_get_weather.return_value = None

        response = self.client.get('/weather')
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.get_json()['error'], 'Failed to fetch weather data')

    @patch('routes.weather.get_weather')
    def test_weather_route_reports_unexpected_service_exception(self, mock_get_weather):
        mock_get_weather.side_effect = RuntimeError('network unavailable')

        response = self.client.get('/weather')
        self.assertEqual(response.status_code, 500)
        self.assertIn('Unexpected error: network unavailable', response.get_json()['error'])

    @patch('routes.recommendations.get_weather')
    def test_recommendation_route_returns_recommendations_for_existing_plants(self, mock_get_weather):
        mock_get_weather.return_value = {
            'temperature_c': 35,
            'humidity': 30,
            'rain_forecast': 0,
        }
        with self.app.app_context():
            self._create_plant(name='Basil', days_since_watered=2)

        response = self.client.get('/recommendation')
        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertTrue(body['weather_available'])
        self.assertEqual(len(body['recommendations']), 1)
        recommendation = body['recommendations'][0]
        self.assertEqual(recommendation['plant'], 'Basil')
        self.assertIn('action', recommendation)
        self.assertIn('urgency', recommendation)
        self.assertEqual(recommendation['details']['plant_type'], 'Basil')

    @patch('routes.recommendations.get_weather')
    def test_recommendation_route_still_returns_recommendations_without_weather(self, mock_get_weather):
        mock_get_weather.return_value = None
        with self.app.app_context():
            self._create_plant(name='Cactus', days_since_watered=8)

        response = self.client.get('/recommendation')
        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertFalse(body['weather_available'])
        self.assertEqual(len(body['recommendations']), 1)
        self.assertFalse(body['recommendations'][0]['weather_available'])


if __name__ == '__main__':
    unittest.main()
