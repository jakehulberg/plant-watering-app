# Plant Watering App - Frontend

This frontend has been migrated to **Vite + React + Tailwind CSS + shadcn/ui** for a modern, beautiful UI.

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:5173` (Vite's default port)

3. **Build for production:**
   ```bash
   npm run build
   ```

## What's Changed

- ✅ Migrated from Create React App to **Vite** (faster builds, better HMR)
- ✅ Added **Tailwind CSS** for utility-first styling
- ✅ Integrated **shadcn/ui** components for beautiful, accessible UI
- ✅ Refactored all components to use modern React patterns
- ✅ Added icons from **lucide-react**
- ✅ Improved UX with loading states, error handling, and better visual feedback

## Components Used

- **Card** - For plant list and form containers
- **Button** - For actions (add plant, water plant)
- **Input** - For form fields
- **Label** - For form labels
- **Badge** - For moisture level indicators
- **Alert** - For success/error messages

## Features

- Beautiful gradient background
- Responsive grid layout for plant cards
- Color-coded moisture level badges
- Smart date formatting (Today, Yesterday, X days ago)
- Loading states and error handling
- Modern, accessible UI components

## API Proxy

The Vite config proxies API requests to your Flask backend at `http://localhost:5001`. Make sure your Flask server is running!
