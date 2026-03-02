"""Page routes for serving the React frontend."""
from flask import Blueprint, current_app, send_from_directory
import os

pages_bp = Blueprint('pages', __name__)


@pages_bp.route('/', defaults={'path': ''})
@pages_bp.route('/<path:path>')
def serve_react(path):
    """Serve the React frontend for all non-API routes."""
    dist = current_app.static_folder
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    return send_from_directory(dist, 'index.html')
