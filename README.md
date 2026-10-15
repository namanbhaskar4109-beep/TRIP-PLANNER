# Trip Planner — Responsive Travel Planning & Expense Management Web App

A modern, responsive travel-planning web application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS (v4)**, and **Lucide React**.

This is a **100% frontend-only MVP**:
- **Zero Login / Authentication Friction**
- **Zero Backend / Database Requirements**
- **Zero Paid APIs** (Uses free, open **Open-Meteo** geocoding & forecast endpoints)
- **Local Persistence** via browser `localStorage`
- **Instant VS Code Compatibility**

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
- Transparently labeled with **SAMPLE DATA** tags.

### 4. Live Open-Meteo Weather Outlook
- Directly queries Open-Meteo's geocoding and 7-day live weather forecast APIs.
- Displays current temperature, weather condition icon, daily highs/lows, precipitation risk (%), and wind speed.
- Toggle between **°C (Celsius)** and **°F (Fahrenheit)**.
- **Helpful Out-of-Range Handling**: If travel dates exceed Open-Meteo's 14-day forecast window or are in the past, displays a friendly explanation and **never invents fake weather**. Includes a shortcut to view today's live 7-day forecast.

### 5. Real-Time Budget & Expense Tracker
- **Budget KPI Bar**: Total Budget, Total Spent, and Remaining Budget with color-coded warning alerts when approaching or exceeding limits.
- **Progress Bar**: Visual representation of budget utilization percentage.
- **Category Breakdown Cards**: Real-time spending analysis across *Accommodation, Food & Drinks, Transportation, Activities, Shopping, and Miscellaneous*.
- **Expense Logging Form**: Add expenses with description, amount, category, and date.
- **Interactive List & Management**: Filter by category, delete individual expenses, clear all, and **Export to CSV**.

### 6. LocalStorage Persistence & Demo Reset
- Trip plans and expenses automatically save to browser `localStorage`.
- Includes a **"Reset Demo"** button in the navigation header to quickly restore the default showcase scenario.

---

## 🚀 Getting Started in VS Code

### Prerequisites
- Node.js (v18+)
- Package manager: `pnpm`, `npm`, or `yarn`

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
