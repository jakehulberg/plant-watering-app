"""Main application entry point."""
from flask import Flask
from flask_migrate import Migrate
from config import Config
from database import db
from models import Plant
from routes.plants import plants_bp
from routes.weather import weather_bp
from routes.recommendations import recommendations_bp
from routes.pages import pages_bp

migrate = Migrate()


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(plants_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(pages_bp)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
