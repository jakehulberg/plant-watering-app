"""Database models."""
from database import db


class Plant(db.Model):
    """Plant model for storing plant information."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_watered = db.Column(db.String(100), nullable=False)
    history = db.relationship('WateringHistory', backref='plant', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Convert plant to dictionary."""
        from services.recommendation_service import get_plant_type, PLANT_PROFILES
        plant_type = get_plant_type(self.name)
        profile = PLANT_PROFILES[plant_type]
        return {
            'id': self.id,
            'name': self.name,
            'last_watered': self.last_watered,
            'water_threshold': profile['water_threshold'],
            'plant_type': plant_type,
        }

    def to_simple_dict(self):
        """Convert plant to simple dictionary (for backward compatibility)."""
        return {
            'id': self.id,
            'name': self.name,
            'last_watered': self.last_watered
        }


class WateringHistory(db.Model):
    """Log of every time a plant was watered."""
    id = db.Column(db.Integer, primary_key=True)
    plant_id = db.Column(db.Integer, db.ForeignKey('plant.id'), nullable=False)
    watered_at = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'plant_id': self.plant_id,
            'watered_at': self.watered_at
        }
