import { TripPlan, Expense } from '../types/trip';

const TRIP_STORAGE_KEY = 'trip_planner_current_trip_v1';
const EXPENSES_STORAGE_KEY = 'trip_planner_expenses_v1';

// Helper to format dates relative to today
function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function getDefaultTrip(): TripPlan {
  return {
    id: 'demo-trip-paris',
    destination: 'Paris, France',
    startDate: getDateStr(3),
    endDate: getDateStr(7),
    travelers: 2,
    budget: 1800,
    interests: ['Culture & History', 'Food & Dining', 'Art & Museums'],
    selectedHotelId: 'acc-1',
    savedPlaceIds: ['place-att-1', 'place-food-1'],
  };
}

export function getDefaultExpenses(): Expense[] {
  return [
    {
      id: 'exp-1',
      description: 'Grand Heritage Hotel 2-Night Deposit',
      amount: 390,
      category: 'Accommodation',
      date: getDateStr(3),
    },
    {
      id: 'exp-2',
      description: 'Le Petit Bistro Tasting Dinner',
      amount: 85,
      category: 'Food & Drinks',
      date: getDateStr(3),
    },
    {
      id: 'exp-3',
      description: 'City Metro & Transit Passes (2 travelers)',
      amount: 45,
      category: 'Transportation',
      date: getDateStr(4),
    },
    {
      id: 'exp-4',
      description: 'Historic Cathedral & Museum Access Pass',
      amount: 40,
      category: 'Activities',
      date: getDateStr(4),
    },
  ];
}

export function loadTripFromStorage(): TripPlan {
  try {
    const raw = localStorage.getItem(TRIP_STORAGE_KEY);
    if (!raw) return getDefaultTrip();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.destination) return getDefaultTrip();
    return parsed;
  } catch (e) {
    console.error('Error loading trip from localStorage:', e);
    return getDefaultTrip();
  }
}

export function saveTripToStorage(trip: TripPlan): void {
  try {
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trip));
  } catch (e) {
    console.error('Error saving trip to localStorage:', e);
  }
}

export function loadExpensesFromStorage(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) return getDefaultExpenses();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return getDefaultExpenses();
    return parsed;
  } catch (e) {
    console.error('Error loading expenses from localStorage:', e);
    return getDefaultExpenses();
  }
}

export function saveExpensesToStorage(expenses: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses to localStorage:', e);
  }
}

export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(TRIP_STORAGE_KEY);
    localStorage.removeItem(EXPENSES_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing localStorage:', e);
  }
}
