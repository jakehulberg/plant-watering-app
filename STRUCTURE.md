# Project Structure

This project has been refactored into a modular structure for better organization and maintainability.

## Directory Structure

```
plant-watering-app/
├── app.py                 # App factory and main application entry point
├── config.py              # Application configuration
├── database.py            # Database initialization
├── models.py              # Plant and WateringHistory database models
├── requirements.txt       # Python dependencies
├── routes/                # API routes (organized by feature)
│   ├── __init__.py
│   ├── plants.py          # Plant CRUD, watering, and history routes
│   ├── weather.py         # Weather API routes
│   ├── recommendations.py # Recommendation routes
│   └── pages.py           # React frontend catch-all routes
├── services/              # Business logic services
│   ├── __init__.py
│   ├── weather_service.py      # Open-Meteo weather API integration
│   └── recommendation_service.py # Watering recommendation logic
├── tests/                 # Backend unittest coverage
├── frontend/              # React + Vite frontend
│   ├── src/               # React source, components, and frontend tests
│   └── dist/              # Built frontend served by Flask
├── .github/workflows/     # GitHub Actions quality gates
└── docs/                  # Implementation plans and project docs
```

## Key Components

### Configuration (`config.py`)
- Centralized configuration management
- Supports PostgreSQL (via `DATABASE_URL` env var) or SQLite (fallback)
- Environment variable loading via `python-dotenv`

### Database (`database.py`, `models.py`)
- `database.py`: SQLAlchemy database instance
- `models.py`: `Plant` and `WateringHistory` models; plant serialization includes profile-derived `plant_type` and `water_threshold` fields used by the frontend command center

### Services (`services/`)
- **weather_service.py**: Handles Open-Meteo geocoding and forecast API calls
- **recommendation_service.py**: Contains business logic for generating watering recommendations

### Routes (`routes/`)
- **plants.py**: Plant CRUD operations (`/api/plants`, `/plants`, `/plants/<id>/water`)
- **weather.py**: Weather data endpoint (`/weather`)
- **recommendations.py**: Recommendation endpoint (`/recommendation`)
- **pages.py**: HTML page routes (`/`, `/weather-page`, `/database`)

### Frontend (`frontend/`)
- React 18 + Vite app served by Flask from `frontend/dist`
- `PlantList.jsx`: Watering Command Center with summary cards, search, filters, urgency sorting, and status badges
- `plantStatus.js`: Pure helper functions for days-since-watered, status classification, summaries, and sorting
- Vitest + React Testing Library cover frontend behavior

### Quality Gates
- `.github/workflows/quality-gates.yml` runs backend compile/tests and frontend tests/lint/build on every PR and push to `main`


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
# Install backend dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Optional configuration
export WEATHER_LOCATION="New Caney, Texas, US"
# Optional: export WEATHER_LATITUDE=30.155 WEATHER_LONGITUDE=-95.215

# Build frontend during development
cd frontend && npm ci && npm run build && cd ..

# Run the application
python app.py
```

## Testing and CI

```bash
python3 -m py_compile app.py config.py database.py models.py routes/*.py services/*.py
python3 -m unittest discover -s tests -v
cd frontend && npm test -- --run && npm run lint && npm run build
```

GitHub Actions runs these checks automatically via the Quality Gates workflow.

## Migration from Old Structure

The refactored code maintained endpoint compatibility during the original split into routes and services. Current development also keeps the Flask API + React/Vite deployment model intact while adding tests, CI, and the Watering Command Center UI.
- All API endpoints work the same way
- All routes are preserved
- Database models are unchanged
- No breaking changes to the frontend
