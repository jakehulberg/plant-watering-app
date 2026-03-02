"""Database models."""
from database import db


class Plant(db.Model):
    """Plant model for storing plant information."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_watered = db.Column(db.String(100), nullable=False)
    moisture_level = db.Column(db.Integer, nullable=True)
    watering_interval_days = db.Column(db.Integer, nullable=True, default=3)
    history = db.relationship('WateringHistory', backref='plant', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Convert plant to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'last_watered': self.last_watered,
            'moisture_level': self.moisture_level,
            'watering_interval_days': self.watering_interval_days if self.watering_interval_days is not None else 3
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
