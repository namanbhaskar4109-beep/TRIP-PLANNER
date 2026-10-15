import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  Check,
  Landmark,
  Utensils,
  Trees,
  ShoppingBag,
  Wine,
  Compass,
  Waves,
  Palette,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TripPlan, TravelInterest } from '../../types/trip';

interface TripSearchFormProps {
  initialTrip: TripPlan;
  onSaveTrip: (updatedTrip: TripPlan) => void;
  onCancel?: () => void;
}

const POPULAR_DESTINATIONS = [
  'Paris, France',
  'Tokyo, Japan',
  'New York, USA',
  'Bali, Indonesia',
  'Rome, Italy',
  'London, UK',
  'Barcelona, Spain',
  'Swiss Alps, Switzerland',
];

const AVAILABLE_INTERESTS: { id: TravelInterest; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Culture & History', label: 'Culture & History', icon: Landmark },
  { id: 'Food & Dining', label: 'Food & Culinary', icon: Utensils },
  { id: 'Nature & Outdoors', label: 'Nature & Parks', icon: Trees },
  { id: 'Shopping & Markets', label: 'Shopping & Markets', icon: ShoppingBag },
  { id: 'Nightlife & Bars', label: 'Nightlife & Bars', icon: Wine },
  { id: 'Adventure & Sports', label: 'Adventure & Sports', icon: Compass },
  { id: 'Relaxation & Spa', label: 'Relaxation & Spa', icon: Waves },
  { id: 'Art & Museums', label: 'Art & Museums', icon: Palette },
];

export const TripSearchForm: React.FC<TripSearchFormProps> = ({
  initialTrip,
  onSaveTrip,
  onCancel,
}) => {
  const [destination, setDestination] = useState(initialTrip.destination);
  const [startDate, setStartDate] = useState(initialTrip.startDate);
  const [endDate, setEndDate] = useState(initialTrip.endDate);
  const [travelers, setTravelers] = useState(initialTrip.travelers);
  const [budget, setBudget] = useState(initialTrip.budget);
  const [interests, setInterests] = useState<TravelInterest[]>(initialTrip.interests);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (interest: TravelInterest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleQuickBudget = (amount: number) => {
    setBudget(amount);
  };

  const handleDestinationSelect = (dest: string) => {
    setDestination(dest);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!destination.trim()) {
      setError('Please provide a travel destination.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both departure and return travel dates.');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('Return date must be after your departure date.');
      return;
    }

    if (travelers < 1) {
      setError('Please enter at least 1 traveler.');
      return;
    }

    if (budget <= 0) {
      setError('Please enter a budget greater than $0.');
      return;
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti not supported
    }

    onSaveTrip({
      ...initialTrip,
      destination: destination.trim(),
      startDate,
      endDate,
      travelers: Number(travelers),
      budget: Number(budget),
      interests,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 transition-all">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Customize Your Trip Preferences
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update your destination, budget, and travel interests to re-rank recommendations instantly.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            Close
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Destination Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Where do you want to go?
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-teal-600" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, Tokyo, Bali, Rome, London..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-medium placeholder-slate-400 text-sm sm:text-base outline-none transition"
              required
            />
          </div>

          {/* Popular Destination Quick Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Popular:</span>
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => handleDestinationSelect(dest)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                  destination.toLowerCase() === dest.toLowerCase()
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {dest.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Dates & Travelers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm outline-none transition"
                required
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm outline-none transition"
                required
              />
            </div>
          </div>

          {/* Travelers Counter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Travelers
            </label>
            <div className="relative flex items-center">
              <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min={1}
                max={20}
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800 text-sm outline-none transition"
                required
              />
            </div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Total Budget (USD $)
            </label>
            <span className="text-xs text-slate-500">
              Approx. ${Math.round(budget / Math.max(1, travelers))} per person
            </span>
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3.5 top-3.5 w-5 h-5 text-emerald-600" />
            <input
              type="number"
              min={100}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="e.g. 2000"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-semibold text-base outline-none transition"
              required
            />
          </div>

          {/* Quick Budget Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
            {[800, 1500, 2500, 4000, 6000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickBudget(amt)}
                className={`text-xs px-3 py-1 rounded-lg border transition ${
                  budget === amt
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Interests & Travel Preferences */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Your Travel Interests
            </label>
            <span className="text-xs text-teal-700 font-semibold">
              {interests.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {AVAILABLE_INTERESTS.map(({ id, label, icon: Icon }) => {
              const isSelected = interests.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleInterest(id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs ring-1 ring-teal-500/30 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                      isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs truncate flex-1">{label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 text-sm font-semibold transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition active:scale-95"
          >
            <span>Update Trip & Re-rank Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
