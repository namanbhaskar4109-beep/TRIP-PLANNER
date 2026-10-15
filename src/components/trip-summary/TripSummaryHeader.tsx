import React from 'react';
import {
  Calendar,
  Users,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  Hotel,
  Tag,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import { TripPlan, Accommodation } from '../../types/trip';
import { getDestinationHeroImage } from '../../services/sampleData';

interface TripSummaryHeaderProps {
  trip: TripPlan;
  totalSpent: number;
  selectedHotel?: Accommodation;
  onEditTrip: () => void;
  onJumpToSection: (sectionId: string) => void;
}

export const TripSummaryHeader: React.FC<TripSummaryHeaderProps> = ({
  trip,
  totalSpent,
  selectedHotel,
  onEditTrip,
  onJumpToSection,
}) => {
  // Calculate duration in days & nights
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const remainingBudget = trip.budget - totalSpent;
  const percentSpent = Math.min(100, Math.round((totalSpent / (trip.budget || 1)) * 100));
  const isOverBudget = remainingBudget < 0;

  const heroImage = getDestinationHeroImage(trip.destination);

  const formattedStart = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedEnd = end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl border border-slate-800">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={trip.destination}
          className="w-full h-full object-cover opacity-35 transform scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Active Travel Plan
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {trip.destination}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-teal-400" />
                {formattedStart} — {formattedEnd}
                <span className="bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-300 font-semibold text-xs border border-slate-700 ml-1">
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
              </span>

              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-teal-400" />
                {trip.travelers} {trip.travelers === 1 ? 'Traveler' : 'Travelers'}
              </span>

              {selectedHotel && (
                <button
                  onClick={() => onJumpToSection('accommodations')}
                  className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 text-teal-300 px-3 py-1 rounded-lg border border-teal-500/30 transition"
                  title="View booked stay"
                >
                  <Hotel className="w-3.5 h-3.5 text-teal-400" />
                  <span>Stay: <strong>{selectedHotel.name}</strong></span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Edit Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEditTrip}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 shadow-sm transition active:scale-95"
            >
              Modify Trip Details
            </button>
          </div>
        </div>

        {/* Interests Pills */}
        {trip.interests && trip.interests.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-1">
              <Tag className="w-3.5 h-3.5 text-teal-400" /> Interests:
            </span>
            {trip.interests.map((interest) => (
              <span
                key={interest}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-200 border border-slate-700/60"
              >
                {interest}
              </span>
            ))}
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Card 1: Total Budget */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Total Trip Budget</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              ${trip.budget.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ${Math.round(trip.budget / nights)} / night target
            </p>
          </div>

          {/* Card 2: Total Spent */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Total Recorded Spent</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-rose-500' : percentSpent > 80 ? 'bg-amber-400' : 'bg-teal-400'
                  }`}
                  style={{ width: `${percentSpent}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-bold">{percentSpent}%</span>
            </div>
          </div>

          {/* Card 3: Budget Remaining */}
          <div
            className={`backdrop-blur-md rounded-2xl p-4 sm:p-5 border shadow-md transition ${
              isOverBudget
                ? 'bg-rose-950/40 border-rose-800/80'
                : remainingBudget < 300
                ? 'bg-amber-950/30 border-amber-800/60'
                : 'bg-emerald-950/30 border-emerald-800/60'
            }`}
          >
            <div className="flex items-center justify-between text-slate-300 text-xs font-semibold mb-2">
              <span>Remaining Budget</span>
              {isOverBudget ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : (
                <PiggyBank className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold ${
                isOverBudget ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isOverBudget ? `-$${Math.abs(remainingBudget).toLocaleString()}` : `$${remainingBudget.toLocaleString()}`}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {isOverBudget
                ? 'Budget exceeded! Adjust expenses below'
                : `$${Math.round(remainingBudget / nights)} per remaining night`}
            </p>
          </div>

          {/* Card 4: Daily Per Person Allowance */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
              <span>Daily / Traveler</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300">
              ${Math.round(trip.budget / (nights * trip.travelers))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Estimated daily spending allocation
            </p>
          </div>
        </div>

        {/* Quick Jump Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> Jump to:
          </span>
          <button
            onClick={() => onJumpToSection('weather')}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            🌤️ Live Weather
          </button>
          <button
            onClick={() => onJumpToSection('accommodations')}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            🏨 Stays ({selectedHotel ? '1 Chosen' : 'Recommendations'})
          </button>
          <button
            onClick={() => onJumpToSection('places')}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            📍 Nearby Places & Food
          </button>
          <button
            onClick={() => onJumpToSection('expenses')}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            💰 Expenses Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
