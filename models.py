"""Database models."""
from database import db


class Plant(db.Model):
    """Plant model for storing plant information."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    last_watered = db.Column(db.String(100), nullable=False)
    moisture_level = db.Column(db.Integer, nullable=True)
    
    def to_dict(self):
        """Convert plant to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'last_watered': self.last_watered,
            'moisture_level': self.moisture_level
        }
    
    def to_simple_dict(self):
        """Convert plant to simple dictionary (for backward compatibility)."""
        return {
            'id': self.id,
            'name': self.name,
            'last_watered': self.last_watered
        }
