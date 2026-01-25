"""Plant-related API routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
from models import Plant
from database import db

plants_bp = Blueprint('plants', __name__)


@plants_bp.route('/api/plants', methods=['GET', 'POST'])
def api_plants():
    """API route for getting and posting plants."""
    try:
        if request.method == 'POST':
            data = request.get_json()

            if not data:
                return jsonify({'error': 'No data provided'}), 400

            if 'name' not in data:
                return jsonify({'error': 'Missing plant name'}), 400

            # moisture_level is optional for backward compatibility
            moisture_level = None
            if 'moisture_level' in data:
                try:
                    moisture_level = int(data['moisture_level'])
                    if moisture_level < 1 or moisture_level > 10:
                        return jsonify({'error': 'Moisture level must be between 1 and 10'}), 400
                except (ValueError, TypeError):
                    return jsonify({'error': 'Invalid moisture level format'}), 400

            try:
                new_plant = Plant(
                    name=data['name'].strip(),
                    last_watered=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    moisture_level=moisture_level
                )

                db.session.add(new_plant)
                db.session.commit()

                return jsonify({
                    'message': 'Plant added!',
                    'plant': new_plant.to_dict()
                }), 201

            except Exception as e:
                db.session.rollback()
                return jsonify({'error': f'Database error: {str(e)}'}), 500

        elif request.method == 'GET':
            try:
                plants = Plant.query.all()
                plant_list = [p.to_dict() for p in plants]
                return jsonify(plant_list)

            except Exception as e:
                return jsonify({'error': f'Database error: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@plants_bp.route('/plants', methods=['GET'])
def get_plants():
    """Route to get all plants (backward compatibility for HTML template)."""
    try:
        plants = Plant.query.all()
        return jsonify([p.to_simple_dict() for p in plants])
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500


@plants_bp.route('/plants', methods=['POST'])
def add_plant():
    """Route to add a new plant (backward compatibility for HTML template)."""
    try:
        data = request.get_json()
        if not data or "name" not in data:
            return jsonify({"error": "Missing plant name"}), 400

        try:
            new_plant = Plant(
                name=data['name'].strip(),
                last_watered=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                moisture_level=None  # HTML template doesn't provide this
            )
            db.session.add(new_plant)
            db.session.commit()
            return jsonify({'message': 'Plant added!'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@plants_bp.route('/plants/<int:plant_id>/water', methods=['PUT'])
def water_plant(plant_id):
    """Route to update watering time."""
    try:
        plant = Plant.query.get(plant_id)
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        try:
            plant.last_watered = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            db.session.commit()
            return jsonify({
                'message': 'Plant watered!',
                'plant': plant.to_simple_dict()
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
