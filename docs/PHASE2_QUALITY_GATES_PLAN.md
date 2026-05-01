# Phase 2 Quality Gates Implementation Plan

> **Implementation note:** Follow a test-first workflow and keep each commit focused.

**Goal:** Add automated backend, frontend, and CI quality gates before larger application refactors.

**Architecture:** Keep the current Flask + React/Vite deployment model unchanged. Add tests around existing behavior first, then wire CI to run the same verification commands used locally.

**Tech Stack:** Python unittest + Flask test client; Vitest + React Testing Library + jsdom; GitHub Actions.

---

## Tasks

### Task 1: Backend route coverage

**Objective:** Cover existing API behavior without changing production behavior unless tests reveal a real defect.

**Files:**
- Create/modify: `tests/test_phase2_routes.py`
- Read as needed: `routes/plants.py`, `routes/recommendations.py`, `routes/weather.py`, `models.py`, `database.py`

**Tests:**
- Plant CRUD: list, create, update, delete.
- Watering endpoint updates `last_watered` and creates history.
- Recommendation endpoint returns data for an existing plant.
- Weather endpoint returns normalized service output and gracefully handles service exceptions.

**Verification:**

```bash
python3 -m unittest tests.test_phase2_routes -v
python3 -m unittest discover -s tests -v
```

### Task 2: Frontend component tests

**Objective:** Add a lightweight frontend test harness and cover user-facing behavior around add plant, weather loading, and navigation/rendering.

**Files:**
- Modify: `frontend/package.json`
- Modify/create: `frontend/src/*.test.jsx`
- Create: `frontend/src/test/setup.js`

**Tests:**
- AddPlantForm calls API and invokes `onPlantAdded` on success.
- WeatherPage clears stale error and renders fetched Open-Meteo-style data.
- App renders core navigation/views without crashing.

**Verification:**

```bash
cd frontend
npm test -- --run
npm run lint
npm run build
```

### Task 3: CI workflow

**Objective:** Make GitHub PR checks run the same backend/frontend quality gates.

**Files:**
- Create: `.github/workflows/quality-gates.yml`

**Checks:**
- Python dependencies install.
- Python compile passes.
- Python unittest discovery passes.
- Frontend dependencies install.
- Frontend tests pass.
- Frontend lint passes.
- Frontend build passes.

**Verification:**

```bash
git diff --check
python3 -m py_compile app.py config.py database.py models.py routes/*.py services/*.py
python3 -m unittest discover -s tests -v
cd frontend && npm test -- --run && npm run lint && npm run build
```
