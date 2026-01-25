# Project Structure

This project has been refactored into a modular structure for better organization and maintainability.

## Directory Structure

```
plant-watering-app/
├── app.py                 # Main application entry point
├── config.py              # Application configuration
├── database.py            # Database initialization
├── models.py              # Database models
├── requirements.txt       # Python dependencies
├── routes/                # API routes (organized by feature)
│   ├── __init__.py
│   ├── plants.py          # Plant-related routes
│   ├── weather.py         # Weather API routes
│   ├── recommendations.py # Recommendation routes
│   └── pages.py           # HTML page routes
├── services/              # Business logic services
│   ├── __init__.py
│   ├── weather_service.py      # Weather API integration
│   └── recommendation_service.py # Watering recommendation logic
├── templates/             # HTML templates
├── static/                # Static files (CSS, etc.)
└── frontend/              # React frontend
```

## Key Components

### Configuration (`config.py`)
- Centralized configuration management
- Supports PostgreSQL (via `DATABASE_URL` env var) or SQLite (fallback)
- Environment variable loading via `python-dotenv`

### Database (`database.py`, `models.py`)
- `database.py`: SQLAlchemy database instance
- `models.py`: Database models (Plant model with helper methods)

### Services (`services/`)
- **weather_service.py**: Handles OpenWeatherMap API calls
- **recommendation_service.py**: Contains business logic for generating watering recommendations

### Routes (`routes/`)
- **plants.py**: Plant CRUD operations (`/api/plants`, `/plants`, `/plants/<id>/water`)
- **weather.py**: Weather data endpoint (`/weather`)
- **recommendations.py**: Recommendation endpoint (`/recommendation`)
- **pages.py**: HTML page routes (`/`, `/weather-page`, `/database`)

### Main Application (`app.py`)
- Creates Flask app using factory pattern
- Registers all blueprints
- Initializes database

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single responsibility
2. **Testability**: Services and routes can be tested independently
3. **Maintainability**: Easy to find and modify specific functionality
4. **Scalability**: Can easily extract services to microservices later
5. **Team Collaboration**: Multiple developers can work on different files

## Database Support

The application supports both PostgreSQL and SQLite:

- **PostgreSQL**: Set `DATABASE_URL` environment variable
  - Format: `postgresql://username:password@localhost:5432/dbname`
- **SQLite**: Default fallback (no configuration needed)

## Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional)
export DATABASE_URL=postgresql://user:pass@localhost:5432/plants
export OPENWEATHER_API_KEY=your_key_here

# Run the application
python app.py
```

## Migration from Old Structure

The refactored code maintains 100% backward compatibility:
- All API endpoints work the same way
- All routes are preserved
- Database models are unchanged
- No breaking changes to the frontend
