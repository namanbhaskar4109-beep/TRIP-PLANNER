# Trip Planner — Travel Planning & Expense Management Web App with MongoDB Atlas

A modern, responsive travel-planning web application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS (v4)**, **Node.js/Express**, and **MongoDB Atlas**.

---

## 🔐 New: MongoDB Atlas Integration & Authentication

### 1. Modern Login & Registration Experience
- **Sign In & Create Account Tabs**: Seamless switching with smooth transitions.
- **Password Strength Analyzer**: Real-time evaluation (Weak, Fair, Strong) with visual progress feedback.
- **Show/Hide Password**: Convenient visibility toggle button.
- **Quick Demo Login**: 1-click test credentials autofill (`demo.traveler@tripplanner.com`).
- **Secure Password Hashing**: Passwords are encrypted server-side using `bcryptjs` with salt rounds.
- **JWT Authentication**: Secure Bearer tokens with 7-day expiration.
- **User Profile Dropdown**: Shows logged-in user avatar, MongoDB Atlas sync status, and sign-out action.

### 2. MongoDB Atlas Cloud Integration
- **Live Connection Diagnostics**: Shows cluster host, active database, ping latency (ms), and connection health.
- **Atlas Setup & Testing Modal**: Built-in modal to test custom MongoDB Atlas URIs live and view a 4-step setup guide.
- **Cloud Trip Sync**: Authenticated users can save and synchronize their travel itineraries and expense budgets directly to MongoDB Atlas.
- **Resilient Fallback**: If the MongoDB Atlas cluster or server is offline, the app continues to operate smoothly using local storage with clear status notifications.

---

## 🌟 Key Features

### 1. Trip Configuration & Personalization
- Enter any destination (or pick popular presets like Paris, Tokyo, New York, Bali, Rome, London, Barcelona).
- Select departure and return travel dates with automatic night calculation and validation.
- Adjust travelers count and set your total trip budget with quick presets ($800 – $6,000).
- Toggle among 8 travel interests: *Culture & History, Food & Dining, Nature & Outdoors, Shopping & Markets, Nightlife & Bars, Adventure & Sports, Relaxation & Spa, Art & Museums*.

### 2. Smart Accommodation Recommendations
- Stays are scored and ranked dynamically based on your budget per night, trip duration, and selected interests.
- Displays price per night, total calculated stay cost, star ratings, review counts, distance from center, and amenity chips.
- Transparently labeled with **SAMPLE DATA** tags.
- One-click **"Select This Stay"** and shortcut **"Log to Trip Expenses"**.
- Filter by amenities (WiFi, Breakfast, Pool, Spa, Kitchen) and sort by Match Score, Price, Rating, or Proximity.

### 3. Nearby Highlights: Food, Attractions & Activities
- Browse curated places categorized into Attractions, Food & Dining, and Activities.
- Displays opening hours, estimated duration, price/free access, and distance.
- Highlights items matching your personal travel interests.
- **"Save to Itinerary / Wishlist"** toggle with real-time counter.

### 4. Live Open-Meteo Weather Outlook
- Directly queries Open-Meteo's geocoding and 7-day live weather forecast APIs.
- Displays current temperature, weather condition icon, daily highs/lows, precipitation risk (%), and wind speed.
- Toggle between **°C (Celsius)** and **°F (Fahrenheit)**.

### 5. Real-Time Budget & Expense Tracker
- **Budget KPI Bar**: Total Budget, Total Spent, and Remaining Budget with color-coded warning alerts when approaching or exceeding limits.
- **Progress Bar**: Visual representation of budget utilization percentage.
- **Category Breakdown Cards**: Real-time spending analysis across *Accommodation, Food & Drinks, Transportation, Activities, Shopping, and Miscellaneous*.
- **Expense Logging Form**: Add expenses with description, amount, category, and date.
- **Interactive List & Management**: Filter by category, delete individual expenses, clear all, and **Export to CSV**.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```
*(or `pnpm install`)*

### 2. Configure MongoDB Atlas (.env)
Open `.env` (or copy from `.env.example`) and insert your MongoDB Atlas URI:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tripplanner?retryWrites=true&w=majority
JWT_SECRET=super_secure_jwt_token_secret_trip_planner_atlas_2025
PORT=5000
```

> **Tip**: Make sure your MongoDB Atlas cluster has **Network Access** set to allow `0.0.0.0/0` (or your current IP) and a database user is created in **Database Access**.

### 3. Run the Application
To run both the **Vite frontend** and **Express MongoDB Atlas backend** simultaneously:
```bash
npm run dev:all
```

Or run them in separate terminal windows:
```bash
# Terminal 1: Backend Express Server (port 5000)
npm run server

# Terminal 2: Vite React Frontend (port 5173)
npm run dev
```

Visit **http://localhost:5173** in your browser!


### Quick Start
```bash
# 1. Install dependencies
pnpm install
# or: npm install

# 2. Start the development server
pnpm dev
# or: npm run dev

# 3. Open in your browser
# http://localhost:5173
```

### Production Build
```bash
# Type check and build production bundle
pnpm build
# or: npm run build

# Preview production build locally
pnpm preview
# or: npm run preview
```

---

## 📁 Project Architecture

```
g:/MINI/
├── index.html                 # App HTML entry with Plus Jakarta Sans typography
├── package.json               # Dependencies and scripts (Vite, React 19, Tailwind CSS)
├── tsconfig.json              # Modern TypeScript bundler configuration
├── vite.config.ts             # Vite configuration with React & Tailwind v4 plugins
├── public/                    # Static assets
└── src/
    ├── main.tsx               # App mount entry
    ├── App.tsx                # Master state controller & dashboard coordinator
    ├── index.css              # Tailwind CSS imports & custom styling
    ├── vite-env.d.ts          # Vite client types
    ├── types/
    │   └── trip.ts            # Type definitions (TripPlan, Accommodation, Expense, Weather)
    ├── services/
    │   ├── weatherService.ts  # Open-Meteo geocoding & forecast client (no fake weather)
    │   ├── sampleData.ts      # Curated sample stays, places & smart ranking algorithm
    │   └── storageService.ts  # LocalStorage persistence & default trip state
    └── components/
        ├── common/
        │   ├── Navbar.tsx     # Header navigation with brand and quick reset
        │   └── Footer.tsx     # Application footer with tech stack overview
        ├── trip-summary/
        │   └── TripSummaryHeader.tsx # Hero banner with destination photo & budget KPIs
        ├── trip-form/
        │   └── TripSearchForm.tsx    # Search form for destination, dates, budget & interests
        ├── weather/
        │   └── WeatherCard.tsx       # Live meteorological forecast & out-of-range handler
        ├── accommodations/
        │   └── AccommodationSection.tsx # Ranked stays, filters, and stay selector
        ├── places/
        │   └── PlacesSection.tsx     # Food, attractions, and activity wishlist
        └── expenses/
            └── ExpenseTracker.tsx    # Real-time budget tracker, category breakdown & CSV export
```

---

## 📄 License
MIT — Created for modern travel planning.
