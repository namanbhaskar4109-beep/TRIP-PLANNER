import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TripPlan, Accommodation, Expense } from './types/trip';
import {
  loadTripFromStorage,
  saveTripToStorage,
  loadExpensesFromStorage,
  saveExpensesToStorage,
  getDefaultTrip,
  getDefaultExpenses,
} from './services/storageService';
import {
  generateSampleAccommodations,
  generateSamplePlaces,
} from './services/sampleData';

import { Navbar } from './components/common/Navbar';
import { TripSummaryHeader } from './components/trip-summary/TripSummaryHeader';
import { TripSearchForm } from './components/trip-form/TripSearchForm';
import { WeatherCard } from './components/weather/WeatherCard';
import { AccommodationSection } from './components/accommodations/AccommodationSection';
import { PlacesSection } from './components/places/PlacesSection';
import { ExpenseTracker } from './components/expenses/ExpenseTracker';
import { Footer } from './components/common/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { AtlasConnectionModal } from './components/auth/AtlasConnectionModal';
import { CheckCircle2, X } from 'lucide-react';
import { fetchLatestAtlasTrip } from './services/apiClient';

function TripPlannerMain() {
  const [trip, setTrip] = useState<TripPlan>(loadTripFromStorage);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpensesFromStorage);
  const [isEditingTrip, setIsEditingTrip] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isAuthenticated, user, currentPath } = useAuth();
  const searchFormRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveTripToStorage(trip);
  }, [trip]);

  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // If user signs in and has a saved trip in MongoDB Atlas, offer welcome notice
  useEffect(() => {
    if (!isAuthenticated) return;

    let isSubscribed = true;
    async function loadCloudTrip() {
      try {
        const res = await fetchLatestAtlasTrip();
        if (res.success && res.data && isSubscribed) {
          showToast(`Welcome back, ${user?.name || 'Traveler'}! Cloud sync active.`);
        }
      } catch {
        // Fallback silently
      }
    }

    loadCloudTrip();
    return () => {
      isSubscribed = false;
    };
  }, [isAuthenticated, user]);

  // URL-based page routing for standalone /login, /signup, /forgot-password, /reset-password
  if (currentPath === '/login') {
    return <AuthPage initialMode="login" />;
  }
  if (currentPath === '/signup') {
    return <AuthPage initialMode="register" />;
  }
  if (currentPath === '/forgot-password') {
    return <AuthPage initialMode="forgot-password" />;
  }
  if (currentPath === '/reset-password') {
    return <AuthPage initialMode="reset-password" />;
  }

  // Generate sample data based on current destination
  const accommodations = useMemo(() => {
    return generateSampleAccommodations(trip.destination);
  }, [trip.destination]);

  const places = useMemo(() => {
    return generateSamplePlaces(trip.destination);
  }, [trip.destination]);

  // Selected hotel reference
  const selectedHotel = useMemo(() => {
    return accommodations.find((acc) => acc.id === trip.selectedHotelId);
  }, [accommodations, trip.selectedHotelId]);

  // Calculate nights
  const nights = useMemo(() => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.max(0, end.getTime() - start.getTime());
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [trip.startDate, trip.endDate]);

  // Total spent
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  // Handlers
  const handleSaveTrip = (updatedTrip: TripPlan) => {
    setTrip(updatedTrip);
    setIsEditingTrip(false);
    showToast(`Trip to ${updatedTrip.destination} updated successfully!`);
  };

  const handleSelectHotel = (hotel: Accommodation) => {
    if (trip.selectedHotelId === hotel.id) {
      setTrip((prev) => ({ ...prev, selectedHotelId: undefined }));
      showToast(`Removed ${hotel.name} from selected stay.`);
    } else {
      setTrip((prev) => ({ ...prev, selectedHotelId: hotel.id }));
      showToast(`Selected ${hotel.name} for your stay!`);
    }
  };

  const handleAddHotelToExpenses = (hotel: Accommodation, totalCost: number) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      description: `${hotel.name} (${nights} nights lodging)`,
      amount: totalCost,
      category: 'Accommodation',
      date: trip.startDate,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Added $${totalCost} for ${hotel.name} to your expenses!`);
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Recorded expense: "${newExpense.description}" ($${newExpense.amount})`);
  };

  const handleRemoveExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(`Removed expense: "${target?.description || 'Item'}"`);
  };

  const handleClearExpenses = () => {
    setExpenses([]);
    showToast('All trip expenses cleared.');
  };

  const handleToggleSavePlace = (placeId: string) => {
    setTrip((prev) => {
      const isSaved = prev.savedPlaceIds.includes(placeId);
      const updatedSaved = isSaved
        ? prev.savedPlaceIds.filter((id) => id !== placeId)
        : [...prev.savedPlaceIds, placeId];
      showToast(isSaved ? 'Removed from saved places' : 'Saved to itinerary wishlist!');
      return { ...prev, savedPlaceIds: updatedSaved };
    });
  };

  const handleResetToDemo = () => {
    const defaultTrip = getDefaultTrip();
    const defaultExp = getDefaultExpenses();
    setTrip(defaultTrip);
    setExpenses(defaultExp);
    setIsEditingTrip(false);
    showToast('Reset to default Paris showcase trip and sample budget.');
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSearch = () => {
    setIsEditingTrip(true);
    setTimeout(() => {
      searchFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Sticky Navigation */}
      <Navbar
        destination={trip.destination}
        savedPlacesCount={trip.savedPlaceIds.length}
        currentTrip={trip}
        currentExpenses={expenses}
        onResetToDemo={handleResetToDemo}
        onScrollToSearch={scrollToSearch}
        onScrollToExpenses={() => scrollToSection('expenses')}
        onToast={showToast}
      />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Destination & Budget Hero Header */}
        <TripSummaryHeader
          trip={trip}
          totalSpent={totalSpent}
          selectedHotel={selectedHotel}
          onEditTrip={() => {
            setIsEditingTrip(!isEditingTrip);
            if (!isEditingTrip) {
              setTimeout(() => {
                searchFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 50);
            }
          }}
          onJumpToSection={scrollToSection}
        />

        {/* Expandable/Inline Trip Customization Search Form */}
        {isEditingTrip && (
          <div ref={searchFormRef} className="animate-in fade-in slide-in-from-top-4 duration-300">
            <TripSearchForm
              initialTrip={trip}
              onSaveTrip={handleSaveTrip}
              onCancel={() => setIsEditingTrip(false)}
            />
          </div>
        )}

        {/* 1. Live Weather Forecast (Open-Meteo API) */}
        <section id="weather">
          <WeatherCard
            destination={trip.destination}
            startDate={trip.startDate}
            endDate={trip.endDate}
          />
        </section>

        {/* 2. Recommended Accommodations (Ranked by budget & preferences) */}
        <AccommodationSection
          accommodations={accommodations}
          budget={trip.budget}
          nights={nights}
          travelers={trip.travelers}
          interests={trip.interests}
          selectedHotelId={trip.selectedHotelId}
          onSelectHotel={handleSelectHotel}
          onAddHotelToExpenses={handleAddHotelToExpenses}
        />

        {/* 3. Browse Nearby Places, Food & Activities */}
        <PlacesSection
          places={places}
          savedPlaceIds={trip.savedPlaceIds}
          userInterests={trip.interests}
          onToggleSavePlace={handleToggleSavePlace}
        />

        {/* 4. Real-time Budget & Expense Tracker */}
        <ExpenseTracker
          expenses={expenses}
          budget={trip.budget}
          onAddExpense={handleAddExpense}
          onRemoveExpense={handleRemoveExpense}
          onClearExpenses={handleClearExpenses}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal (Sign In / Create Account / Reset with MongoDB Atlas) */}
      <AuthModal />

      {/* Atlas Connection & Diagnostics Modal */}
      <AtlasConnectionModal />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TripPlannerMain />
    </AuthProvider>
  );
}

export default App;
