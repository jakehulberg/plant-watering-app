# 🌿 Plant Watering App

A full-stack smart plant watering system built with **Flask**, **React**, and **SQLite**. Tracks plant watering schedules, checks weather via Open-Meteo, and recommends when to water each plant based on weather conditions and time since last watering.

Designed to run permanently on a **Raspberry Pi** and be used from a mobile browser while in the garden.

---

## 🚀 Features

- Add, edit, and delete plants
- Per-plant watering interval based on the app's plant profile catalog
- Watering Command Center on the Plants tab with:
  - Total, Needs Attention, Overdue, Due Soon, and Watered Today summary cards
  - Search by plant name
  - Filters for All, Needs Attention, Overdue, Due Soon, and Watered Today
  - Urgency-sorted plant cards so the plants that need water float to the top
  - Status badges plus plant type, watering threshold, and days-since-watered metadata
- Smart watering recommendations based on:
  - Time since last watering
  - Temperature & humidity forecasts
  - Upcoming rain
- Watering history log — every "Water Now" tap is recorded
- Weather page with current temp, humidity, and rain forecast
- Database view — full table of all plants
- Recommendations auto-refresh when a plant is watered
- Mobile-optimized UI (large tap targets, full-width buttons)
- Automated quality gates with backend tests, frontend tests, linting, and production build checks

---

## 🛠️ Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Backend    | Python, Flask, SQLAlchemy, Gunicorn |
| Frontend   | React 18, Vite, Tailwind CSS, shadcn/ui |
| Database   | SQLite (via Flask-SQLAlchemy + Flask-Migrate) |
| Weather    | Open-Meteo API                    |
| Deployment | Raspberry Pi + systemd            |

---

## ⚙️ Local Development

### 1. Clone the repo
```bash
git clone https://github.com/jakehulberg/plant-watering-app.git
cd plant-watering-app
```

### 2. Set up the backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:
```
WEATHER_LOCATION=New Caney, Texas, US
# Optional: skip geocoding by setting explicit coordinates
# WEATHER_LATITUDE=30.155
# WEATHER_LONGITUDE=-95.215
PORT=5001
DEBUG=False
```

### 3. Install and build the React frontend
```bash
cd frontend
npm ci
npm run build
cd ..
```

The built frontend is committed in `frontend/dist` so a simple Pi/home deployment can run after `git pull`. Rebuilding locally is still recommended during development and before committing frontend changes.

### 4. Run the app
```bash
python app.py
```

Access at `http://localhost:5001`

---

## 🥧 Deploying to Raspberry Pi

### 1. Install dependencies
```bash
sudo apt-get install -y nodejs
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### 2. Build the frontend
```bash
cd frontend && npm ci && npm run build && cd ..
```

### 3. Create `.env` on the Pi
```
WEATHER_LOCATION=New Caney, Texas, US
# Optional: skip geocoding by setting explicit coordinates
# WEATHER_LATITUDE=30.155
# WEATHER_LONGITUDE=-95.215
PORT=5001
DEBUG=False
```

### 4. Set up the database
```bash
FLASK_APP=app:create_app venv/bin/flask db upgrade
```

### 5. Create a systemd service
```bash
sudo nano /etc/systemd/system/plant-app.service
```

```ini
[Unit]
Description=Plant Watering App
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/plant-watering-app
EnvironmentFile=/home/pi/plant-watering-app/.env
ExecStart=/home/pi/plant-watering-app/venv/bin/gunicorn -w 2 -b 0.0.0.0:5001 "app:create_app()"
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable plant-app
sudo systemctl start plant-app
```

Access at `http://<pi-ip>:5001`

---

## 🔄 Updating the App (after git pull on Pi)

Because `frontend/dist` is committed, most updates can stay simple:

```bash
git pull
FLASK_APP=app:create_app venv/bin/flask db upgrade
sudo systemctl restart plant-app
```

If you changed frontend source locally on the Pi, rebuild before restarting:

```bash
cd frontend && npm ci && npm run build && cd ..
```

---

## 🗄️ Database Migrations

This project uses **Flask-Migrate** (Alembic) for schema changes.

**When you change a model (on Mac):**
```bash
FLASK_APP=app:create_app venv/bin/flask db migrate -m "describe the change"
git add migrations/ && git commit && git push
```

**On the Pi after pulling:**
```bash
FLASK_APP=app:create_app venv/bin/flask db upgrade
sudo systemctl restart plant-app
```

---

## 📂 Folder Structure

```
plant-watering-app/
├── app.py                  # App factory, Flask-Migrate setup
├── config.py               # Configuration from .env
├── database.py             # SQLAlchemy instance
├── models.py               # Plant, WateringHistory models
├── routes/
│   ├── plants.py           # CRUD + water + history API routes
│   ├── weather.py          # Weather API route
│   ├── recommendations.py  # Watering recommendation route
│   └── pages.py            # Serves React frontend
├── services/
│   ├── weather_service.py
│   └── recommendation_service.py
├── migrations/             # Flask-Migrate / Alembic migrations
├── frontend/               # React + Vite + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── App.jsx         # Tab navigation, state wiring
│   │   ├── PlantList.jsx   # Watering Command Center: stats, filters, search, plant cards
│   │   ├── plantStatus.js  # Frontend watering status helpers
│   │   ├── AddPlantForm.jsx
│   │   ├── WeatherPage.jsx
│   │   └── DatabasePage.jsx
│   └── dist/               # Built frontend (served by Flask, committed for simple Pi deploy)
├── tests/                  # Backend unittest route/service coverage
├── .github/workflows/      # CI quality gates
├── docs/                   # Phase implementation plans
├── .env                    # Not committed
└── requirements.txt
```

---

## ✅ Quality Gates

Run the same checks locally that GitHub Actions runs on every PR:

```bash
python3 -m py_compile app.py config.py database.py models.py routes/*.py services/*.py
python3 -m unittest discover -s tests -v
cd frontend
npm ci
npm test -- --run
npm run lint
npm run build
```

GitHub Actions also runs these backend and frontend checks automatically via `.github/workflows/quality-gates.yml`.

---

## 🔐 Security Notice

This project previously contained a hardcoded third-party weather API key in a stale backup file. The app now uses Open-Meteo, which does not require an API key, and `.gitignore` prevents local secrets/backups from being committed.

---

## 📬 Contact

Made with ☕ and plants by [@jakehulberg](https://github.com/jakehulberg)
