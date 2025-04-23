# 🌿 Plant Watering App

This is a full-stack smart plant watering system built with **Flask**, **React**, and **SQLite**. It tracks plant watering schedules, checks weather conditions via OpenWeatherMap, and uses logic to recommend when to water each plant — optionally factoring in soil moisture readings.

---

## 🚀 Features

- ✅ Flask backend API with SQLite database
- ✅ React frontend with dynamic plant list and form
- ✅ Smart watering recommendations based on:
  - Time since last watering
  - Temperature & humidity forecasts
  - Upcoming rain
  - Soil moisture (optional)
- ✅ Works on desktop and mobile browsers
- ✅ Environment-secure API key handling (`.env`)

---

## 🛠️ Tech Stack

| Layer      | Tech         |
|------------|--------------|
| Backend    | Python, Flask, SQLAlchemy |
| Frontend   | React (Vite or CRA) |
| Styling    | Basic CSS or Tailwind (optional) |
| Database   | SQLite       |
| API        | OpenWeatherMap |

---

## ⚙️ Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/jakehulberg/plant-watering-app.git
cd plant-watering-app

2. Set up the backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Create a .env file:

OPENWEATHER_API_KEY=your_actual_key_here

Start Flask:

python app.py

3. Start the React frontend
cd frontend
npm install
npm start
Access it at:
http://localhost:3000

🔐 Security Notice

This project previously contained a hardcoded OpenWeatherMap API key. That key has:

✅ Been revoked and is no longer active
✅ Been replaced with a secure environment variable (OPENWEATHER_API_KEY)
✅ Been removed from all current code and commits
🚫 May still exist in Git history, but poses no risk due to deactivation
The project now uses a .env file (excluded from Git) for key handling.

📂 Folder Structure

plant-watering-app/
├── app.py               # Flask backend
├── .env                 # Environment variables (not pushed)
├── frontend/            # React frontend
│   ├── src/
│   └── ...
├── templates/           # Flask-rendered HTML (legacy)
├── static/              # Static CSS or images
└── plants.db            # SQLite DB (optional in .gitignore)
✅ To Do / Next Steps

 Add soil moisture sensor input UI
 Style frontend with Tailwind
 Deploy Flask + React to cloud
 Add watering history logs
 Add authentication (optional)
📬 Contact

Made with ☕ and plants by @jakehulberg

Feel free to fork, contribute, or reach out.