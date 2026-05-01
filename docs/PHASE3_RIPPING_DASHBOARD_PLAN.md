# Phase 3 Ripping Dashboard Implementation Plan

**Goal:** Make the app feel immediately more useful by turning the Plants tab into an at-a-glance watering command center.

**Architecture:** Keep the Flask API unchanged for this phase and derive dashboard status from existing `/api/plants` data on the frontend. Add pure helper functions for plant status calculation so the UI behavior is testable without network or browser timing hacks.

**Tech Stack:** React/Vite, existing UI components, Vitest + React Testing Library.

---

## Task 1: Add plant status helpers

**Objective:** Centralize watering status calculations for total, overdue, due soon, watered today, and healthy plants.

**Files:**
- Create: `frontend/src/plantStatus.js`
- Create: `frontend/src/plantStatus.test.js`

**Behavior:**
- `getPlantStatus(plant, now)` returns `overdue`, `due-soon`, `watered-today`, or `healthy`.
- `getDaysSinceWatered(plant, now)` returns a non-negative integer when date is valid.
- `summarizePlants(plants, now)` returns counts for `total`, `overdue`, `dueSoon`, `wateredToday`, and `healthy`.
- `sortPlantsByStatus(plants, now)` sorts overdue first, then due soon, then healthy, then watered today.

**Verification:**

```bash
cd frontend
npm test -- --run src/plantStatus.test.js
```

## Task 2: Upgrade PlantList into a command center

**Objective:** Make the Plants tab visibly better with summary stat cards, search, filters, sorted priority ordering, status labels, and plant metadata.

**Files:**
- Modify: `frontend/src/PlantList.jsx`
- Create/modify: `frontend/src/PlantList.test.jsx`

**Behavior:**
- Shows summary cards: Total Plants, Needs Attention, Overdue, Due Soon, Watered Today.
- Adds search by plant name.
- Adds filter chips/buttons: All, Needs Attention, Overdue, Due Soon, Watered Today.
- Plant cards show plant type, watering threshold, days since watered, and current status.
- Cards are sorted by status urgency by default.
- Empty filter/search state explains no plants match.

**Verification:**

```bash
cd frontend
npm test -- --run src/PlantList.test.jsx
npm test -- --run
```

## Task 3: Tighten app-level tests for visible Phase 3 behavior

**Objective:** Ensure the main dashboard renders the upgraded command center with real-ish plant data.

**Files:**
- Modify: `frontend/src/App.test.jsx`

**Behavior:**
- App homepage renders summary stats and attention filters when plants exist.
- Existing tab switching tests still pass.

**Verification:**

```bash
cd frontend
npm test -- --run src/App.test.jsx
```

## Final verification

```bash
python3 -m py_compile app.py config.py database.py models.py routes/*.py services/*.py
python3 -m unittest discover -s tests -v
cd frontend && npm test -- --run && npm run lint && npm run build
cd .. && git diff --check
```
