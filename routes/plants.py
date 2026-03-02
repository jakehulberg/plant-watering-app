"""Plant-related API routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
from models import Plant, WateringHistory
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

            # watering_interval_days is optional
            watering_interval_days = None
            if 'watering_interval_days' in data:
                try:
                    watering_interval_days = int(data['watering_interval_days'])
                    if watering_interval_days < 1 or watering_interval_days > 30:
                        return jsonify({'error': 'watering_interval_days must be between 1 and 30'}), 400
                except (ValueError, TypeError):
                    return jsonify({'error': 'Invalid watering_interval_days format'}), 400

            try:
                new_plant = Plant(
                    name=data['name'].strip(),
                    last_watered=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    moisture_level=moisture_level,
                    watering_interval_days=watering_interval_days
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


@plants_bp.route('/api/plants/<int:plant_id>', methods=['PATCH'])
def update_plant(plant_id):
    """Update a plant's name and/or watering_interval_days."""
    try:
        plant = Plant.query.get(plant_id)
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        if 'name' in data:
            plant.name = data['name'].strip()

        if 'watering_interval_days' in data:
            try:
                watering_interval_days = int(data['watering_interval_days'])
                if watering_interval_days < 1 or watering_interval_days > 30:
                    return jsonify({'error': 'watering_interval_days must be between 1 and 30'}), 400
                plant.watering_interval_days = watering_interval_days
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid watering_interval_days format'}), 400

        try:
            db.session.commit()
            return jsonify({'message': 'Plant updated!', 'plant': plant.to_dict()})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@plants_bp.route('/api/plants/<int:plant_id>', methods=['DELETE'])
def delete_plant(plant_id):
    """Delete a plant (cascade removes its watering history)."""
    try:
        plant = Plant.query.get(plant_id)
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        try:
            db.session.delete(plant)
            db.session.commit()
            return jsonify({'message': 'Plant deleted!'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Database error: {str(e)}'}), 500

    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500


@plants_bp.route('/api/plants/<int:plant_id>/history', methods=['GET'])
def get_plant_history(plant_id):
    """Return watering history for a plant, newest first, limited to 20 entries."""
    try:
        plant = Plant.query.get(plant_id)
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        try:
            history = (
                WateringHistory.query
                .filter_by(plant_id=plant_id)
                .order_by(WateringHistory.watered_at.desc())
                .limit(20)
                .all()
            )
            return jsonify([h.to_dict() for h in history])
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
    """Route to update watering time and log a WateringHistory entry."""
    try:
        plant = Plant.query.get(plant_id)
        if not plant:
            return jsonify({'error': 'Plant not found'}), 404

        try:
            watered_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            plant.last_watered = watered_at

            history_entry = WateringHistory(
                plant_id=plant_id,
                watered_at=watered_at
            )
            db.session.add(history_entry)
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
